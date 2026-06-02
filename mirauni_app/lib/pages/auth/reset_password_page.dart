import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../utils/validators.dart';
import '../../utils/toast.dart';
import '../../widgets/common/brutalist_button.dart';
import '../../widgets/form/brutalist_text_field.dart';
import '../../widgets/common/loading.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  
  bool _isLoading = false;
  int _countdown = 0;
  Timer? _timer;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final phoneError = Validators.phone(_phoneController.text);
    if (phoneError != null) {
      Toast.error(context, phoneError);
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.sendCode(_phoneController.text);
      if (mounted) {
        Toast.success(context, 'Code sent');
        _startCountdown();
      }
    } catch (e) {
      if (mounted) Toast.error(context, e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _startCountdown() {
    setState(() => _countdown = 60);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() => _countdown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _submit() async {
    if (_phoneController.text.isEmpty || _codeController.text.isEmpty || _passwordController.text.isEmpty) {
      return;
    }

    setState(() => _isLoading = true);
    try {
      await _authService.resetPassword(
        _phoneController.text,
        _codeController.text,
        _passwordController.text,
      );
      if (mounted) {
        Toast.success(context, 'Password reset successfully. Please login.');
        context.pop(); // Return to login
      }
    } catch (e) {
      if (mounted) Toast.error(context, e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: Colors.black, width: 3),
                  boxShadow: const [
                    BoxShadow(color: Colors.black, offset: Offset(8, 8), blurRadius: 0)
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'RESET PASSWORD',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Colors.black,
                        decoration: TextDecoration.underline,
                        decorationThickness: 3,
                      ),
                    ),
                    const SizedBox(height: 32),
                    BrutalistTextField(
                      controller: _phoneController,
                      label: 'Phone Number',
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: BrutalistTextField(
                            controller: _codeController,
                            label: 'Code',
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 12),
                        SizedBox(
                          width: 120,
                          child: BrutalistButton(
                            text: _countdown > 0 ? '${_countdown}S' : 'GET CODE',
                            fontSize: 14,
                            backgroundColor: _countdown > 0 ? Colors.grey[300] : AppColors.secondary,
                            onPressed: (_countdown > 0 || _isLoading) ? null : _sendCode,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    BrutalistTextField(
                      controller: _passwordController,
                      label: 'New Password',
                      obscureText: true,
                    ),
                    const SizedBox(height: 32),
                    BrutalistButton(
                      text: 'RESET',
                      isFullWidth: true,
                      backgroundColor: AppColors.primary,
                      onPressed: _submit,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
