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
  final String initialType; // 'password' or 'code'

  const LoginPage({
    super.key,
    this.redirect,
    this.initialType = 'password',
  });

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  final _wechatService = WechatService();

  bool _isWechatInstalled = false;
  bool _isLoading = false;
  late bool _isPasswordLogin;
  int _countdown = 0;
  Timer? _timer;
  
  String? _phoneError;
  String? _codeError;
  String? _passwordError;

  @override
  void initState() {
    super.initState();
    _isPasswordLogin = widget.initialType != 'code';
    _checkWechatInstalled();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _passwordController.dispose();
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
        _navigateHome();
      }
    } on NeedBindPhoneException {
      if (mounted) context.push('/bind-phone');
    } catch (e) {
      if (mounted) Toast.error(context, e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  bool get _isPhoneValid => Validators.phone(_phoneController.text) == null;

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

  void _navigateHome() {
    if (widget.redirect != null && widget.redirect!.isNotEmpty) {
      context.go(widget.redirect!);
    } else {
      context.go('/');
    }
  }

  /// 登录逻辑
  Future<void> _login() async {
    final phoneError = Validators.phone(_phoneController.text);
    String? codeError;
    String? passwordError;

    if (_isPasswordLogin) {
      if (_passwordController.text.length < 6) passwordError = '请输入密码';
    } else {
      codeError = Validators.code(_codeController.text);
    }

    setState(() {
      _phoneError = phoneError;
      _codeError = codeError;
      _passwordError = passwordError;
    });

    if (phoneError != null || codeError != null || passwordError != null) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isPasswordLogin) {
        // 密码登录
        await _authService.loginWithPassword(
          _phoneController.text,
          _passwordController.text,
        );
        if (mounted) {
          Toast.success(context, '登录成功');
          _navigateHome();
        }
      } else {
        // 验证码登录
        final user = await _authService.loginWithCode(
          _phoneController.text,
          _codeController.text,
        );
        
        if (mounted) {
          if (!user.hasPassword) {
            // 强制跳转设置密码
            Toast.info(context, '为了您的账户安全，请设置密码');
            context.go('/set-password');
          } else {
            Toast.success(context, '登录成功');
            _navigateHome();
          }
        }
      }
    } catch (e) {
      if (mounted) Toast.error(context, e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _switchToRegister() {
    setState(() {
      _isPasswordLogin = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: LoadingOverlay(
        isLoading: _isLoading,
        child: SafeArea(
          child: Stack(
            children: [
              // Close Button
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
              
              Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          border: Border.all(color: Colors.black, width: 3),
                          boxShadow: const [
                             BoxShadow(color: Colors.black, offset: Offset(4, 4), blurRadius: 0)
                          ],
                        ),
                        transform: Matrix4.rotationZ(-0.05),
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
                      
                      const SizedBox(height: 48),

                      // Form Container
                      Container(
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
                            // Tab Switcher
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _isPasswordLogin = true),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      decoration: BoxDecoration(
                                        color: _isPasswordLogin ? Colors.white : Colors.grey[200],
                                        border: const Border(
                                          bottom: BorderSide(color: Colors.black, width: 3),
                                          right: BorderSide(color: Colors.black, width: 1.5),
                                        ),
                                      ),
                                      child: const Text(
                                        '密码登录',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: () => setState(() => _isPasswordLogin = false),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      decoration: BoxDecoration(
                                        color: !_isPasswordLogin ? Colors.white : Colors.grey[200],
                                        border: const Border(
                                          bottom: BorderSide(color: Colors.black, width: 3),
                                          left: BorderSide(color: Colors.black, width: 1.5),
                                        ),
                                      ),
                                      child: const Text(
                                        '验证码登录', 
                                        textAlign: TextAlign.center,
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Phone Input
                                  BrutalistTextField(
                                    controller: _phoneController,
                                    label: '手机号',
                                    placeholder: '请输入手机号',
                                    keyboardType: TextInputType.phone,
                                    errorText: _phoneError,
                                    enabled: !_isLoading,
                                    onChanged: (val) {
                                      if (_phoneError != null) setState(() => _phoneError = null);
                                    },
                                  ),
                                  const SizedBox(height: 24),

                                  if (_isPasswordLogin) ...[
                                    // Password Input
                                    BrutalistTextField(
                                      controller: _passwordController,
                                      label: '密码',
                                      placeholder: '请输入密码',
                                      obscureText: true,
                                      errorText: _passwordError,
                                      enabled: !_isLoading,
                                      onChanged: (val) {
                                        if (_passwordError != null) setState(() => _passwordError = null);
                                      },
                                    ),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: TextButton(
                                        onPressed: () => context.push('/reset-password'),
                                        child: const Text(
                                          '忘记密码?',
                                          style: TextStyle(
                                            color: Colors.black,
                                            decoration: TextDecoration.underline,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ] else ...[
                                    // Code Input
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Expanded(
                                          child: BrutalistTextField(
                                            controller: _codeController,
                                            label: '验证码',
                                            placeholder: '6位数字',
                                            keyboardType: TextInputType.number,
                                            errorText: _codeError,
                                            enabled: !_isLoading,
                                            onChanged: (val) {
                                              if (_codeError != null) setState(() => _codeError = null);
                                            },
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        SizedBox(
                                          width: 120,
                                          child: BrutalistButton(
                                             text: _countdown > 0 ? '${_countdown}s' : '获取验证码',
                                             fontSize: 14,
                                             backgroundColor: _countdown > 0 ? Colors.grey[300] : AppColors.secondary,
                                             onPressed: (_countdown > 0 || !_isPhoneValid || _isLoading) 
                                                 ? null 
                                                 : _sendCode,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],

                                  const SizedBox(height: 32),

                                  // Login Button
                                  BrutalistButton(
                                    text: '登 录',
                                    isFullWidth: true,
                                     backgroundColor: AppColors.primary,
                                    onPressed: _login,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // WeChat & Register
                      Column(
                        children: [
                           const Row(
                             children: [
                               Expanded(child: Divider(color: Colors.black, thickness: 1)),
                               Padding(
                                 padding: EdgeInsets.symmetric(horizontal: 16),
                                 child: Text('或', style: TextStyle(fontWeight: FontWeight.bold)),
                               ),
                               Expanded(child: Divider(color: Colors.black, thickness: 1)),
                             ],
                           ),
                           const SizedBox(height: 24),
                           
                           // WeChat Login Button
                           InkWell(
                            onTap: _isLoading ? null : _loginWithWechat,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF07C160),
                                border: Border.all(color: Colors.black, width: 2),
                                boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(2, 2))],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.chat_bubble, color: Colors.white, size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    '微信登录',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                           ),
                           const SizedBox(height: 32),

                          GestureDetector(
                            onTap: _switchToRegister,
                            child: RichText(
                              text: const TextSpan(
                                text: "还没有账号？",
                                style: TextStyle(color: Colors.black),
                                children: [
                                  TextSpan(
                                    text: "[ 立即注册 ]",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
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
