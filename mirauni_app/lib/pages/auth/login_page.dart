import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../services/auth_service.dart';
import '../../services/wechat_service.dart';
import '../../utils/validators.dart';
import '../../utils/toast.dart';
import '../../widgets/common/brutalist_button.dart';
import '../../widgets/form/brutalist_text_field.dart';
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
      backgroundColor: AppColors.primary, // Yellow background
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: Stack(
            children: [
              // 关闭按钮 - 返回首页
              Positioned(
                top: 16,
                left: 16,
                child: GestureDetector(
                  onTap: () => context.go('/'),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [
                        BoxShadow(color: Colors.black, offset: Offset(2, 2), blurRadius: 0)
                      ],
                    ),
                    child: const Icon(Icons.close, color: Colors.black, size: 24),
                  ),
                ),
              ),
              // 主内容
              Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                // Logo/Header Area
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    border: Border.all(color: Colors.black, width: 3),
                    boxShadow: const [
                       BoxShadow(
                         color: Colors.black,
                         offset: Offset(4, 4),
                         blurRadius: 0,
                       )
                    ],
                  ),
                  transform: Matrix4.rotationZ(-0.05), // Slight rotation
                  child: const Text(
                    'LOGIN.',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
                
                const SizedBox(height: 64),

                // Login Form Container
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
                        'ACCESS SYSTEM',
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

                      // Phone Input
                      BrutalistTextField(
                        controller: _phoneController,
                        label: 'Phone Number',
                        placeholder: 'YOUR PHONE NO.',
                        keyboardType: TextInputType.phone,
                        errorText: _phoneError,
                        enabled: !_isLoading,
                        onChanged: (value) {
                           if (_phoneError != null) setState(() => _phoneError = null);
                        },
                      ),
                      const SizedBox(height: 24),

                      // Code Input Row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: BrutalistTextField(
                              controller: _codeController,
                              label: 'Verification Code',
                              placeholder: 'XXXXXX',
                              keyboardType: TextInputType.number,
                              errorText: _codeError,
                              enabled: !_isLoading,
                              onChanged: (value) {
                                if (_codeError != null) setState(() => _codeError = null);
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Send Code Button
                          SizedBox(
                            width: 120,
                            child: BrutalistButton(
                               text: _countdown > 0 ? '${_countdown}S' : 'GET CODE',
                               fontSize: 14,
                               backgroundColor: _countdown > 0 ? Colors.grey[300] : AppColors.secondary,
                               onPressed: (_countdown > 0 || !_isPhoneValid || _isLoading) 
                                   ? null 
                                   : _sendCode,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 32),

                      // Login Button
                      BrutalistButton(
                        text: 'ENTER SYSTEM',
                        isFullWidth: true,
                         backgroundColor: AppColors.primary,
                        onPressed: _canLogin ? _login : null,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Agreement
                 Text.rich(
                    TextSpan(
                      text: 'AGREE TO ',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                      children: [
                        TextSpan(
                          text: 'TERMS',
                          style: const TextStyle(
                            decoration: TextDecoration.underline,
                          ),
                          // TODO: Add tap handler
                        ),
                        const TextSpan(text: ' & '),
                        TextSpan(
                          text: 'PRIVACY',
                          style: const TextStyle(
                            decoration: TextDecoration.underline,
                          ),
                           // TODO: Add tap handler
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),

                const SizedBox(height: 48),

                // WeChat Login
                if (_isWechatInstalled) ...[
                   Column(
                    children: [
                      const Text(
                        'OR CONNECT WITH',
                         style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 16),
                      InkWell(
                        onTap: _isLoading ? null : _loginWithWechat,
                        child: Container(
                          width: 60,
                          height: 60,
                          decoration: BoxDecoration(
                            color: const Color(0xFF07C160),
                            border: Border.all(color: Colors.black, width: 3),
                            boxShadow: const [
                              BoxShadow(
                                color: Colors.black,
                                offset: Offset(4, 4),
                                blurRadius: 0,
                              )
                            ],
                          ),
                          child: const Icon(
                            Icons.chat_bubble,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
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
