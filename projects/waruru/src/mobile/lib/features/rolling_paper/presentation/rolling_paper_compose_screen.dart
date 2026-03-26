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
// Emoji picker data — 20 curated emojis
// ---------------------------------------------------------------------------
const List<String> _pickerEmojis = [
  '😊', '😍', '🥰', '😆', '🤩',
  '🙏', '✨', '💫', '🌟', '🎉',
  '💌', '🌸', '🍀', '🎶', '🧡',
  '💡', '🤝', '🥂', '🌈', '🦋',
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
enum ComposePhase { editing, sending, unboxing, done }

class RollingPaperState {
  const RollingPaperState({
    this.text = '',
    this.phase = ComposePhase.editing,
    this.figurineUrl,
    this.error,
  });

  final String text;
  final ComposePhase phase;
  final String? figurineUrl;
  final String? error;

  static const int maxChars = 200;

  bool get canSend =>
      text.trim().isNotEmpty && phase == ComposePhase.editing;

  int get remaining => maxChars - text.length;

  RollingPaperState copyWith({
    String? text,
    ComposePhase? phase,
    String? figurineUrl,
    String? error,
  }) =>
      RollingPaperState(
        text: text ?? this.text,
        phase: phase ?? this.phase,
        figurineUrl: figurineUrl ?? this.figurineUrl,
        error: error ?? this.error,
      );
}

class RollingPaperNotifier extends StateNotifier<RollingPaperState> {
  RollingPaperNotifier(this._matchId) : super(const RollingPaperState());

  final String _matchId;

  void updateText(String value) {
    if (value.length > RollingPaperState.maxChars) return;
    state = state.copyWith(text: value, error: null);
  }

  void appendEmoji(String emoji) {
    final newText = state.text + emoji;
    if (newText.length > RollingPaperState.maxChars) return;
    state = state.copyWith(text: newText, error: null);
  }

  Future<void> send() async {
    if (!state.canSend) return;
    state = state.copyWith(phase: ComposePhase.sending, error: null);

    try {
      // 1. Save rolling paper message
      await Supabase.instance.client.from('rolling_papers').insert({
        'match_id': _matchId,
        'sender_id': Supabase.instance.client.auth.currentUser?.id,
        'message': state.text.trim(),
        'created_at': DateTime.now().toIso8601String(),
      });

      // 2. Trigger figurine generation via Edge Function
      final result = await Supabase.instance.client.functions.invoke(
        'generate-figurine',
        body: {
          'match_id': _matchId,
          'message': state.text.trim(),
        },
      );

      if (!mounted) return;

      final figurineUrl = (result.data as Map<String, dynamic>?)?['figurine_url'] as String?;

      state = state.copyWith(
        phase: ComposePhase.unboxing,
        figurineUrl: figurineUrl,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        phase: ComposePhase.editing,
        error: '전송에 실패했어요. 다시 시도해주세요.',
      );
    }
  }

  void completeUnboxing() {
    state = state.copyWith(phase: ComposePhase.done);
  }
}

final rollingPaperProvider = StateNotifierProvider.autoDispose
    .family<RollingPaperNotifier, RollingPaperState, String>(
  (ref, matchId) => RollingPaperNotifier(matchId),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class RollingPaperComposeScreen extends ConsumerStatefulWidget {
  const RollingPaperComposeScreen({super.key, required this.matchId});

  final String matchId;

  @override
  ConsumerState<RollingPaperComposeScreen> createState() =>
      _RollingPaperComposeScreenState();
}

class _RollingPaperComposeScreenState
    extends ConsumerState<RollingPaperComposeScreen> {
  late TextEditingController _textController;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(rollingPaperProvider(widget.matchId));
    final notifier = ref.read(rollingPaperProvider(widget.matchId).notifier);
    final theme = Theme.of(context);

    // Navigate after done
    ref.listen<RollingPaperState>(rollingPaperProvider(widget.matchId),
        (_, next) {
      if (next.phase == ComposePhase.done) {
        Future.delayed(const Duration(milliseconds: 400), () {
          if (context.mounted) context.go(AppRoutes.figurineGallery);
        });
      }
    });

    if (state.phase == ComposePhase.unboxing) {
      return _UnboxingOverlay(
        figurineUrl: state.figurineUrl,
        onComplete: notifier.completeUnboxing,
      );
    }

    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        title: Text('롤링 페이퍼 작성', style: theme.textTheme.titleMedium),
        automaticallyImplyLeading: false,
      ),
      body: GestureDetector(
        onTap: () => _focusNode.unfocus(),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Heading
                      Text(
                        '오늘 만남은 어떠셨나요?',
                        style: theme.textTheme.titleLarge,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '솔직한 감상을 남겨주세요. 상대방만 볼 수 있어요.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.55),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Text area
                      Container(
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surfaceContainerHighest,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: TextField(
                          controller: _textController,
                          focusNode: _focusNode,
                          maxLines: 7,
                          maxLength: RollingPaperState.maxChars,
                          onChanged: notifier.updateText,
                          decoration: InputDecoration(
                            hintText:
                                '오늘 만남에서 기억에 남는 순간이 있었나요?',
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.all(16),
                            counterText: '',
                          ),
                          style: theme.textTheme.bodyLarge?.copyWith(
                            height: 1.6,
                          ),
                        ),
                      ),

                      // Character counter
                      Align(
                        alignment: Alignment.centerRight,
                        child: Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: Text(
                            '${state.text.length} / ${RollingPaperState.maxChars}',
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: state.remaining <= 20
                                  ? WruColors.error
                                  : theme.colorScheme.onSurface
                                      .withValues(alpha: 0.45),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Emoji picker
                      _EmojiPicker(
                        onEmojiSelected: (emoji) {
                          notifier.appendEmoji(emoji);
                          _textController.text = ref
                              .read(rollingPaperProvider(widget.matchId))
                              .text;
                          _textController.selection =
                              TextSelection.fromPosition(
                            TextPosition(
                                offset: _textController.text.length),
                          );
                        },
                      ),

                      // Error
                      if (state.error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          state.error!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: WruColors.error,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Send button
              Padding(
                padding: EdgeInsets.fromLTRB(
                  20,
                  12,
                  20,
                  MediaQuery.of(context).viewInsets.bottom +
                      MediaQuery.of(context).padding.bottom +
                      16,
                ),
                child: WruButton(
                  label: '롤링 페이퍼 보내기',
                  isLoading: state.phase == ComposePhase.sending,
                  onPressed: state.canSend ? notifier.send : null,
                  icon: const Icon(Icons.send_rounded),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Emoji picker widget
// ---------------------------------------------------------------------------
class _EmojiPicker extends StatelessWidget {
  const _EmojiPicker({required this.onEmojiSelected});

  final ValueChanged<String> onEmojiSelected;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '이모지 추가',
          style: theme.textTheme.labelMedium?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _pickerEmojis.map((emoji) {
            return GestureDetector(
              onTap: () => onEmojiSelected(emoji),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(emoji, style: const TextStyle(fontSize: 22)),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Unboxing overlay
// ---------------------------------------------------------------------------
class _UnboxingOverlay extends StatefulWidget {
  const _UnboxingOverlay({
    required this.figurineUrl,
    required this.onComplete,
  });

  final String? figurineUrl;
  final VoidCallback onComplete;

  @override
  State<_UnboxingOverlay> createState() => _UnboxingOverlayState();
}

class _UnboxingOverlayState extends State<_UnboxingOverlay> {
  bool _showFigurine = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: WruColors.primary.withValues(alpha: 0.05),
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 260,
                height: 260,
                child: Lottie.asset(
                  'assets/animations/unboxing.json',
                  repeat: false,
                  onLoaded: (composition) {
                    Future.delayed(
                      Duration(
                          milliseconds:
                              (composition.duration.inMilliseconds * 0.7)
                                  .round()),
                      () {
                        if (mounted) setState(() => _showFigurine = true);
                      },
                    );
                  },
                  errorBuilder: (_, __, ___) {
                    if (!_showFigurine) {
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (mounted) setState(() => _showFigurine = true);
                      });
                    }
                    return const Icon(
                      Icons.card_giftcard,
                      size: 100,
                      color: WruColors.primary,
                    );
                  },
                ),
              ),
              AnimatedOpacity(
                opacity: _showFigurine ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 500),
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    Text(
                      '새 피규어를 얻었어요!',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 28),
                    WruButton(
                      label: '갤러리에서 보기',
                      onPressed: widget.onComplete,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
