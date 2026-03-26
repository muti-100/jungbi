import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/wru_button.dart';

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------
const _kSaveKey = 'big_five_progress';

class BigFiveQuestion {
  const BigFiveQuestion({
    required this.index,
    required this.text,
    required this.trait,
  });

  final int index;
  final String text;

  /// O / C / E / A / N — Big Five trait code
  final String trait;
}

const List<BigFiveQuestion> _questions = [
  BigFiveQuestion(index: 0, text: '나는 새로운 경험과 모험을 즐기는 편이다.', trait: 'O'),
  BigFiveQuestion(index: 1, text: '예술이나 음악, 문학에서 아름다움을 느끼는 편이다.', trait: 'O'),
  BigFiveQuestion(index: 2, text: '상상력이 풍부하고 창의적인 생각을 즐긴다.', trait: 'O'),
  BigFiveQuestion(index: 3, text: '중요한 일은 미리 계획을 세워 처리하는 편이다.', trait: 'C'),
  BigFiveQuestion(index: 4, text: '한 번 시작한 일은 끝까지 마무리하려고 노력한다.', trait: 'C'),
  BigFiveQuestion(index: 5, text: '나는 규칙과 질서를 지키는 것이 중요하다고 생각한다.', trait: 'C'),
  BigFiveQuestion(index: 6, text: '사람들과 함께 있을 때 에너지가 충전되는 느낌이다.', trait: 'E'),
  BigFiveQuestion(index: 7, text: '새로운 사람을 만나는 것이 즐겁고 설레는 편이다.', trait: 'E'),
  BigFiveQuestion(index: 8, text: '파티나 모임에서 적극적으로 대화를 이끄는 편이다.', trait: 'E'),
  BigFiveQuestion(index: 9, text: '다른 사람의 감정과 필요에 민감하게 반응한다.', trait: 'A'),
  BigFiveQuestion(index: 10, text: '갈등이 생기면 상대방과 타협하려고 먼저 노력한다.', trait: 'A'),
  BigFiveQuestion(index: 11, text: '타인을 도와주는 것이 나에게 보람 있는 일이다.', trait: 'A'),
  BigFiveQuestion(index: 12, text: '스트레스 상황에서도 비교적 침착하게 대처한다.', trait: 'N'),
  BigFiveQuestion(index: 13, text: '사소한 일에도 걱정이나 불안을 느낄 때가 많다.', trait: 'N'),
  BigFiveQuestion(index: 14, text: '기분 변화가 심한 편이라는 이야기를 듣는다.', trait: 'N'),
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
class BigFiveState {
  const BigFiveState({
    this.currentIndex = 0,
    this.answers = const {},
    this.isAutoAdvancing = false,
  });

  final int currentIndex;

  /// questionIndex → slider value (1.0 – 7.0)
  final Map<int, double> answers;
  final bool isAutoAdvancing;

  BigFiveState copyWith({
    int? currentIndex,
    Map<int, double>? answers,
    bool? isAutoAdvancing,
  }) {
    return BigFiveState(
      currentIndex: currentIndex ?? this.currentIndex,
      answers: answers ?? this.answers,
      isAutoAdvancing: isAutoAdvancing ?? this.isAutoAdvancing,
    );
  }

  bool get isComplete => currentIndex >= _questions.length;

  double get progress =>
      _questions.isEmpty ? 0 : currentIndex / _questions.length;

  String get progressMicrocopy {
    final n = currentIndex + 1;
    if (n <= 5) return '$n번째 — 이제 시작해볼까요?';
    if (n <= 8) return '$n번째 — 절반 왔어요!';
    if (n <= 12) return '$n번째 — 거의 다 왔어요!';
    return '$n번째 — 마지막이에요!';
  }
}

class BigFiveNotifier extends StateNotifier<BigFiveState> {
  BigFiveNotifier() : super(const BigFiveState()) {
    _loadProgress();
  }

  Timer? _autoAdvanceTimer;

  Future<void> _loadProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kSaveKey);
    if (raw == null) return;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final savedIndex = (map['currentIndex'] as int?) ?? 0;
      final rawAnswers = map['answers'] as Map<String, dynamic>? ?? {};
      final answers = rawAnswers.map(
        (k, v) => MapEntry(int.parse(k), (v as num).toDouble()),
      );
      state = BigFiveState(currentIndex: savedIndex, answers: answers);
    } catch (_) {
      // Corrupted data — start fresh.
    }
  }

  Future<void> _saveProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final payload = jsonEncode({
      'currentIndex': state.currentIndex,
      'answers': state.answers.map((k, v) => MapEntry(k.toString(), v)),
    });
    await prefs.setString(_kSaveKey, payload);
  }

  void setAnswer(int questionIndex, double value) {
    final updated = Map<int, double>.from(state.answers)
      ..[questionIndex] = value;
    state = state.copyWith(answers: updated);
  }

  /// Called when user commits an answer (slider drag-end or tap).
  void commitAnswer(int questionIndex, double value) {
    setAnswer(questionIndex, value);
    _scheduleAutoAdvance();
  }

  void _scheduleAutoAdvance() {
    _autoAdvanceTimer?.cancel();
    state = state.copyWith(isAutoAdvancing: true);
    _autoAdvanceTimer = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      _advance();
    });
  }

  void _advance() {
    if (state.currentIndex >= _questions.length - 1) {
      state = state.copyWith(
        currentIndex: _questions.length,
        isAutoAdvancing: false,
      );
    } else {
      state = state.copyWith(
        currentIndex: state.currentIndex + 1,
        isAutoAdvancing: false,
      );
    }
    _saveProgress();
  }

  void goBack() {
    _autoAdvanceTimer?.cancel();
    if (state.currentIndex > 0) {
      state = state.copyWith(
        currentIndex: state.currentIndex - 1,
        isAutoAdvancing: false,
      );
    }
  }

  Future<Map<String, double>> computeScores() async {
    final traits = {'O': <double>[], 'C': <double>[], 'E': <double>[], 'A': <double>[], 'N': <double>[]};
    for (final q in _questions) {
      final answer = state.answers[q.index];
      if (answer != null) {
        traits[q.trait]!.add(answer);
      }
    }
    final scores = <String, double>{};
    traits.forEach((trait, vals) {
      if (vals.isNotEmpty) {
        scores[trait] = vals.reduce((a, b) => a + b) / vals.length;
      }
    });
    return scores;
  }

  @override
  void dispose() {
    _autoAdvanceTimer?.cancel();
    super.dispose();
  }
}

