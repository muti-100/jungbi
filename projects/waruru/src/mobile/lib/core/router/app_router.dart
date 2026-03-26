import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/onboarding/presentation/big_five_screen.dart';
import '../../features/matching/presentation/matching_queue_screen.dart';
import '../../features/matching/presentation/match_card_screen.dart';
import '../../features/venue/presentation/venue_suggestion_screen.dart';
import '../../features/arrival/presentation/arrival_screen.dart';
import '../../features/rolling_paper/presentation/rolling_paper_compose_screen.dart';
import '../../features/rolling_paper/presentation/figurine_gallery_screen.dart';

// ---------------------------------------------------------------------------
// Route path constants — referenced by name throughout the app.
// ---------------------------------------------------------------------------
abstract class AppRoutes {
  static const bigFive = '/onboarding/big-five';
  static const matchingQueue = '/matching/queue';
  static const matchCard = '/matching/card';
  static const venueSuggestion = '/venue/suggestion';
  static const arrival = '/arrival';
  static const rollingPaperCompose = '/rolling-paper/compose';
  static const figurineGallery = '/rolling-paper/gallery';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: AppRoutes.bigFive,
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: AppRoutes.bigFive,
        name: 'bigFive',
        pageBuilder: (context, state) => const NoTransitionPage(
          child: BigFiveScreen(),
        ),
      ),
      GoRoute(
        path: AppRoutes.matchingQueue,
        name: 'matchingQueue',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const MatchingQueueScreen(),
          transitionsBuilder: _slideUpTransition,
        ),
      ),
      GoRoute(
        path: AppRoutes.matchCard,
        name: 'matchCard',
        pageBuilder: (context, state) {
          final matchId = state.uri.queryParameters['matchId'] ?? '';
          return CustomTransitionPage(
            key: state.pageKey,
            child: MatchCardScreen(matchId: matchId),
            transitionsBuilder: _slideUpTransition,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.venueSuggestion,
        name: 'venueSuggestion',
        pageBuilder: (context, state) {
          final matchId = state.uri.queryParameters['matchId'] ?? '';
          return CustomTransitionPage(
            key: state.pageKey,
            child: VenueSuggestionScreen(matchId: matchId),
            transitionsBuilder: _slideUpTransition,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.arrival,
        name: 'arrival',
        pageBuilder: (context, state) {
          final venueId = state.uri.queryParameters['venueId'] ?? '';
          final matchId = state.uri.queryParameters['matchId'] ?? '';
          return CustomTransitionPage(
            key: state.pageKey,
            child: ArrivalScreen(venueId: venueId, matchId: matchId),
            transitionsBuilder: _slideUpTransition,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.rollingPaperCompose,
        name: 'rollingPaperCompose',
        pageBuilder: (context, state) {
          final matchId = state.uri.queryParameters['matchId'] ?? '';
          return CustomTransitionPage(
            key: state.pageKey,
            child: RollingPaperComposeScreen(matchId: matchId),
            transitionsBuilder: _slideUpTransition,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.figurineGallery,
        name: 'figurineGallery',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const FigurineGalleryScreen(),
          transitionsBuilder: _slideUpTransition,
        ),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text(
          '페이지를 찾을 수 없어요.\n${state.error}',
          textAlign: TextAlign.center,
        ),
      ),
    ),
  );
});

Widget _slideUpTransition(
  BuildContext context,
  Animation<double> animation,
  Animation<double> secondaryAnimation,
  Widget child,
) {
  return SlideTransition(
    position: Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
    child: child,
  );
}
