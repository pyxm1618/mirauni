import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/constants.dart';

/// 手机号输入组件
class PhoneInput extends StatelessWidget {
  final TextEditingController controller;
  final String? errorText;
  final bool enabled;
  final ValueChanged<String>? onChanged;

  const PhoneInput({
    super.key,
    required this.controller,
    this.errorText,
    this.enabled = true,
    this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: TextInputType.phone,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(11),
      ],
      onChanged: onChanged,
      style: const TextStyle(
        fontSize: 16,
        color: AppColors.textPrimary,
        letterSpacing: 1,
      ),
      decoration: InputDecoration(
        hintText: '请输入手机号',
        hintStyle: TextStyle(
          color: AppColors.textLight,
          fontSize: 16,
        ),
        prefixIcon: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '+86',
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 1,
                height: 20,
                color: AppColors.border,
              ),
            ],
          ),
        ),
        prefixIconConstraints: const BoxConstraints(minWidth: 0),
        errorText: errorText,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: AppColors.error, width: 2),
        ),
      ),
    );
  }
}
