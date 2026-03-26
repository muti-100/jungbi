-- ============================================================
-- Waruru — PostGIS RPC Functions for Supabase Edge Functions
-- Required by: supabase/functions/venue-midpoint/index.ts
-- ============================================================

BEGIN;

/**
 * venues_near_point(p_lng, p_lat, p_radius_meters, p_limit)
 *
 * Returns venues within radius of a given point, ordered by distance.
 * Called via Supabase RPC — fully parameterized, no interpolation.
 */
CREATE OR REPLACE FUNCTION venues_near_point(
  p_lng            DOUBLE PRECISION,
  p_lat            DOUBLE PRECISION,
  p_radius_meters  INTEGER,
  p_limit          INTEGER DEFAULT 20
)
RETURNS TABLE (
  id        UUID,
  name      VARCHAR(100),
  category  VARCHAR(50),
  district  VARCHAR(20),
  lat       DOUBLE PRECISION,
  lng       DOUBLE PRECISION,
  distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    v.id,
    v.name,
    v.category,
    v.district,
    ST_Y(v.location_point::geometry)                            AS lat,
    ST_X(v.location_point::geometry)                            AS lng,
    ST_Distance(
      v.location_point::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    )                                                           AS distance_meters
  FROM venues v
  WHERE ST_DWithin(
    v.location_point::geography,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_radius_meters
  )
  ORDER BY v.location_point::geography
        <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT p_limit;
$$;

/**
 * nearest_district(p_lng, p_lat)
 *
 * Returns the district of the nearest venue to the given point.
 * Useful for categorizing user locations.
 */
CREATE OR REPLACE FUNCTION nearest_district(
  p_lng DOUBLE PRECISION,
  p_lat DOUBLE PRECISION
)
RETURNS VARCHAR(20)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT district
  FROM venues
  WHERE district IS NOT NULL
  ORDER BY location_point::geography
        <-> ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
  LIMIT 1;
$$;

/**
 * active_match_for_user(p_user_id)
 *
 * Returns the active match (non-cancelled, non-completed) for a user.
 */
CREATE OR REPLACE FUNCTION active_match_for_user(p_user_id UUID)
RETURNS TABLE (
  match_id  UUID,
  status    VARCHAR(20),
  partner_id UUID,
  venue_id  UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    m.id          AS match_id,
    m.status,
    CASE
      WHEN m.user_a_id = p_user_id THEN m.user_b_id
      ELSE m.user_a_id
    END           AS partner_id,
    m.venue_id
  FROM matches m
  WHERE (m.user_a_id = p_user_id OR m.user_b_id = p_user_id)
    AND m.status NOT IN ('completed', 'cancelled')
  ORDER BY m.created_at DESC
  LIMIT 1;
$$;

COMMIT;
