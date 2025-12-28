import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../config/constants.dart';

/// 验证码输入组件
class CodeInput extends StatelessWidget {
  final TextEditingController controller;
  final String? errorText;
  final bool enabled;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onSendCode;
  final int countdown;
  final bool canSend;

  const CodeInput({
    super.key,
    required this.controller,
    this.errorText,
    this.enabled = true,
    this.onChanged,
    this.onSendCode,
    this.countdown = 0,
    this.canSend = false,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: TextInputType.number,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(6),
      ],
      onChanged: onChanged,
      style: const TextStyle(
        fontSize: 16,
        color: AppColors.textPrimary,
        letterSpacing: 4,
      ),
      decoration: InputDecoration(
        hintText: '请输入验证码',
        hintStyle: TextStyle(
          color: AppColors.textLight,
          fontSize: 16,
          letterSpacing: 0,
        ),
        suffixIcon: Container(
          margin: const EdgeInsets.only(right: 8),
          child: TextButton(
            onPressed: canSend && countdown == 0 ? onSendCode : null,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              minimumSize: Size.zero,
            ),
            child: Text(
              countdown > 0 ? '${countdown}s' : '获取验证码',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: countdown > 0 || !canSend
                    ? AppColors.textLight
                    : AppColors.primary,
              ),
            ),
          ),
        ),
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
