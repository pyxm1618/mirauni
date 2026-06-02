import 'package:flutter/material.dart';
import '../../config/constants.dart';

class BrutalistCard extends StatelessWidget {
  final Widget child;
  final Color? backgroundColor;
  final EdgeInsetsGeometry? padding;
  final double borderWidth;
  final Offset shadowOffset;

  const BrutalistCard({
    super.key,
    required this.child,
    this.backgroundColor,
    this.padding,
    this.borderWidth = 3.0,
    this.shadowOffset = const Offset(4, 4),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? AppColors.cardBackground,
        border: Border.all(
          color: AppColors.border,
          width: borderWidth,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.border,
            offset: shadowOffset,
            blurRadius: 0,
            spreadRadius: 0,
          ),
        ],
      ),
      padding: padding ?? const EdgeInsets.all(AppSpacing.md),
      child: child,
    );
  }
}
