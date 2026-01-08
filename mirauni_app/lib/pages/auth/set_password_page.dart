import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../utils/toast.dart';
import '../../widgets/common/brutalist_button.dart';
import '../../widgets/form/brutalist_text_field.dart';
import '../../widgets/common/loading.dart';

class SetPasswordPage extends StatefulWidget {
  const SetPasswordPage({super.key});

  @override
  State<SetPasswordPage> createState() => _SetPasswordPageState();
}

class _SetPasswordPageState extends State<SetPasswordPage> {
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  Future<void> _submit() async {
    final pwd = _passwordController.text;
    final confirm = _confirmController.text;

    if (pwd.length < 6) {
      Toast.error(context, 'Password must be at least 6 characters');
      return;
    }

    if (pwd != confirm) {
      Toast.error(context, 'Passwords do not match');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _authService.setPassword(pwd);
      if (mounted) {
        Toast.success(context, 'Password set successfully');
        context.go('/');
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
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: Center(
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
                        BoxShadow(
                          color: Colors.black,
                          offset: Offset(8, 8),
                          blurRadius: 0,
                        )
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'SET PASSWORD',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.black,
                            decoration: TextDecoration.underline,
                            decorationThickness: 3,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'For your security, please set a password.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                        const SizedBox(height: 32),
                        BrutalistTextField(
                          controller: _passwordController,
                          label: 'New Password',
                          placeholder: '******',
                          obscureText: true,
                        ),
                        const SizedBox(height: 24),
                        BrutalistTextField(
                          controller: _confirmController,
                          label: 'Confirm Password',
                          placeholder: '******',
                          obscureText: true,
                        ),
                        const SizedBox(height: 32),
                        BrutalistButton(
                          text: 'CONFIRM',
                          isFullWidth: true,
                          backgroundColor: AppColors.primary,
                          onPressed: _isLoading ? null : _submit,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
