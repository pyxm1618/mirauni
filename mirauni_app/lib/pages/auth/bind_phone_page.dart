import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../services/wechat_service.dart';
import '../../utils/validators.dart';
import '../../utils/toast.dart';
import '../../widgets/form/phone_input.dart';
import '../../widgets/form/code_input.dart';
import '../../widgets/common/loading.dart';

/// 绑定手机号页面
/// 
/// 微信登录后若用户未绑定手机号，需要先绑定
class BindPhonePage extends ConsumerStatefulWidget {
  const BindPhonePage({super.key});

  @override
  ConsumerState<BindPhonePage> createState() => _BindPhonePageState();
}

class _BindPhonePageState extends ConsumerState<BindPhonePage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _authService = AuthService();
  final _wechatService = WechatService();

  bool _isLoading = false;
  int _countdown = 0;
  Timer? _timer;
  String? _phoneError;
  String? _codeError;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  bool get _isPhoneValid {
    return Validators.phone(_phoneController.text) == null;
  }

  bool get _isCodeValid {
    return Validators.code(_codeController.text) == null;
  }

  bool get _canSubmit {
    return _isPhoneValid && _isCodeValid && !_isLoading;
  }

  /// 发送验证码
  Future<void> _sendCode() async {
    final phoneError = Validators.phone(_phoneController.text);
    if (phoneError != null) {
      setState(() => _phoneError = phoneError);
      return;
    }

    setState(() {
      _phoneError = null;
      _isLoading = true;
    });

    try {
      await _authService.sendCode(_phoneController.text);
      if (mounted) {
        Toast.success(context, '验证码已发送');
        _startCountdown();
      }
    } catch (e) {
      if (mounted) {
        Toast.error(context, e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  /// 开始倒计时
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

  /// 绑定手机号
  Future<void> _bindPhone() async {
    final phoneError = Validators.phone(_phoneController.text);
    final codeError = Validators.code(_codeController.text);

    setState(() {
      _phoneError = phoneError;
      _codeError = codeError;
    });

    if (phoneError != null || codeError != null) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _wechatService.bindPhone(
        _phoneController.text,
        _codeController.text,
      );

      if (mounted) {
        Toast.success(context, '绑定成功');
        context.go('/');
      }
    } catch (e) {
      if (mounted) {
        Toast.error(context, e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          color: AppColors.textPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          '绑定手机号',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                
                // 提示文本
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '为了保护您的账号安全，请绑定手机号',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 32),

                // 手机号输入
                PhoneInput(
                  controller: _phoneController,
                  errorText: _phoneError,
                  enabled: !_isLoading,
                  onChanged: (value) {
                    if (_phoneError != null) {
                      setState(() => _phoneError = null);
                    }
                  },
                ),
                const SizedBox(height: 16),

                // 验证码输入
                CodeInput(
                  controller: _codeController,
                  errorText: _codeError,
                  enabled: !_isLoading,
                  countdown: _countdown,
                  canSend: _isPhoneValid,
                  onSendCode: _sendCode,
                  onChanged: (value) {
                    if (_codeError != null) {
                      setState(() => _codeError = null);
                    }
                  },
                ),
                const SizedBox(height: 32),

                // 绑定按钮
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _canSubmit ? _bindPhone : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: AppColors.primary.withOpacity(0.5),
                      disabledForegroundColor: Colors.white70,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      '绑定',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
