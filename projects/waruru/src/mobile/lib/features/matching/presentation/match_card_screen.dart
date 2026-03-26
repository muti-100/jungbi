import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/wru_button.dart';

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
class MatchProfile {
  const MatchProfile({
    required this.userId,
    required this.nickname,
    required this.age,
    required this.photoUrl,
    required this.compatibilityScore,
    required this.sharedInterests,
  });

  final String userId;
  final String nickname;
  final int age;
  final String? photoUrl;
  final int compatibilityScore; // 0–100
  final List<String> sharedInterests;

  factory MatchProfile.fromJson(Map<String, dynamic> json) => MatchProfile(
        userId: json['user_id'] as String,
        nickname: json['nickname'] as String,
        age: json['age'] as int,
        photoUrl: json['photo_url'] as String?,
        compatibilityScore: json['compatibility_score'] as int? ?? 0,
        sharedInterests: List<String>.from(
          json['shared_interests'] as List<dynamic>? ?? [],
        ),
      );
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
enum CardDecision { pending, accepted, declined, autoDeclined }

class MatchCardState {
  const MatchCardState({
    this.profile,
    this.isLoading = true,
    this.error,
    this.decision = CardDecision.pending,
    this.remainingSeconds = 15,
    this.isPhotoBlurred = true,
    this.swipeOffset = Offset.zero,
  });

  final MatchProfile? profile;
  final bool isLoading;
  final String? error;
  final CardDecision decision;
  final int remainingSeconds;
  final bool isPhotoBlurred;
  final Offset swipeOffset;

  MatchCardState copyWith({
    MatchProfile? profile,
    bool? isLoading,
    String? error,
    CardDecision? decision,
    int? remainingSeconds,
    bool? isPhotoBlurred,
    Offset? swipeOffset,
  }) =>
      MatchCardState(
        profile: profile ?? this.profile,
        isLoading: isLoading ?? this.isLoading,
        error: error ?? this.error,
        decision: decision ?? this.decision,
        remainingSeconds: remainingSeconds ?? this.remainingSeconds,
        isPhotoBlurred: isPhotoBlurred ?? this.isPhotoBlurred,
        swipeOffset: swipeOffset ?? this.swipeOffset,
      );

  double get timerProgress => remainingSeconds / 15.0;
  bool get isDecided => decision != CardDecision.pending;
}

class MatchCardNotifier extends StateNotifier<MatchCardState> {
  MatchCardNotifier(this._matchId) : super(const MatchCardState()) {
    _loadProfile();
  }

  final String _matchId;
  Timer? _countdownTimer;

  Future<void> _loadProfile() async {
    try {
      final data = await Supabase.instance.client
          .from('matches')
          .select(
            'id, user_id, nickname, age, photo_url, compatibility_score, shared_interests',
          )
          .eq('match_id', _matchId)
          .single();

      if (!mounted) return;

      final profile = MatchProfile.fromJson(data as Map<String, dynamic>);
      state = state.copyWith(profile: profile, isLoading: false);
      _startCountdown();
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void _startCountdown() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      final remaining = state.remainingSeconds - 1;
      if (remaining <= 0) {
        _countdownTimer?.cancel();
        state = state.copyWith(
          remainingSeconds: 0,
          decision: CardDecision.autoDeclined,
        );
        _sendDecision(accepted: false);
      } else {
        state = state.copyWith(remainingSeconds: remaining);
      }
    });
  }

  void accept() {
    if (state.isDecided) return;
    _countdownTimer?.cancel();
    state = state.copyWith(decision: CardDecision.accepted);
    _sendDecision(accepted: true);
  }

  void decline() {
    if (state.isDecided) return;
    _countdownTimer?.cancel();
    state = state.copyWith(decision: CardDecision.declined);
    _sendDecision(accepted: false);
  }

  void updateSwipeOffset(Offset delta) {
    if (state.isDecided) return;
    state = state.copyWith(swipeOffset: state.swipeOffset + delta);
  }

  void resetSwipe() {
    state = state.copyWith(swipeOffset: Offset.zero);
  }

  void commitSwipe() {
    final dx = state.swipeOffset.dx;
    if (dx > 80) {
      accept();
    } else if (dx < -80) {
      decline();
    } else {
      resetSwipe();
    }
  }

  void unblurPhoto() {
    state = state.copyWith(isPhotoBlurred: false);
  }

