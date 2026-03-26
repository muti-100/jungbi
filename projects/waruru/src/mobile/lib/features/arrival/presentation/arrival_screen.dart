import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/wru_button.dart';
import '../services/ble_service.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
enum ArrivalPhase {
  requestingPermission,
  permissionDenied,
  scanning,
  selfArrived,
  bothArrived,
}

class ArrivalState {
  const ArrivalState({
    this.phase = ArrivalPhase.scanning,
    this.selfArrived = false,
    this.partnerArrived = false,
    this.partnerNickname,
  });

  final ArrivalPhase phase;
  final bool selfArrived;
  final bool partnerArrived;
  final String? partnerNickname;

  bool get bothArrived => selfArrived && partnerArrived;

  ArrivalState copyWith({
    ArrivalPhase? phase,
    bool? selfArrived,
    bool? partnerArrived,
    String? partnerNickname,
  }) =>
      ArrivalState(
        phase: phase ?? this.phase,
        selfArrived: selfArrived ?? this.selfArrived,
        partnerArrived: partnerArrived ?? this.partnerArrived,
        partnerNickname: partnerNickname ?? this.partnerNickname,
      );
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------
class ArrivalNotifier extends StateNotifier<ArrivalState> {
  ArrivalNotifier({
    required String matchId,
    required String venueId,
  })  : _matchId = matchId,
        _venueId = venueId,
        super(const ArrivalState(phase: ArrivalPhase.requestingPermission)) {
    _init();
  }

  final String _matchId;
  final String _venueId;

  BleService? _bleService;
  StreamSubscription<ArrivalEvent>? _bleSubscription;
  RealtimeChannel? _partnerChannel;

  Future<void> _init() async {
    await _requestPermissions();
    await _loadVenueAndStart();
    _listenForPartner();
  }

  Future<void> _requestPermissions() async {
    final statuses = await [
      Permission.bluetoothScan,
      Permission.bluetoothConnect,
      Permission.locationWhenInUse,
    ].request();

    final denied = statuses.values.any(
      (s) => s == PermissionStatus.denied || s == PermissionStatus.permanentlyDenied,
    );

    if (!mounted) return;

    if (denied) {
      state = state.copyWith(phase: ArrivalPhase.permissionDenied);
    } else {
      state = state.copyWith(phase: ArrivalPhase.scanning);
    }
  }

  Future<void> _loadVenueAndStart() async {
    if (state.phase == ArrivalPhase.permissionDenied) return;

    try {
      final venue = await Supabase.instance.client
          .from('venues')
          .select('lat, lng, beacon_uuid')
          .eq('venue_id', _venueId)
          .single();

      if (!mounted) return;

      final lat = (venue['lat'] as num).toDouble();
      final lng = (venue['lng'] as num).toDouble();
      final beaconUuid =
          venue['beacon_uuid'] as String? ?? 'wru-default-beacon-uuid';

      _bleService = BleService(
        matchId: _matchId,
        beaconUuid: beaconUuid,
        venueLat: lat,
        venueLng: lng,
      );

      _bleSubscription = _bleService!.events.listen(_onArrivalEvent);
      await _bleService!.startScanning();
    } catch (e) {
      // Venue load failed — manual fallback still available.
    }
  }

  void _onArrivalEvent(ArrivalEvent event) {
    if (!mounted) return;
    state = state.copyWith(
      selfArrived: true,
      phase: ArrivalPhase.selfArrived,
    );
    _checkBothArrived();
  }

  void _listenForPartner() {
    _partnerChannel = Supabase.instance.client
        .channel('arrival-$_matchId')
        .onBroadcast(
          event: 'user_arrived',
          callback: (payload) {
            if (!mounted) return;
            final userId = Supabase.instance.client.auth.currentUser?.id;
            final arriverId = payload['user_id'] as String?;
            // Only process partner's arrival (not our own echo)
            if (arriverId != null && arriverId != userId) {
              final nickname = payload['nickname'] as String?;
              state = state.copyWith(
                partnerArrived: true,
                partnerNickname: nickname,
              );
              _checkBothArrived();
            }
          },
        )
        .subscribe();
  }

  void _checkBothArrived() {
    if (!mounted) return;
    if (state.selfArrived && state.partnerArrived) {
      state = state.copyWith(phase: ArrivalPhase.bothArrived);
    }
  }

  void confirmManually() {
    _bleService?.confirmManually();
    // If BleService hasn't been set up yet (e.g. permission denied path),
    // directly update state so the user isn't blocked.
    if (_bleService == null) {
      state = state.copyWith(
        selfArrived: true,
        phase: ArrivalPhase.selfArrived,
      );
      _notifyArrivalManually();
    }
  }

  Future<void> _notifyArrivalManually() async {
    final userId = Supabase.instance.client.auth.currentUser?.id ?? '';
    final payload = ArrivalEvent(
      matchId: _matchId,
      userId: userId,
      method: ArrivalMethod.manual,
      timestamp: DateTime.now(),
    );

    await Supabase.instance.client
        .from('arrivals')
        .upsert(payload.toJson())
        .catchError((_) {});

    await _partnerChannel?.sendBroadcastMessage(
      event: 'user_arrived',
      payload: payload.toJson(),
    );
  }