final bigFiveProvider =
    StateNotifierProvider<BigFiveNotifier, BigFiveState>(
  (ref) => BigFiveNotifier(),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class BigFiveScreen extends ConsumerStatefulWidget {
  const BigFiveScreen({super.key});

  @override
  ConsumerState<BigFiveScreen> createState() => _BigFiveScreenState();
}

class _BigFiveScreenState extends ConsumerState<BigFiveScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;
  int _lastIndex = 0;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.12, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
  }

  @override
  void dispose() {
    _slideController.dispose();
    super.dispose();
  }

  void _onIndexChanged(int newIndex) {
    if (newIndex != _lastIndex) {
      _lastIndex = newIndex;
      _slideController
        ..reset()
        ..forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bigFiveState = ref.watch(bigFiveProvider);
    final notifier = ref.read(bigFiveProvider.notifier);
    final theme = Theme.of(context);

    _onIndexChanged(bigFiveState.currentIndex);

    if (bigFiveState.isComplete) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) context.go(AppRoutes.matchingQueue);
      });
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final question = _questions[bigFiveState.currentIndex];
    final currentAnswer = bigFiveState.answers[question.index] ?? 4.0;

    return Scaffold(
      appBar: AppBar(
        leading: bigFiveState.currentIndex > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                onPressed: notifier.goBack,
                tooltip: '이전',
              )
            : null,
        title: Text(
          '나를 알아가는 시간',
          style: theme.textTheme.titleMedium,
        ),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ---- Progress bar ----
            _ProgressSection(
              progress: bigFiveState.progress,
              microcopy: bigFiveState.progressMicrocopy,
            ),

            // ---- Question card ----
            Expanded(
              child: SlideTransition(
                position: _slideAnimation,
                child: _QuestionCard(
                  question: question,
                  value: currentAnswer,
                  isAutoAdvancing: bigFiveState.isAutoAdvancing,
                  onChanged: (v) => notifier.setAnswer(question.index, v),
                  onChangeEnd: (v) => notifier.commitAnswer(question.index, v),
                ),
              ),
            ),

            // ---- Skip hint ----
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    notifier.commitAnswer(question.index, currentAnswer);
                  },
                  child: Text(
                    '다음으로',
                    style: theme.textTheme.labelMedium?.copyWith(
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressSection extends StatelessWidget {
  const _ProgressSection({
    required this.progress,
    required this.microcopy,
  });

  final double progress;
  final String microcopy;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                microcopy,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: WruColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${(progress * 100).round()}%',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: theme.colorScheme.outline.withValues(alpha: 0.3),
              valueColor:
                  const AlwaysStoppedAnimation<Color>(WruColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

class _QuestionCard extends StatelessWidget {
  const _QuestionCard({
    required this.question,
    required this.value,
    required this.isAutoAdvancing,
    required this.onChanged,
    required this.onChangeEnd,
  });

  final BigFiveQuestion question;
  final double value;
  final bool isAutoAdvancing;
  final ValueChanged<double> onChanged;
  final ValueChanged<double> onChangeEnd;

  static const List<String> _labels = [
    '전혀\n그렇지 않다',
    '그렇지 않다',
    '약간\n그렇지 않다',
    '보통',
    '약간\n그렇다',
    '그렇다',
    '매우\n그렇다',
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final roundedValue = value.round();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Question text
          AnimatedOpacity(
            opacity: isAutoAdvancing ? 0.4 : 1.0,
            duration: const Duration(milliseconds: 150),
            child: Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Text(
                question.text,
                style: theme.textTheme.titleLarge?.copyWith(height: 1.6),
                textAlign: TextAlign.center,
              ),
            ),
          ),

          const SizedBox(height: 40),

          // Current label
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: Text(
              _labels[roundedValue - 1],
              key: ValueKey(roundedValue),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: WruColors.primary,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          const SizedBox(height: 12),

          // Slider
          Slider(
            value: value,
            min: 1,
            max: 7,
            divisions: 6,
            onChanged: onChanged,
            onChangeEnd: onChangeEnd,
          ),

          const SizedBox(height: 8),

          // Endpoint labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '전혀 그렇지 않다',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
                ),
              ),
              Text(
                '매우 그렇다',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
