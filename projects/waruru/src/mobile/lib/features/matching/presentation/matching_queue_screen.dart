import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/wru_button.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
enum QueueStatus { waiting, matched, timeout, cancelled }

class MatchingQueueState {
  const MatchingQueueState({
    this.status = QueueStatus.waiting,
    this.estimatedWaitSeconds,
    this.matchId,
    this.elapsedSeconds = 0,
    this.showBanner = false,
    this.bannerMessage,
  });

  final QueueStatus status;
  final int? estimatedWaitSeconds;
  final String? matchId;
  final int elapsedSeconds;
  final bool showBanner;
  final String? bannerMessage;

  static const int timeoutSeconds = 30 * 60; // 30 minutes

  MatchingQueueState copyWith({
    QueueStatus? status,
    int? estimatedWaitSeconds,
    String? matchId,
    int? elapsedSeconds,
    bool? showBanner,
    String? bannerMessage,
  }) =>
      MatchingQueueState(
        status: status ?? this.status,
        estimatedWaitSeconds: estimatedWaitSeconds ?? this.estimatedWaitSeconds,
        matchId: matchId ?? this.matchId,
        elapsedSeconds: elapsedSeconds ?? this.elapsedSeconds,
        showBanner: showBanner ?? this.showBanner,
        bannerMessage: bannerMessage ?? this.bannerMessage,
      );

  String get formattedWait {
    final secs = estimatedWaitSeconds;
    if (secs == null) return '잠시만 기다려주세요';
    if (secs < 60) return '약 $secs초 후 매칭될 것 같아요';
    final min = (secs / 60).round();
    return '약 $min분 후 매칭될 것 같아요';
  }

  String get elapsedFormatted {
    final m = (elapsedSeconds ~/ 60).toString().padLeft(2, '0');
    final s = (elapsedSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }
}

class MatchingQueueNotifier extends StateNotifier<MatchingQueueState> {
  MatchingQueueNotifier() : super(const MatchingQueueState()) {
    _startTimer();
    _subscribeToQueue();
  }

  Timer? _elapsedTimer;
  RealtimeChannel? _channel;

  void _startTimer() {
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      final next = state.elapsedSeconds + 1;
      if (next >= MatchingQueueState.timeoutSeconds) {
        state = state.copyWith(status: QueueStatus.timeout);
        _elapsedTimer?.cancel();
        _channel?.unsubscribe();
        return;
      }
      state = state.copyWith(elapsedSeconds: next);
    });
  }

  void _subscribeToQueue() {
    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId == null) return;

    _channel = Supabase.instance.client
        .channel('matching-queue-$userId')
        .onBroadcast(
          event: 'queue_status',
          callback: (payload) {
            if (!mounted) return;
            final estimatedWait = payload['estimated_wait_seconds'] as int?;
            state = state.copyWith(estimatedWaitSeconds: estimatedWait);
          },
        )
        .onBroadcast(
          event: 'match_found',
          callback: (payload) {
            if (!mounted) return;
            final matchId = payload['match_id'] as String?;
            if (matchId != null) {
              state = state.copyWith(
                status: QueueStatus.matched,
                matchId: matchId,
                showBanner: true,
                bannerMessage: '매칭 상대를 찾았어요!',
              );
              _elapsedTimer?.cancel();
            }
          },
        )
        .subscribe();
  }

  void cancelQueue() {
    _elapsedTimer?.cancel();
    _channel?.unsubscribe();
    state = state.copyWith(status: QueueStatus.cancelled);

    // Fire-and-forget cancel RPC
    Supabase.instance.client.rpc('cancel_matching_queue').catchError((_) {});
  }

  void dismissBanner() {
    state = state.copyWith(showBanner: false);
  }

  @override
  void dispose() {
    _elapsedTimer?.cancel();
    _channel?.unsubscribe();
    super.dispose();
  }
}

