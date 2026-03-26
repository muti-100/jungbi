import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// Brand colours
// ---------------------------------------------------------------------------
abstract class WruColors {
  // Primary — Terracotta
  static const Color primary = Color(0xFFE86A3A);
  static const Color primaryLight = Color(0xFFF0916A);
  static const Color primaryDark = Color(0xFFBF4A1E);

  // Secondary — used exclusively for KYC / safety UI surfaces
  static const Color secondary = Color(0xFF3A7BD5);
  static const Color secondaryLight = Color(0xFF6699E0);
  static const Color secondaryDark = Color(0xFF2257A8);

  // Neutrals
  static const Color grey50 = Color(0xFFF9F9F9);
  static const Color grey100 = Color(0xFFF2F2F2);
  static const Color grey200 = Color(0xFFE5E5E5);
  static const Color grey300 = Color(0xFFD4D4D4);
  static const Color grey400 = Color(0xFFA3A3A3);
  static const Color grey500 = Color(0xFF737373);
  static const Color grey600 = Color(0xFF525252);
  static const Color grey700 = Color(0xFF404040);
  static const Color grey800 = Color(0xFF262626);
  static const Color grey900 = Color(0xFF171717);

  // Semantic
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Surfaces (light)
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceVariantLight = Color(0xFFF5F1EE);
  static const Color backgroundLight = Color(0xFFF9F7F5);

  // Surfaces (dark)
  static const Color surfaceDark = Color(0xFF1C1C1E);
  static const Color surfaceVariantDark = Color(0xFF2C2C2E);
  static const Color backgroundDark = Color(0xFF000000);
}

// ---------------------------------------------------------------------------
// Pretendard TextTheme
// ---------------------------------------------------------------------------
abstract class WruTextTheme {
  static const String _fontFamily = 'Pretendard';

  // Display
  static const TextStyle displayLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 57,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
    height: 1.12,
  );

  static const TextStyle displayMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 45,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
    height: 1.16,
  );

  static const TextStyle displaySmall = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 36,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
    height: 1.22,
  );

  // Headline
  static const TextStyle headlineLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 32,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.3,
    height: 1.25,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2,
    height: 1.29,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2,
    height: 1.33,
  );

  // Title
  static const TextStyle titleLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.1,
    height: 1.27,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.5,
  );

  static const TextStyle titleSmall = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
    height: 1.43,
  );

  // Body
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.43,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
    height: 1.33,
  );

  // Label
  static const TextStyle labelLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    height: 1.43,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.33,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.5,
    height: 1.45,
  );

  static TextTheme get textTheme => const TextTheme(
        displayLarge: displayLarge,
        displayMedium: displayMedium,
        displaySmall: displaySmall,
        headlineLarge: headlineLarge,
        headlineMedium: headlineMedium,
        headlineSmall: headlineSmall,
        titleLarge: titleLarge,
        titleMedium: titleMedium,
        titleSmall: titleSmall,
        bodyLarge: bodyLarge,
        bodyMedium: bodyMedium,
        bodySmall: bodySmall,
        labelLarge: labelLarge,
        labelMedium: labelMedium,
        labelSmall: labelSmall,
      );
}

// ---------------------------------------------------------------------------
// AppTheme factory
// ---------------------------------------------------------------------------
abstract class AppTheme {
  static ThemeData get lightTheme => _buildTheme(brightness: Brightness.light);
  static ThemeData get darkTheme => _buildTheme(brightness: Brightness.dark);

