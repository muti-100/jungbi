import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ---------------------------------------------------------------------------
// WruButton variants
// ---------------------------------------------------------------------------
enum WruButtonVariant { primary, secondary, ghost }

// ---------------------------------------------------------------------------
// WruButton
//
// All interactive elements must have a minimum touch target of 44px.
// WruButton enforces minHeight: 52px (comfortable tap, per design system).
// ---------------------------------------------------------------------------
class WruButton extends StatelessWidget {
  const WruButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = WruButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.width,
    this.height = 52,
    this.borderRadius,
  });

  final String label;
  final VoidCallback? onPressed;
  final WruButtonVariant variant;
  final bool isLoading;
  final Widget? icon;

  /// Pass null to make the button expand to available width (default).
  final double? width;

  /// Minimum height — must not go below 44px per design system.
  final double height;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final effectiveBorderRadius =
        borderRadius ?? BorderRadius.circular(14);

    Widget child = isLoading
        ? SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              color: _foregroundColor(isDark),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                IconTheme(
                  data: IconThemeData(
                    color: _foregroundColor(isDark),
                    size: 20,
                  ),
                  child: icon!,
                ),
                const SizedBox(width: 8),
              ],
              Text(
                label,
                style: theme.textTheme.labelLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                  color: _foregroundColor(isDark),
                ),
              ),
            ],
          );

    final buttonContent = AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      constraints: BoxConstraints(
        minHeight: height,
        minWidth: 44,
      ),
      width: width,
      decoration: _buildDecoration(isDark, effectiveBorderRadius),
      child: Material(
        type: MaterialType.transparency,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: effectiveBorderRadius,
          splashColor: _foregroundColor(isDark).withValues(alpha: 0.12),
          highlightColor: _foregroundColor(isDark).withValues(alpha: 0.08),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            child: Center(child: child),
          ),
        ),
      ),
    );

    // Dim when disabled
    if (onPressed == null && !isLoading) {
      return Opacity(opacity: 0.38, child: buttonContent);
    }

    return buttonContent;
  }

  Color _foregroundColor(bool isDark) {
    switch (variant) {
      case WruButtonVariant.primary:
        return Colors.white;
      case WruButtonVariant.secondary:
        return WruColors.secondary;
      case WruButtonVariant.ghost:
        return isDark ? Colors.white : WruColors.grey800;
    }
  }

  BoxDecoration _buildDecoration(bool isDark, BorderRadius radius) {
    switch (variant) {
      case WruButtonVariant.primary:
        return BoxDecoration(
          color: WruColors.primary,
          borderRadius: radius,
          boxShadow: [
            BoxShadow(
              color: WruColors.primary.withValues(alpha: 0.30),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        );
      case WruButtonVariant.secondary:
        return BoxDecoration(
          color: Colors.transparent,
          borderRadius: radius,
          border: Border.all(color: WruColors.secondary, width: 1.5),
        );
      case WruButtonVariant.ghost:
        return BoxDecoration(
          color: isDark
              ? WruColors.grey700.withValues(alpha: 0.5)
              : WruColors.grey100,
          borderRadius: radius,
        );
    }
  }
}
