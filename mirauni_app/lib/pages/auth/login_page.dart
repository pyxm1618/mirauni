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

/// 登录页面
class LoginPage extends ConsumerStatefulWidget {
  final String? redirect;

  const LoginPage({super.key, this.redirect});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _authService = AuthService();
  final _wechatService = WechatService();

  bool _isWechatInstalled = false;

  bool _isLoading = false;
  int _countdown = 0;
  Timer? _timer;
  String? _phoneError;
  String? _codeError;

  @override
  void initState() {
    super.initState();
    _checkWechatInstalled();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  /// 检查微信是否安装
  Future<void> _checkWechatInstalled() async {
    final installed = await _wechatService.isWechatInstalled();
    if (mounted) {
      setState(() => _isWechatInstalled = installed);
    }
  }

  /// 微信登录
  Future<void> _loginWithWechat() async {
    if (!_isWechatInstalled) {
      Toast.info(context, '请先安装微信');
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _wechatService.init();
      await _wechatService.loginWithWechat();

      if (mounted) {
        Toast.success(context, '登录成功');
        if (widget.redirect != null && widget.redirect!.isNotEmpty) {
          context.go(widget.redirect!);
        } else {
          context.go('/');
        }
      }
    } on NeedBindPhoneException {
      // 需要绑定手机号
      if (mounted) {
        context.push('/bind-phone');
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

  bool get _isPhoneValid {
    return Validators.phone(_phoneController.text) == null;
  }

  bool get _isCodeValid {
    return Validators.code(_codeController.text) == null;
  }

  bool get _canLogin {
    return _isPhoneValid && _isCodeValid && !_isLoading;
  }

  /// 发送验证码
  Future<void> _sendCode() async {
    // 验证手机号
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

  /// 登录
  Future<void> _login() async {
    // 验证
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
      await _authService.loginWithPhone(
        _phoneController.text,
        _codeController.text,
      );

      if (mounted) {
        Toast.success(context, '登录成功');
        // 跳转到首页或重定向页面
        if (widget.redirect != null && widget.redirect!.isNotEmpty) {
          context.go(widget.redirect!);
        } else {
          context.go('/');
        }
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
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 48),
                // Logo 和标题
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [AppColors.primary, AppColors.primaryDark],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 20,
                              offset: const Offset(0, 10),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.flash_on,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        AppConstants.appName,
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        AppConstants.appDescription,
                        style: TextStyle(
                          fontSize: 16,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 64),

                // 表单
                Text(
                  '手机号登录',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 24),

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

                // 登录按钮
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _canLogin ? _login : null,
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
                      '登录',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // 协议提示
                Center(
                  child: Text.rich(
                    TextSpan(
                      text: '登录即表示同意',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                      children: [
                        TextSpan(
                          text: '《用户协议》',
                          style: TextStyle(
                            color: AppColors.primary,
                          ),
                        ),
                        const TextSpan(text: '和'),
                        TextSpan(
                          text: '《隐私政策》',
                          style: TextStyle(
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // 其他登录方式
                Center(
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Divider(color: AppColors.border),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              '其他登录方式',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textLight,
                              ),
                            ),
                          ),
                          Expanded(
                            child: Divider(color: AppColors.border),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // 微信登录按钮
                      InkWell(
                        onTap: _isLoading ? null : _loginWithWechat,
                        borderRadius: BorderRadius.circular(30),
                        child: Opacity(
                          opacity: _isWechatInstalled ? 1.0 : 0.5,
                          child: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: const Color(0xFF07C160),
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF07C160).withOpacity(0.3),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.chat_bubble,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '微信登录',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
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