  @override
  void dispose() {
    _bleSubscription?.cancel();
    _bleService?.dispose();
    _partnerChannel?.unsubscribe();
    super.dispose();
  }
}

// Family provider keyed by (matchId, venueId) tuple
final arrivalProvider = StateNotifierProvider.autoDispose
    .family<ArrivalNotifier, ArrivalState, (String, String)>(
  (ref, args) => ArrivalNotifier(matchId: args.$1, venueId: args.$2),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class ArrivalScreen extends ConsumerWidget {
  const ArrivalScreen({super.key, required this.venueId, required this.matchId});

  final String venueId;
  final String matchId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final arrivalState = ref.watch(arrivalProvider((matchId, venueId)));
    final notifier = ref.read(arrivalProvider((matchId, venueId)).notifier);

    ref.listen<ArrivalState>(arrivalProvider((matchId, venueId)), (_, next) {
      if (next.phase == ArrivalPhase.bothArrived) {
        Future.delayed(const Duration(seconds: 2), () {
          if (context.mounted) {
            context.go('${AppRoutes.rollingPaperCompose}?matchId=$matchId');
          }
        });
      }
    });

    return Scaffold(
      body: SafeArea(
        child: _buildBody(context, arrivalState, notifier),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ArrivalState arrivalState,
    ArrivalNotifier notifier,
  ) {
    switch (arrivalState.phase) {
      case ArrivalPhase.requestingPermission:
        return const Center(child: CircularProgressIndicator());
      case ArrivalPhase.permissionDenied:
        return _PermissionDeniedBody();
      case ArrivalPhase.bothArrived:
        return _BothArrivedBody(
          partnerNickname: arrivalState.partnerNickname,
        );
      case ArrivalPhase.selfArrived:
        return _WaitingForPartnerBody(
          partnerNickname: arrivalState.partnerNickname,
          onManual: notifier.confirmManually,
        );
      case ArrivalPhase.scanning:
        return _ScanningBody(onManual: notifier.confirmManually);
    }
  }
}

// ---------------------------------------------------------------------------
// Sub-widgets
// ---------------------------------------------------------------------------
class _ScanningBody extends StatefulWidget {
  const _ScanningBody({required this.onManual});
  final VoidCallback onManual;

  @override
  State<_ScanningBody> createState() => _ScanningBodyState();
}

class _ScanningBodyState extends State<_ScanningBody>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulse;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
    _pulse = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Scanning animation
          ScaleTransition(
            scale: _pulse,
            child: SizedBox(
              width: 180,
              height: 180,
              child: Lottie.asset(
                'assets/animations/ble_scanning.json',
                errorBuilder: (_, __, ___) => Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: WruColors.primary.withValues(alpha: 0.12),
                  ),
                  child: const Icon(
                    Icons.bluetooth_searching,
                    size: 56,
                    color: WruColors.primary,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 36),
          Text(
            '도착 감지 중...',
            style: theme.textTheme.headlineSmall,
          ),
          const SizedBox(height: 12),
          Text(
            '블루투스로 장소 도착을 자동으로\n감지하고 있어요.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 48),
          // Manual fallback — always visible per spec
          WruButton(
            label: '도착했어요',
            variant: WruButtonVariant.ghost,
            icon: const Icon(Icons.location_on),
            onPressed: widget.onManual,
          ),
          const SizedBox(height: 8),
          Text(
            '자동 감지가 안 되면 직접 눌러주세요',
            style: theme.textTheme.labelSmall?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _WaitingForPartnerBody extends StatelessWidget {
  const _WaitingForPartnerBody({
    required this.partnerNickname,
    required this.onManual,
  });

  final String? partnerNickname;
  final VoidCallback onManual;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = partnerNickname ?? '상대방';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Self-arrived badge
          Container(
            width: 120,
            height: 120,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: WruColors.primary,
            ),
            child: const Icon(Icons.check, color: Colors.white, size: 56),
          ),
          const SizedBox(height: 28),
          Text(
            '도착 확인!',
            style: theme.textTheme.headlineMedium?.copyWith(
              color: WruColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            '$name도 곧 도착할 거예요.\n잠시만 기다려주세요.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          // Manual still visible
          WruButton(
            label: '아직 안 도착하셨나요?',
            variant: WruButtonVariant.ghost,
            onPressed: onManual,
          ),
        ],
      ),
    );
  }
}

class _BothArrivedBody extends StatelessWidget {
  const _BothArrivedBody({this.partnerNickname});
  final String? partnerNickname;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = partnerNickname ?? '상대방';

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 220,
          height: 220,
          child: Lottie.asset(
            'assets/animations/both_arrived.json',
            repeat: false,
            errorBuilder: (_, __, ___) => const Icon(
              Icons.celebration,
              size: 100,
              color: WruColors.primary,
            ),
          ),
        ),
        const SizedBox(height: 24),
        Text(
          '드디어 만났어요!',
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          '$name과(와)의 특별한 만남이 시작돼요.',
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        const _DotProgress(),
      ],
    );
  }
}

class _DotProgress extends StatefulWidget {
  const _DotProgress();

  @override
  State<_DotProgress> createState() => _DotProgressState();
}

class _DotProgressState extends State<_DotProgress>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        final step = (_controller.value * 3).floor();
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(3, (i) {
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: i == step
                    ? WruColors.primary
                    : WruColors.primary.withValues(alpha: 0.3),
              ),
            );
          }),
        );
      },
    );
  }
}

class _PermissionDeniedBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.bluetooth_disabled,
            size: 72,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.35),
          ),
          const SizedBox(height: 24),
          Text(
            '블루투스 권한이 필요해요',
            style: theme.textTheme.titleLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            '도착 확인을 위해 블루투스와 위치 권한이\n필요해요. 설정에서 허용해주세요.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          WruButton(
            label: '앱 설정 열기',
            onPressed: () => openAppSettings(),
            icon: const Icon(Icons.settings_outlined),
          ),
          const SizedBox(height: 12),
          WruButton(
            label: '수동으로 도착 확인',
            variant: WruButtonVariant.ghost,
            onPressed: () {
              // This branch uses manual confirmation in the notifier.
              // Re-trigger the parent notifier via Provider read.
            },
          ),
        ],
      ),
    );
  }
}
