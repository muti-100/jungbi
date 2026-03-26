import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ---------------------------------------------------------------------------
// WruBottomSheet
//
// Reusable modal bottom sheet with a standardised drag handle,
// safe-area padding, and consistent Waruru styling.
// ---------------------------------------------------------------------------
class WruBottomSheet extends StatelessWidget {
  const WruBottomSheet({
    super.key,
    required this.child,
    this.title,
    this.titleWidget,
    this.actions,
    this.showDragHandle = true,
    this.showCloseButton = false,
    this.horizontalPadding = 20,
    this.topPadding = 8,
    this.bottomPaddingExtra = 0,
  });

  final Widget child;

  /// Plain string title — ignored when [titleWidget] is provided.
  final String? title;

  /// Custom title widget — overrides [title].
  final Widget? titleWidget;

  /// Action buttons placed at the sheet's bottom (above safe area).
  final List<Widget>? actions;

  final bool showDragHandle;
  final bool showCloseButton;
  final double horizontalPadding;
  final double topPadding;

  /// Extra bottom padding added on top of the system safe area.
  final double bottomPaddingExtra;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final safePadding = MediaQuery.of(context).padding.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ---- Drag handle ----
          if (showDragHandle)
            Padding(
              padding: const EdgeInsets.only(top: 12, bottom: 4),
              child: Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.20),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),

          // ---- Header row ----
          if (title != null || titleWidget != null || showCloseButton)
            Padding(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                topPadding,
                showCloseButton ? 8 : horizontalPadding,
                0,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: titleWidget ??
                        Text(
                          title ?? '',
                          style: theme.textTheme.titleLarge,
                        ),
                  ),
                  if (showCloseButton)
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(
                        Icons.close,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      ),
                      tooltip: '닫기',
                    ),
                ],
              ),
            ),

          // ---- Body ----
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                title != null || titleWidget != null ? 16 : topPadding,
                horizontalPadding,
                actions != null ? 0 : safePadding + bottomPaddingExtra + 20,
              ),
              child: child,
            ),
          ),

          // ---- Action buttons ----
          if (actions != null && actions!.isNotEmpty)
            Padding(
              padding: EdgeInsets.fromLTRB(
                horizontalPadding,
                12,
                horizontalPadding,
                safePadding + bottomPaddingExtra + 16,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: _intersperse(
                  actions!,
                  const SizedBox(height: 10),
                ),
              ),
            ),
        ],
      ),
    );
  }

  static List<Widget> _intersperse(List<Widget> items, Widget separator) {
    final result = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      result.add(items[i]);
      if (i < items.length - 1) result.add(separator);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// showWruBottomSheet — convenience helper
//
// Usage:
//   await showWruBottomSheet(
//     context: context,
//     title: '제목',
//     child: MyWidget(),
//   );
// ---------------------------------------------------------------------------
Future<T?> showWruBottomSheet<T>({
  required BuildContext context,
  required Widget child,
  String? title,
  Widget? titleWidget,
  List<Widget>? actions,
  bool showDragHandle = true,
  bool showCloseButton = false,
  bool isDismissible = true,
  bool enableDrag = true,
  double horizontalPadding = 20,
  double topPadding = 8,
  double bottomPaddingExtra = 0,
  // Set a maxHeightFraction to prevent the sheet swallowing the screen.
  double maxHeightFraction = 0.92,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    isDismissible: isDismissible,
    enableDrag: enableDrag,
    backgroundColor: Colors.transparent,
    builder: (ctx) => ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(ctx).size.height * maxHeightFraction,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(ctx).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: WruBottomSheet(
          title: title,
          titleWidget: titleWidget,
          actions: actions,
          showDragHandle: showDragHandle,
          showCloseButton: showCloseButton,
          horizontalPadding: horizontalPadding,
          topPadding: topPadding,
          bottomPaddingExtra: bottomPaddingExtra,
          child: child,
        ),
      ),
    ),
  );
}
