import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/wru_button.dart';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
class WruVenue {
  const WruVenue({
    required this.venueId,
    required this.name,
    required this.category,
    required this.lat,
    required this.lng,
    required this.distanceMeters,
    required this.etaMinutes,
    this.kakaoPlaceId,
  });

  final String venueId;
  final String name;
  final String category;
  final double lat;
  final double lng;
  final int distanceMeters;
  final int etaMinutes;
  final String? kakaoPlaceId;

  factory WruVenue.fromJson(Map<String, dynamic> json) => WruVenue(
        venueId: json['venue_id'] as String,
        name: json['name'] as String,
        category: json['category'] as String,
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        distanceMeters: json['distance_meters'] as int,
        etaMinutes: json['eta_minutes'] as int,
        kakaoPlaceId: json['kakao_place_id'] as String?,
      );

  String get formattedDistance {
    if (distanceMeters < 1000) return '${distanceMeters}m';
    return '${(distanceMeters / 1000).toStringAsFixed(1)}km';
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
class VenueSuggestionState {
  const VenueSuggestionState({
    this.venues = const [],
    this.isLoading = true,
    this.error,
    this.rerollCount = 0,
    this.midpointLat,
    this.midpointLng,
    this.selectedVenueId,
  });

  final List<WruVenue> venues;
  final bool isLoading;
  final String? error;
  final int rerollCount;
  final double? midpointLat;
  final double? midpointLng;
  final String? selectedVenueId;

  static const int maxRerolls = 2;

  bool get canReroll => rerollCount < maxRerolls;

  VenueSuggestionState copyWith({
    List<WruVenue>? venues,
    bool? isLoading,
    String? error,
    int? rerollCount,
    double? midpointLat,
    double? midpointLng,
    String? selectedVenueId,
  }) =>
      VenueSuggestionState(
        venues: venues ?? this.venues,
        isLoading: isLoading ?? this.isLoading,
        error: error ?? this.error,
        rerollCount: rerollCount ?? this.rerollCount,
        midpointLat: midpointLat ?? this.midpointLat,
        midpointLng: midpointLng ?? this.midpointLng,
        selectedVenueId: selectedVenueId ?? this.selectedVenueId,
      );
}

class VenueSuggestionNotifier extends StateNotifier<VenueSuggestionState> {
  VenueSuggestionNotifier(this._matchId) : super(const VenueSuggestionState()) {
    _fetchVenues();
  }

  final String _matchId;

  Future<void> _fetchVenues({int radiusMeters = 500}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final result = await Supabase.instance.client
          .rpc('suggest_venues', params: {
            'p_match_id': _matchId,
            'p_radius_meters': radiusMeters,
            'p_limit': 3,
          });

      if (!mounted) return;

      final raw = result as List<dynamic>;
      final venues = raw
          .map((e) => WruVenue.fromJson(e as Map<String, dynamic>))
          .toList();

      // Auto-expand radius when < 3 venues found
      if (venues.length < 3 && radiusMeters < 2000) {
        await _fetchVenues(radiusMeters: radiusMeters + 300);
        return;
      }

      // Extract midpoint from first RPC call extras if available
      final midpointData = (result as dynamic)?['midpoint'];
      final midLat = (midpointData?['lat'] as num?)?.toDouble();
      final midLng = (midpointData?['lng'] as num?)?.toDouble();

      // Fallback midpoint: average of venue coords
      final fallbackLat = venues.isNotEmpty
          ? venues.map((v) => v.lat).reduce((a, b) => a + b) / venues.length
          : 37.5665;
      final fallbackLng = venues.isNotEmpty
          ? venues.map((v) => v.lng).reduce((a, b) => a + b) / venues.length
          : 126.9780;

      state = state.copyWith(
        venues: venues,
        isLoading: false,
        midpointLat: midLat ?? fallbackLat,
        midpointLng: midLng ?? fallbackLng,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> reroll() async {
    if (!state.canReroll) return;
    state = state.copyWith(rerollCount: state.rerollCount + 1);
    await _fetchVenues();
  }

  void selectVenue(String venueId) {
    state = state.copyWith(selectedVenueId: venueId);
  }

  @override
  void dispose() {
    super.dispose();
  }
}

final venueSuggestionProvider = StateNotifierProvider.autoDispose
    .family<VenueSuggestionNotifier, VenueSuggestionState, String>(
  (ref, matchId) => VenueSuggestionNotifier(matchId),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class VenueSuggestionScreen extends ConsumerWidget {
  const VenueSuggestionScreen({super.key, required this.matchId});

  final String matchId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final venueState = ref.watch(venueSuggestionProvider(matchId));
    final notifier = ref.read(venueSuggestionProvider(matchId).notifier);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('만날 장소', style: theme.textTheme.titleMedium),
        automaticallyImplyLeading: false,
      ),
      body: venueState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : venueState.error != null
              ? _ErrorBody(
                  error: venueState.error!,
                  onRetry: notifier.reroll,
                )
              : _VenueBody(
                  venueState: venueState,
                  matchId: matchId,
                  notifier: notifier,
                ),
    );
  }
}

class _VenueBody extends ConsumerWidget {
  const _VenueBody({
    required this.venueState,
    required this.matchId,
    required this.notifier,
  });

  final VenueSuggestionState venueState;
  final String matchId;
  final VenueSuggestionNotifier notifier;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final midLat = venueState.midpointLat ?? 37.5665;
    final midLng = venueState.midpointLng ?? 126.9780;

    return Column(
      children: [
        // ---- Google Maps ----
        SizedBox(
          height: 220,
          child: GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(midLat, midLng),
              zoom: 15,
            ),
            markers: venueState.venues
                .map(
                  (v) => Marker(
                    markerId: MarkerId(v.venueId),
                    position: LatLng(v.lat, v.lng),
                    infoWindow: InfoWindow(title: v.name),
                    icon: BitmapDescriptor.defaultMarkerWithHue(
                      v.venueId == venueState.selectedVenueId
                          ? BitmapDescriptor.hueOrange
                          : BitmapDescriptor.hueRed,
                    ),
                    onTap: () => notifier.selectVenue(v.venueId),
                  ),
                )
                .toSet(),
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            mapToolbarEnabled: false,
          ),
        ),

        // ---- Venue cards ----
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            children: [
              ...venueState.venues.map(
                (venue) => _VenueCard(
                  venue: venue,
                  isSelected: venue.venueId == venueState.selectedVenueId,
                  onTap: () => notifier.selectVenue(venue.venueId),
                ),
              ),
              const SizedBox(height: 16),
              // Re-roll button
              WruButton(
                label: venueState.canReroll
                    ? '다른 장소 추천받기 (${VenueSuggestionState.maxRerolls - venueState.rerollCount}회 남음)'
                    : '더 이상 추천할 수 없어요',
                variant: WruButtonVariant.ghost,
                onPressed: venueState.canReroll ? notifier.reroll : null,
              ),
              const SizedBox(height: 12),
              // Confirm button
              WruButton(
                label: '이 장소로 가기',
                onPressed: venueState.selectedVenueId != null
                    ? () => context.go(
                          '${AppRoutes.arrival}'
                          '?venueId=${venueState.selectedVenueId}'
                          '&matchId=$matchId',
                        )
                    : null,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ],
    );
  }
}

class _VenueCard extends StatelessWidget {
  const _VenueCard({
    required this.venue,
    required this.isSelected,
    required this.onTap,
  });

