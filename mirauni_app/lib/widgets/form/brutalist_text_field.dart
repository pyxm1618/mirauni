import 'package:flutter/material.dart';
import '../../config/constants.dart';

class BrutalistTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String label;
  final String? placeholder;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? errorText;
  final ValueChanged<String>? onChanged;
  final bool enabled;

  const BrutalistTextField({
    super.key,
    this.controller,
    required this.label,
    this.placeholder,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.errorText,
    this.onChanged,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.0,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.1), // Subtle shadow for input
                offset: const Offset(4, 4),
                blurRadius: 0,
              )
            ],
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            onChanged: onChanged,
            enabled: enabled,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 16,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: placeholder?.toUpperCase(),
              hintStyle: const TextStyle(
                color: AppColors.textLight,
                fontWeight: FontWeight.w600,
              ),
              filled: true,
              fillColor: AppColors.cardBackground,
              contentPadding: const EdgeInsets.all(16),
              border: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppColors.border, width: 3),
              ),
              enabledBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: AppColors.border, width: 3),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: const BorderSide(color: AppColors.textPrimary, width: 3),
              ),
              errorText: errorText,
            ),
          ),
        ),
      ],
    );
  }
}
