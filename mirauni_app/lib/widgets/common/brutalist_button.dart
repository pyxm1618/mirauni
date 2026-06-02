import 'package:flutter/material.dart';
import '../../config/constants.dart';

class BrutalistButton extends StatefulWidget {
  final String text;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? textColor;
  final bool isFullWidth;
  final double fontSize;

  const BrutalistButton({
    super.key,
    required this.text,
    this.onPressed,
    this.backgroundColor,
    this.textColor,
    this.isFullWidth = false,
    this.fontSize = 16,
  });

  @override
  State<BrutalistButton> createState() => _BrutalistButtonState();
}

class _BrutalistButtonState extends State<BrutalistButton> {
  bool _isPressed = false;

  void _handleTapDown(TapDownDetails details) {
    if (widget.onPressed == null) return;
    setState(() => _isPressed = true);
  }

  void _handleTapUp(TapUpDetails details) {
    if (widget.onPressed == null) return;
    setState(() => _isPressed = false);
    widget.onPressed?.call();
  }

  void _handleTapCancel() {
    if (widget.onPressed == null) return;
    setState(() => _isPressed = false);
  }

  @override
  Widget build(BuildContext context) {
    const double shadowDist = 4.0;
    final double offset = _isPressed ? shadowDist : 0.0;
    final double currentShadow = _isPressed ? 0.0 : shadowDist;

    Widget buttonContent = Container(
      width: widget.isFullWidth ? double.infinity : null,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: widget.onPressed == null 
            ? AppColors.textLight.withOpacity(0.3) 
            : (widget.backgroundColor ?? AppColors.primary),
        border: Border.all(color: AppColors.border, width: 3),
      ),
      child: Text(
        widget.text.toUpperCase(),
        textAlign: TextAlign.center,
        style: TextStyle(
          color: widget.onPressed == null 
              ? AppColors.textSecondary 
              : (widget.textColor ?? AppColors.textPrimary),
          fontSize: widget.fontSize,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.5,
        ),
      ),
    );

    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Shadow/Background position (static relative to parent, simplified for stack)
          // Actually, transform is easier.
          
          // Let's use Transform.translate for the "press" effect
          Transform.translate(
            offset: Offset(offset, offset),
            child: Container(
              decoration: BoxDecoration(
                 boxShadow: [
                   BoxShadow(
                     color: AppColors.border,
                     offset: Offset(currentShadow, currentShadow),
                     blurRadius: 0,
                     spreadRadius: 0,
                   )
                 ],
              ),
              child: buttonContent
            ),
          ),
        ],
      ),
    );
  }
}