  final WruVenue venue;
  final bool isSelected;
  final VoidCallback onTap;

  static const _categoryEmoji = <String, String>{
    '카페': '☕',
    '레스토랑': '🍽️',
    '바': '🍸',
    '공원': '🌿',
    '문화': '🎨',
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final emoji = _categoryEmoji[venue.category] ?? '📍';

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected ? WruColors.primary : theme.colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: WruColors.primary.withValues(alpha: 0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          children: [
            // Category emoji circle
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: WruColors.primary.withValues(alpha: 0.10),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(emoji, style: const TextStyle(fontSize: 22)),
              ),
            ),
            const SizedBox(width: 14),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(venue.name, style: theme.textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text(
                    venue.category,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.straighten,
                          size: 13,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.45)),
                      const SizedBox(width: 3),
                      Text(
                        venue.formattedDistance,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Icon(Icons.directions_walk,
                          size: 13,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.45)),
                      const SizedBox(width: 3),
                      Text(
                        '${venue.etaMinutes}분',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            // KakaoMap deep-link
            IconButton(
              tooltip: '카카오맵으로 보기',
              onPressed: () => _openKakaoMap(venue),
              icon: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE500), // KakaoMap yellow
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('K', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _openKakaoMap(WruVenue venue) async {
    Uri uri;
    if (venue.kakaoPlaceId != null) {
      uri = Uri.parse(
        'kakaomap://place?id=${venue.kakaoPlaceId}',
      );
    } else {
      uri = Uri.parse(
        'kakaomap://look?p=${venue.lat},${venue.lng}',
      );
    }

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      // Fallback: open KakaoMap web
      final webUri = Uri.parse(
        'https://map.kakao.com/link/map/${Uri.encodeComponent(venue.name)},${venue.lat},${venue.lng}',
      );
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    }
  }
}

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.error, required this.onRetry});

  final String error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.location_off_outlined,
                size: 72,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
            const SizedBox(height: 20),
            Text('장소를 불러오지 못했어요',
                style: theme.textTheme.titleMedium, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(error,
                style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5)),
                textAlign: TextAlign.center),
            const SizedBox(height: 32),
            WruButton(label: '다시 시도', onPressed: onRetry),
          ],
        ),
      ),
    );
  }
}
