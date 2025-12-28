import 'package:flutter/material.dart';
import '../config/constants.dart';

/// Toast 提示工具
class Toast {
  static OverlayEntry? _currentEntry;

  /// 显示成功提示
  static void success(BuildContext context, String message) {
    _show(context, message, AppColors.success, Icons.check_circle);
  }

  /// 显示错误提示
  static void error(BuildContext context, String message) {
    _show(context, message, AppColors.error, Icons.error);
  }

  /// 显示警告提示
  static void warning(BuildContext context, String message) {
    _show(context, message, AppColors.warning, Icons.warning);
  }

  /// 显示信息提示
  static void info(BuildContext context, String message) {
    _show(context, message, AppColors.info, Icons.info);
  }

  /// 显示 Toast
  static void _show(
    BuildContext context,
    String message,
    Color color,
    IconData icon,
  ) {
    // 移除现有的 toast
    _currentEntry?.remove();
    _currentEntry = null;

    final overlay = Overlay.of(context);

    _currentEntry = OverlayEntry(
      builder: (context) => Positioned(
        top: MediaQuery.of(context).padding.top + 50,
        left: 24,
        right: 24,
        child: Material(
          color: Colors.transparent,
          child: _ToastWidget(
            message: message,
            color: color,
            icon: icon,
            onDismiss: () {
              _currentEntry?.remove();
              _currentEntry = null;
            },
          ),
        ),
      ),
    );

    overlay.insert(_currentEntry!);
  }
}

class _ToastWidget extends StatefulWidget {
  final String message;
  final Color color;
  final IconData icon;
  final VoidCallback onDismiss;

  const _ToastWidget({
    required this.message,
    required this.color,
    required this.icon,
    required this.onDismiss,
  });

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );
    _controller.forward();

    // 自动消失
    Future.delayed(const Duration(seconds: 2), () {
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
    return FadeTransition(
      opacity: _animation,
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0, -0.5),
          end: Offset.zero,
        ).animate(_animation),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: widget.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Icon(
                  widget.icon,
                  color: widget.color,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  widget.message,
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
