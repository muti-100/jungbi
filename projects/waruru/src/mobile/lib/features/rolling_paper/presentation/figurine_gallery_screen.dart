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
class FigurineItem {
  const FigurineItem({
    required this.figurineId,
    required this.matchId,
    required this.imageUrl,
    required this.rollingPaperMessage,
    required this.createdAt,
  });

  final String figurineId;
  final String matchId;
  final String imageUrl;
  final String rollingPaperMessage;
  final DateTime createdAt;

  factory FigurineItem.fromJson(Map<String, dynamic> json) => FigurineItem(
        figurineId: json['figurine_id'] as String,
        matchId: json['match_id'] as String,
        imageUrl: json['image_url'] as String,
        rollingPaperMessage: json['rolling_paper_message'] as String? ?? '',
        createdAt: DateTime.parse(json['created_at'] as String),
      );
}

// ---------------------------------------------------------------------------
// State / Provider
// ---------------------------------------------------------------------------
class FigurineGalleryState {
  const FigurineGalleryState({
    this.figurines = const [],
    this.isLoading = true,
    this.error,
  });

  final List<FigurineItem> figurines;
  final bool isLoading;
  final String? error;

  FigurineGalleryState copyWith({
    List<FigurineItem>? figurines,
    bool? isLoading,
    String? error,
  }) =>
      FigurineGalleryState(
        figurines: figurines ?? this.figurines,
        isLoading: isLoading ?? this.isLoading,
        error: error ?? this.error,
      );
}

class FigurineGalleryNotifier
    extends StateNotifier<FigurineGalleryState> {
  FigurineGalleryNotifier() : super(const FigurineGalleryState()) {
    _load();
  }

  Future<void> _load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId == null) throw Exception('로그인이 필요해요');

      final data = await Supabase.instance.client
          .from('figurines')
          .select(
            'figurine_id, match_id, image_url, rolling_paper_message, created_at',
          )
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      if (!mounted) return;

      final items = (data as List<dynamic>)
          .map((e) => FigurineItem.fromJson(e as Map<String, dynamic>))
          .toList();

      state = state.copyWith(figurines: items, isLoading: false);
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refresh() => _load();
}

final figurineGalleryProvider = StateNotifierProvider.autoDispose<
    FigurineGalleryNotifier, FigurineGalleryState>(
  (ref) => FigurineGalleryNotifier(),
);

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
class FigurineGalleryScreen extends ConsumerWidget {
  const FigurineGalleryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final galleryState = ref.watch(figurineGalleryProvider);
    final notifier = ref.read(figurineGalleryProvider.notifier);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('내 피규어 컬렉션', style: theme.textTheme.titleMedium),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: notifier.refresh,
            tooltip: '새로고침',
          ),
        ],
      ),
      body: galleryState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : galleryState.error != null
              ? _ErrorBody(
                  error: galleryState.error!,
                  onRetry: notifier.refresh,
                )
              : galleryState.figurines.isEmpty
                  ? _EmptyState()
                  : _GalleryGrid(figurines: galleryState.figurines),
    );
  }
}

// ---------------------------------------------------------------------------
// Gallery grid
// ---------------------------------------------------------------------------
class _GalleryGrid extends StatelessWidget {
  const _GalleryGrid({required this.figurines});

  final List<FigurineItem> figurines;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 14,
        crossAxisSpacing: 14,
        childAspectRatio: 0.78,
      ),
      itemCount: figurines.length,
      itemBuilder: (context, index) => _FigurineCard(
        figurine: figurines[index],
        onTap: () => _showRollingPaperModal(context, figurines[index]),
      ),
    );
  }

  void _showRollingPaperModal(BuildContext context, FigurineItem figurine) {
    showDialog<void>(
      context: context,
      builder: (ctx) => _RollingPaperModal(figurine: figurine),
    );
  }
}

// ---------------------------------------------------------------------------
// Individual figurine card
// ---------------------------------------------------------------------------
class _FigurineCard extends StatelessWidget {
  const _FigurineCard({required this.figurine, required this.onTap});

  final FigurineItem figurine;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.07),
              blurRadius: 14,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Column(
            children: [
              // Figurine image
              Expanded(
                flex: 3,
                child: CachedNetworkImage(
                  imageUrl: figurine.imageUrl,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  placeholder: (_, __) => Container(
                    color: WruColors.surfaceVariantLight,
                    child: const Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    color: WruColors.surfaceVariantLight,
                    child: const Icon(
                      Icons.person_outline,
                      size: 48,
                      color: WruColors.grey400,
                    ),
                  ),
                ),
              ),
              // Date label
              Expanded(
                flex: 1,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _formatDate(figurine.createdAt),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.5),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.mail_outline,
                              size: 12, color: WruColors.primary),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              figurine.rollingPaperMessage.isNotEmpty
                                  ? '편지 있음'
                                  : '편지 없음',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: figurine.rollingPaperMessage.isNotEmpty
                                    ? WruColors.primary
                                    : theme.colorScheme.onSurface
                                        .withValues(alpha: 0.35),
                                fontWeight: FontWeight.w600,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt).inDays;
    if (diff == 0) return '오늘';
    if (diff == 1) return '어제';
    return '${dt.month}월 ${dt.day}일';
  }
}

// ---------------------------------------------------------------------------
// Rolling paper modal
// ---------------------------------------------------------------------------
class _RollingPaperModal extends StatelessWidget {
  const _RollingPaperModal({required this.figurine});

  final FigurineItem figurine;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Figurine image
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: CachedNetworkImage(
                imageUrl: figurine.imageUrl,
                height: 180,
                width: 180,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  height: 180,
                  width: 180,
                  color: WruColors.surfaceVariantLight,
                  child: const Icon(Icons.person, size: 64, color: WruColors.grey400),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Message
            if (figurine.rollingPaperMessage.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: WruColors.primary.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: WruColors.primary.withValues(alpha: 0.2),
                  ),
                ),
                child: Text(
                  figurine.rollingPaperMessage,
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.6),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _formatDate(figurine.createdAt),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
                ),
              ),
            ] else
              Text(
                '편지가 없어요',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                ),
              ),

            const SizedBox(height: 20),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('닫기'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.year}년 ${dt.month}월 ${dt.day}일';
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.collections_bookmark_outlined,
              size: 80,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.2),
            ),
            const SizedBox(height: 24),
            Text(
              '아직 피규어가 없어요',
              style: theme.textTheme.titleLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              '매칭을 완료하면 특별한 피규어를\n받을 수 있어요.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
                height: 1.6,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),
            // CTA — per spec
            Builder(builder: (ctx) {
              return WruButton(
                label: '지금 매칭 시작',
                onPressed: () => ctx.go(AppRoutes.matchingQueue),
                icon: const Icon(Icons.favorite_outline),
              );
            }),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------
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
            Icon(
              Icons.error_outline,
              size: 64,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
            ),
            const SizedBox(height: 20),
            Text(
              '불러오지 못했어요',
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            WruButton(label: '다시 시도', onPressed: onRetry),
          ],
        ),
      ),
    );
  }
}