final matchingQueueProvider =
    StateNotifierProvider.autoDispose<MatchingQueueNotifier, MatchingQueueState>(
  (ref) => MatchingQueueNotifier(),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class MatchingQueueScreen extends ConsumerWidget {
  const MatchingQueueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queueState = ref.watch(matchingQueueProvider);
    final notifier = ref.read(matchingQueueProvider.notifier);
    final theme = Theme.of(context);

    // Navigate when matched
    ref.listen<MatchingQueueState>(matchingQueueProvider, (prev, next) {
      if (next.status == QueueStatus.matched && next.matchId != null) {
        Future.delayed(const Duration(milliseconds: 800), () {
          if (context.mounted) {
            context.go('${AppRoutes.matchCard}?matchId=${next.matchId}');
          }
        });
      }
    });

    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            child: _buildBody(context, theme, queueState, notifier),
          ),
          // Notification banner
          if (queueState.showBanner && queueState.bannerMessage != null)
            _NotificationBanner(
              message: queueState.bannerMessage!,
              onDismiss: notifier.dismissBanner,
            ),
        ],
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ThemeData theme,
    MatchingQueueState queueState,
    MatchingQueueNotifier notifier,
  ) {
    switch (queueState.status) {
      case QueueStatus.timeout:
        return _TimeoutState(onRetry: () => context.go(AppRoutes.matchingQueue));
      case QueueStatus.cancelled:
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) context.go(AppRoutes.bigFive);
        });
        return const SizedBox.shrink();
      case QueueStatus.matched:
        return _MatchedState();
      case QueueStatus.waiting:
        return _WaitingState(
          queueState: queueState,
          onCancel: notifier.cancelQueue,
        );
    }
  }
}

class _WaitingState extends StatelessWidget {
  const _WaitingState({
    required this.queueState,
    required this.onCancel,
  });

  final MatchingQueueState queueState;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Lottie animation — replace asset path once animation files are added
          SizedBox(
            width: 220,
            height: 220,
            child: _LottieOrPlaceholder(
              assetPath: 'assets/animations/matching_waiting.json',
              placeholderIcon: Icons.people_outline,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            '인연을 찾고 있어요',
            style: theme.textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            queueState.formattedWait,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          // Elapsed time
          Text(
            '대기 시간: ${queueState.elapsedFormatted}',
            style: theme.textTheme.labelMedium?.copyWith(
              color: WruColors.primary,
            ),
          ),
          const SizedBox(height: 48),
          WruButton(
            label: '매칭 취소',
            variant: WruButtonVariant.ghost,
            onPressed: onCancel,
          ),
        ],
      ),
    );
  }
}

class _MatchedState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 200,
            height: 200,
            child: _LottieOrPlaceholder(
              assetPath: 'assets/animations/match_found.json',
              placeholderIcon: Icons.favorite,
              placeholderColor: WruColors.primary,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            '매칭 성공!',
            style: theme.textTheme.headlineMedium?.copyWith(
              color: WruColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _TimeoutState extends StatelessWidget {
  const _TimeoutState({required this.onRetry});
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.hourglass_empty_rounded,
            size: 80,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 24),
          Text(
            '이번엔 인연을 못 찾았어요',
            style: theme.textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            '30분 동안 주변에 상대방이 없었어요.\n조금 뒤 다시 시도해보세요.',
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          WruButton(label: '다시 매칭하기', onPressed: onRetry),
        ],
      ),
    );
  }
}

class _NotificationBanner extends StatefulWidget {
  const _NotificationBanner({
    required this.message,
    required this.onDismiss,
  });

  final String message;
  final VoidCallback onDismiss;

  @override
  State<_NotificationBanner> createState() => _NotificationBannerState();
}

class _NotificationBannerState extends State<_NotificationBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    )..forward();
    _slide = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    // Auto-dismiss after 4 seconds
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        _controller.reverse().then((_) => widget.onDismiss());
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final safePadding = MediaQuery.of(context).padding.top;
    return Positioned(
      top: safePadding + 8,
      left: 16,
      right: 16,
      child: SlideTransition(
        position: _slide,
        child: Material(
          borderRadius: BorderRadius.circular(16),
          color: WruColors.primary,
          elevation: 8,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                const Icon(Icons.favorite, color: Colors.white, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    widget.message,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
                GestureDetector(
                  onTap: widget.onDismiss,
                  child: const Icon(Icons.close, color: Colors.white70, size: 18),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: plays Lottie if file exists, else shows placeholder icon.
// ---------------------------------------------------------------------------
class _LottieOrPlaceholder extends StatelessWidget {
  const _LottieOrPlaceholder({
    required this.assetPath,
    required this.placeholderIcon,
    this.placeholderColor,
  });

  final String assetPath;
  final IconData placeholderIcon;
  final Color? placeholderColor;

  @override
  Widget build(BuildContext context) {
    return Lottie.asset(
      assetPath,
      repeat: true,
      errorBuilder: (_, __, ___) => Icon(
        placeholderIcon,
        size: 100,
        color: placeholderColor ??
            Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.2),
      ),
    );
  }
}
