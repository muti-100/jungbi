import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Environment constants — override via --dart-define at build time.
// Example: flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co
//                      --dart-define=SUPABASE_ANON_KEY=eyJ...
// ---------------------------------------------------------------------------
const String _supabaseUrl =
    String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://placeholder.supabase.co');
const String _supabaseAnonKey =
    String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'placeholder-anon-key');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Force portrait-only — matches Korean social-app convention.
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Status bar: transparent so terracotta AppBar bleeds through properly.
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  await Supabase.initialize(
    url: _supabaseUrl,
    anonKey: _supabaseAnonKey,
    // Keep realtime socket alive — critical for matching queue updates.
    realtimeClientOptions: const RealtimeClientOptions(
      logLevel: RealtimeLogLevel.info,
    ),
  );

  runApp(
    // ProviderScope is the root of the Riverpod widget tree.
    const ProviderScope(
      child: WaruruApp(),
    ),
  );
}

class WaruruApp extends ConsumerWidget {
  const WaruruApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'Waruru',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      builder: (context, child) {
        // Enforce minimum text scale so Korean glyphs stay readable.
        final mediaQuery = MediaQuery.of(context);
        return MediaQuery(
          data: mediaQuery.copyWith(
            textScaler: TextScaler.linear(
              mediaQuery.textScaler.scale(1.0).clamp(0.9, 1.2),
            ),
          ),
          child: child!,
        );
      },
    );
  }
}
