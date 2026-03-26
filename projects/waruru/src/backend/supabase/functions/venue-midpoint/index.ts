/**
 * Supabase Edge Function: venue-midpoint
 * Runtime: Deno (Supabase Edge Runtime)
 *
 * POST /functions/v1/venue-midpoint
 * Body: { user_a_lat, user_a_lng, user_b_lat, user_b_lng }
 *
 * Algorithm:
 *   1. Compute geographic midpoint
 *   2. Query nearest district from PostGIS (venues table)
 *   3. Pull up to 20 candidate venues in that district
 *   4. Call self-hosted OSRM duration matrix API
 *   5. Score: -(|t_a - t_b| + 0.3 * max(t_a, t_b))
 *   6. Return top 3 venues sorted by score descending
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── Types ──────────────────────────────────────────────────────────────────────

interface RequestBody {
  user_a_lat: number;
  user_a_lng: number;
  user_b_lat: number;
  user_b_lng: number;
}

interface VenueRow {
  id: string;
  name: string;
  category: string;
  district: string;
  lat: number;
  lng: number;
}

interface ScoredVenue extends VenueRow {
  eta_a_seconds: number;
  eta_b_seconds: number;
  score: number;
}

interface OsrmTableResponse {
  durations: number[][];
  code: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const INITIAL_RADIUS_METERS = 500;
const EXPANDED_RADIUS_METERS = 1000;
const MIN_VENUE_COUNT = 3;
const MAX_OSRM_VENUES = 20;

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (req.method !== 'POST') {
    return errorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST is accepted');
  }

  // ── Parse and validate body ──────────────────────────────────────
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }

  const validationError = validateBody(body);
  if (validationError) {
    return errorResponse(400, 'VALIDATION_ERROR', validationError);
  }

  // ── Environment ──────────────────────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const osrmUrl = Deno.env.get('OSRM_URL');

  if (!supabaseUrl || !supabaseKey) {
    return errorResponse(500, 'CONFIG_ERROR', 'Missing Supabase environment variables');
  }

  if (!osrmUrl) {
    return errorResponse(500, 'CONFIG_ERROR', 'OSRM_URL environment variable is required');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // ── 1. Geographic midpoint ───────────────────────────────────────
  const midpoint = calcMidpoint(
    body.user_a_lat, body.user_a_lng,
    body.user_b_lat, body.user_b_lng,
  );

  // ── 2 + 3. Query venues near midpoint (PostGIS) ──────────────────
  let venues = await queryVenuesNear(supabase, midpoint, INITIAL_RADIUS_METERS);

  if (venues.length < MIN_VENUE_COUNT) {
    console.log(
      `Only ${venues.length} venues at ${INITIAL_RADIUS_METERS}m — expanding to ${EXPANDED_RADIUS_METERS}m`,
    );
    venues = await queryVenuesNear(supabase, midpoint, EXPANDED_RADIUS_METERS);
  }

  if (venues.length === 0) {
    return jsonResponse(200, {
      midpoint,
      venues: [],
      message: 'No venues found within expanded radius',
    });
  }

  const venueSubset = venues.slice(0, MAX_OSRM_VENUES);

  // ── 4 + 5. OSRM duration matrix + scoring ────────────────────────
  let scoredVenues: ScoredVenue[];
  try {
    scoredVenues = await scoreWithOsrm(
      osrmUrl,
      { lat: body.user_a_lat, lng: body.user_a_lng },
      { lat: body.user_b_lat, lng: body.user_b_lng },
      venueSubset,
    );
  } catch (err) {
    console.error('OSRM error:', err);
    return errorResponse(502, 'ROUTING_UNAVAILABLE', 'Routing service unavailable');
  }

  // ── 6. Top 3 by score ────────────────────────────────────────────
  const top3 = scoredVenues
    .sort((a, b) => b.score - a.score)
    .slice(0, MIN_VENUE_COUNT);

  return jsonResponse(200, { midpoint, venues: top3 });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return 'Body must be an object';

  const b = body as Record<string, unknown>;
  for (const key of ['user_a_lat', 'user_a_lng', 'user_b_lat', 'user_b_lng']) {
    if (typeof b[key] !== 'number') return `${key} must be a number`;
  }

  const { user_a_lat, user_a_lng, user_b_lat, user_b_lng } = b as RequestBody;
  if (user_a_lat < -90 || user_a_lat > 90) return 'user_a_lat out of range';
  if (user_b_lat < -90 || user_b_lat > 90) return 'user_b_lat out of range';
  if (user_a_lng < -180 || user_a_lng > 180) return 'user_a_lng out of range';
  if (user_b_lng < -180 || user_b_lng > 180) return 'user_b_lng out of range';

  return null;
}

function calcMidpoint(
  latA: number, lngA: number,
  latB: number, lngB: number,
): { lat: number; lng: number } {
  // Simple average — valid for distances within Seoul metro (<50km)
  return {
    lat: (latA + latB) / 2,
    lng: (lngA + lngB) / 2,
  };
}

async function queryVenuesNear(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  midpoint: { lat: number; lng: number },
  radiusMeters: number,
): Promise<VenueRow[]> {
  // PostGIS RPC — parameterized via Supabase RPC (no raw SQL interpolation)
  const { data, error } = await supabase.rpc('venues_near_point', {
    p_lng: midpoint.lng,
    p_lat: midpoint.lat,
    p_radius_meters: radiusMeters,
    p_limit: MAX_OSRM_VENUES,
  });

  if (error) {
    console.error('PostGIS query error:', error.message);
    return [];
  }

  return (data as Array<{
    id: string;
    name: string;
    category: string;
    district: string;
    lat: number;
    lng: number;
  }>).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    district: row.district,
    lat: row.lat,
    lng: row.lng,
  }));
}

async function scoreWithOsrm(
  osrmUrl: string,
  userA: { lat: number; lng: number },
  userB: { lat: number; lng: number },
  venues: VenueRow[],
): Promise<ScoredVenue[]> {
  // OSRM Table API coordinate string: lng,lat pairs separated by ;
  const coords = [
    `${userA.lng},${userA.lat}`,
    `${userB.lng},${userB.lat}`,
    ...venues.map((v) => `${v.lng},${v.lat}`),
  ].join(';');

  const destinationIndices = venues.map((_, i) => i + 2).join(';');

  const url =
    `${osrmUrl}/table/v1/driving/${coords}` +
    `?sources=0;1&destinations=${destinationIndices}&annotations=duration`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`OSRM returned HTTP ${response.status}`);
  }

  const data: OsrmTableResponse = await response.json();

  if (data.code !== 'Ok') {
    throw new Error(`OSRM error code: ${data.code}`);
  }

  // durations[0][i] = t_a (seconds from userA to venue i)
  // durations[1][i] = t_b (seconds from userB to venue i)
  return venues.map((venue, i) => {
    const tA = data.durations[0]?.[i] ?? 9999;
    const tB = data.durations[1]?.[i] ?? 9999;

    // Score formula: -(|t_a - t_b| + 0.3 * max(t_a, t_b))
    // Maximised when travel times are equal AND short
    const score = -(Math.abs(tA - tB) + 0.3 * Math.max(tA, tB));

    return {
      ...venue,
      eta_a_seconds: Math.round(tA),
      eta_b_seconds: Math.round(tB),
      score,
    };
  });
}

// ── Response helpers ─────────────────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
): Response {
  return jsonResponse(status, { error: { code, message } });
}