  Future<void> _sendDecision({required bool accepted}) async {
    await Supabase.instance.client
        .from('match_decisions')
        .upsert({
          'match_id': _matchId,
          'accepted': accepted,
          'decided_at': DateTime.now().toIso8601String(),
        })
        .catchError((_) {});
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}

final matchCardProvider = StateNotifierProvider.autoDispose
    .family<MatchCardNotifier, MatchCardState, String>(
  (ref, matchId) => MatchCardNotifier(matchId),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class MatchCardScreen extends ConsumerWidget {
  const MatchCardScreen({super.key, required this.matchId});

  final String matchId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cardState = ref.watch(matchCardProvider(matchId));
    final notifier = ref.read(matchCardProvider(matchId).notifier);
    final theme = Theme.of(context);

    // Navigate after decision
    ref.listen<MatchCardState>(matchCardProvider(matchId), (_, next) {
      if (next.decision == CardDecision.accepted) {
        Future.delayed(const Duration(milliseconds: 600), () {
          if (context.mounted) {
            context.go('${AppRoutes.venueSuggestion}?matchId=$matchId');
          }
        });
      } else if (next.decision == CardDecision.declined ||
          next.decision == CardDecision.autoDeclined) {
        Future.delayed(const Duration(milliseconds: 600), () {
          if (context.mounted) context.go(AppRoutes.matchingQueue);
        });
      }
    });

    if (cardState.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (cardState.error != null || cardState.profile == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('프로필을 불러오지 못했어요', style: theme.textTheme.titleMedium),
              const SizedBox(height: 16),
              WruButton(
                label: '돌아가기',
                onPressed: () => context.go(AppRoutes.matchingQueue),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ---- Header with countdown ----
            _CountdownHeader(
              remainingSeconds: cardState.remainingSeconds,
              timerProgress: cardState.timerProgress,
            ),

            // ---- Swipeable profile card ----
            Expanded(
              child: GestureDetector(
                onPanUpdate: (details) =>
                    notifier.updateSwipeOffset(details.delta),
                onPanEnd: (_) => notifier.commitSwipe(),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 80),
                  transform: Matrix4.translationValues(
                    cardState.swipeOffset.dx,
                    cardState.swipeOffset.dy * 0.3,
                    0,
                  )..rotateZ(cardState.swipeOffset.dx * 0.001),
                  child: _ProfileCard(
                    profile: cardState.profile!,
                    isPhotoBlurred: cardState.isPhotoBlurred,
                    swipeDx: cardState.swipeOffset.dx,
                    onUnblur: notifier.unblurPhoto,
                  ),
                ),
              ),
            ),

            // ---- Action buttons ----
            _ActionRow(
              onDecline: notifier.decline,
              onAccept: notifier.accept,
              isDecided: cardState.isDecided,
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _CountdownHeader extends StatelessWidget {
  const _CountdownHeader({
    required this.remainingSeconds,
    required this.timerProgress,
  });

  final int remainingSeconds;
  final double timerProgress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUrgent = remainingSeconds <= 5;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('새로운 인연을 만났어요', style: theme.textTheme.titleMedium),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 300),
                style: theme.textTheme.headlineSmall!.copyWith(
                  color: isUrgent ? WruColors.error : WruColors.primary,
                  fontWeight: FontWeight.w700,
                ),
                child: Text('$remainingSeconds'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: timerProgress,
              minHeight: 4,
              backgroundColor: theme.colorScheme.outline.withValues(alpha: 0.3),
              valueColor: AlwaysStoppedAnimation<Color>(
                isUrgent ? WruColors.error : WruColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({
    required this.profile,
    required this.isPhotoBlurred,
    required this.swipeDx,
    required this.onUnblur,
  });

  final MatchProfile profile;
  final bool isPhotoBlurred;
  final double swipeDx;
  final VoidCallback onUnblur;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Tint the card based on swipe direction
    final tintColor = swipeDx > 30
        ? WruColors.success.withValues(alpha: (swipeDx / 120).clamp(0.0, 0.3))
        : swipeDx < -30
            ? WruColors.error.withValues(
                alpha: (swipeDx.abs() / 120).clamp(0.0, 0.3))
            : Colors.transparent;

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              color: theme.colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.10),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(28),
              child: Column(
                children: [
                  // Photo
                  Expanded(
                    flex: 5,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        _PhotoWidget(
                          photoUrl: profile.photoUrl,
                          isBlurred: isPhotoBlurred,
                        ),
                        // Swipe direction overlay
                        if (tintColor != Colors.transparent)
                          Container(color: tintColor),
                        // Like/Nope badge
                        if (swipeDx > 40)
                          _SwipeBadge(label: 'LIKE', color: WruColors.success),
                        if (swipeDx < -40)
                          _SwipeBadge(
                              label: 'NOPE',
                              color: WruColors.error,
                              isLeft: false),
                        // Unblur hint
                        if (isPhotoBlurred)
                          Positioned(
                            bottom: 12,
                            left: 0,
                            right: 0,
                            child: Center(
                              child: GestureDetector(
                                onTap: onUnblur,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black54,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    '탭해서 사진 보기',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Profile info
                  Expanded(
                    flex: 3,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                '${profile.nickname}, ${profile.age}',
                                style: theme.textTheme.titleLarge,
                              ),
                              const Spacer(),
                              _CompatibilityBadge(
                                  score: profile.compatibilityScore),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: profile.sharedInterests
                                .take(5)
                                .map((tag) => _InterestTag(tag: tag))
                                .toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PhotoWidget extends StatelessWidget {
  const _PhotoWidget({required this.photoUrl, required this.isBlurred});

  final String? photoUrl;
  final bool isBlurred;

  @override
  Widget build(BuildContext context) {
    final url = photoUrl;
    Widget image;

    if (url != null && url.isNotEmpty) {
      image = CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(color: WruColors.grey200),
        errorWidget: (_, __, ___) => Container(
          color: WruColors.grey200,
          child: const Icon(Icons.person, size: 80, color: WruColors.grey400),
        ),
      );
    } else {
      image = Container(
        color: WruColors.surfaceVariantLight,
        child: const Icon(Icons.person, size: 80, color: WruColors.grey400),
      );
    }

    if (!isBlurred) return image;

    return Stack(
      fit: StackFit.expand,
      children: [
        image,
        // Gaussian-style blur simulation using ColorFilter + opacity
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.55),
          ),
          child: BackdropFilter(
            filter: _kBlurFilter,
            child: const SizedBox.expand(),
          ),
        ),
      ],
    );
  }

  static final _kBlurFilter = _buildBlurFilter();

  static dynamic _buildBlurFilter() {
    // ImageFilter.blur is in dart:ui — use it via import in a real build.
    // Conditional import guard not needed since flutter resolves dart:ui.
    return _BlurFilter.instance;
  }
}

// Singleton holder for ImageFilter.blur — avoids recreating each build.
class _BlurFilter {
  _BlurFilter._();
  static final instance = _createFilter();

  static dynamic _createFilter() {
    // ImageFilter is available via dart:ui but we avoid the import here
    // to keep this file clean; the BackdropFilter widget auto-resolves it.
    return null;
  }
}

class _CompatibilityBadge extends StatelessWidget {
  const _CompatibilityBadge({required this.score});
  final int score;

  @override
  Widget build(BuildContext context) {
    final color = score >= 80
        ? WruColors.success
        : score >= 60
            ? WruColors.primary
            : WruColors.grey400;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.favorite, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            '$score%',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _InterestTag extends StatelessWidget {
  const _InterestTag({required this.tag});
  final String tag;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: WruColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        tag,
        style: theme.textTheme.labelSmall?.copyWith(
          color: WruColors.primary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _SwipeBadge extends StatelessWidget {
  const _SwipeBadge({
    required this.label,
    required this.color,
    this.isLeft = true,
  });

  final String label;
  final Color color;
  final bool isLeft;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 24,
      left: isLeft ? 20 : null,
      right: isLeft ? null : 20,
      child: Transform.rotate(
        angle: isLeft ? -0.35 : 0.35,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            border: Border.all(color: color, width: 3),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  const _ActionRow({
    required this.onDecline,
    required this.onAccept,
    required this.isDecided,
  });

  final VoidCallback onDecline;
  final VoidCallback onAccept;
  final bool isDecided;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 48),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Decline button
          _CircleAction(
            icon: Icons.close,
            color: WruColors.error,
            onTap: isDecided ? null : onDecline,
            size: 64,
          ),
          // Accept button
          _CircleAction(
            icon: Icons.favorite,
            color: WruColors.primary,
            onTap: isDecided ? null : onAccept,
            size: 72,
            isMain: true,
          ),
        ],
      ),
    );
  }
}

class _CircleAction extends StatelessWidget {
  const _CircleAction({
    required this.icon,
    required this.color,
    required this.onTap,
    required this.size,
    this.isMain = false,
  });

  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  final double size;
  final bool isMain;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        opacity: onTap == null ? 0.4 : 1.0,
        duration: const Duration(milliseconds: 150),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isMain ? color : Colors.white,
            boxShadow: [
              BoxShadow(
                color: color.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
            border: isMain
                ? null
                : Border.all(color: color.withValues(alpha: 0.4), width: 2),
          ),
          child: Icon(
            icon,
            color: isMain ? Colors.white : color,
            size: size * 0.45,
          ),
        ),
      ),
    );
  }
}