  static ThemeData _buildTheme({required Brightness brightness}) {
    final isDark = brightness == Brightness.dark;

    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: WruColors.primary,
      onPrimary: Colors.white,
      primaryContainer: isDark ? WruColors.primaryDark : WruColors.primaryLight,
      onPrimaryContainer: isDark ? Colors.white : WruColors.grey900,
      secondary: WruColors.secondary,
      onSecondary: Colors.white,
      secondaryContainer: isDark ? WruColors.secondaryDark : WruColors.secondaryLight,
      onSecondaryContainer: isDark ? Colors.white : WruColors.grey900,
      surface: isDark ? WruColors.surfaceDark : WruColors.surfaceLight,
      onSurface: isDark ? Colors.white : WruColors.grey900,
      surfaceContainerHighest:
          isDark ? WruColors.surfaceVariantDark : WruColors.surfaceVariantLight,
      onSurfaceVariant: isDark ? WruColors.grey300 : WruColors.grey600,
      error: WruColors.error,
      onError: Colors.white,
      outline: isDark ? WruColors.grey700 : WruColors.grey200,
      shadow: Colors.black,
      scrim: Colors.black54,
      inverseSurface: isDark ? WruColors.surfaceLight : WruColors.surfaceDark,
      onInverseSurface: isDark ? WruColors.grey900 : Colors.white,
      inversePrimary: isDark ? WruColors.primaryLight : WruColors.primaryDark,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor:
          isDark ? WruColors.backgroundDark : WruColors.backgroundLight,
      textTheme: WruTextTheme.textTheme.apply(
        bodyColor: isDark ? Colors.white : WruColors.grey900,
        displayColor: isDark ? Colors.white : WruColors.grey900,
      ),

      // AppBar
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: true,
        backgroundColor:
            isDark ? WruColors.backgroundDark : WruColors.backgroundLight,
        foregroundColor: isDark ? Colors.white : WruColors.grey900,
        titleTextStyle: WruTextTheme.titleLarge.copyWith(
          color: isDark ? Colors.white : WruColors.grey900,
        ),
        iconTheme: IconThemeData(
          color: isDark ? Colors.white : WruColors.grey900,
          size: 24,
        ),
      ),

      // ElevatedButton
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: WruColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: WruTextTheme.labelLarge.copyWith(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
          elevation: 0,
        ),
      ),

      // OutlinedButton
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: WruColors.primary,
          minimumSize: const Size(double.infinity, 52),
          side: const BorderSide(color: WruColors.primary, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: WruTextTheme.labelLarge.copyWith(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
      ),

      // TextButton
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: WruColors.primary,
          textStyle: WruTextTheme.labelLarge,
        ),
      ),

      // InputDecoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? WruColors.surfaceVariantDark : WruColors.grey100,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide:
              const BorderSide(color: WruColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: WruColors.error, width: 1.5),
        ),
        hintStyle: WruTextTheme.bodyMedium.copyWith(
          color: isDark ? WruColors.grey500 : WruColors.grey400,
        ),
      ),

      // Card
      cardTheme: CardTheme(
        elevation: 0,
        color: isDark ? WruColors.surfaceDark : WruColors.surfaceLight,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isDark ? WruColors.grey700 : WruColors.grey200,
            width: 1,
          ),
        ),
      ),

      // Slider
      sliderTheme: SliderThemeData(
        activeTrackColor: WruColors.primary,
        inactiveTrackColor:
            isDark ? WruColors.grey700 : WruColors.grey200,
        thumbColor: WruColors.primary,
        overlayColor: WruColors.primary.withValues(alpha: 0.12),
        trackHeight: 6,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 12),
      ),

      // ProgressIndicator
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: WruColors.primary,
        linearMinHeight: 6,
      ),

      // BottomSheet
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor:
            isDark ? WruColors.surfaceDark : WruColors.surfaceLight,
        modalBackgroundColor:
            isDark ? WruColors.surfaceDark : WruColors.surfaceLight,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        modalElevation: 24,
        clipBehavior: Clip.antiAlias,
      ),

      // Divider
      dividerTheme: DividerThemeData(
        color: isDark ? WruColors.grey700 : WruColors.grey200,
        thickness: 1,
        space: 1,
      ),

      // Chip
      chipTheme: ChipThemeData(
        backgroundColor:
            isDark ? WruColors.surfaceVariantDark : WruColors.grey100,
        labelStyle: WruTextTheme.labelMedium,
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
    );
  }
}
