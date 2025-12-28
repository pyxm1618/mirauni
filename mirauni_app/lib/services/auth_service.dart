import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';

/// 认证服务
/// 封装手机号登录、微信登录等认证逻辑
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  /// 发送验证码
  /// 调用 Supabase Edge Function
  Future<void> sendCode(String phone) async {
    final response = await supabase.functions.invoke(
      'send-sms-code',
      body: {'phone': phone},
    );

    if (response.status != 200) {
      final error = response.data?['error'] ?? '发送验证码失败';
      throw AuthException(error.toString());
    }
  }

  /// 验证码登录
  /// 调用 Supabase Edge Function 验证并登录
  Future<AppUser> loginWithPhone(String phone, String code) async {
    final response = await supabase.functions.invoke(
      'verify-sms-code',
      body: {'phone': phone, 'code': code},
    );

    if (response.status != 200) {
      final error = response.data?['error'] ?? '验证码错误';
      throw AuthException(error.toString());
    }

    // Edge Function 返回 access_token 和 refresh_token
    final accessToken = response.data['access_token'] as String?;
    final refreshToken = response.data['refresh_token'] as String?;

    if (accessToken != null && refreshToken != null) {
      // 设置 Supabase session
      await supabase.auth.setSession(accessToken);
    }

    // 返回用户信息
    final userData = response.data['user'];
    if (userData != null) {
      return AppUser.fromJson(userData);
    }

    // 如果没有返回用户信息，尝试从数据库获取
    final userId = supabase.auth.currentUser?.id;
    if (userId != null) {
      final userResponse = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      return AppUser.fromJson(userResponse);
    }

    throw AuthException('登录失败，无法获取用户信息');
  }

  /// 绑定手机号（微信登录后）
  Future<void> bindPhone(String phone, String code) async {
    final response = await supabase.functions.invoke(
      'bind-phone',
      body: {'phone': phone, 'code': code},
    );

    if (response.status != 200) {
      final error = response.data?['error'] ?? '绑定失败';
      throw AuthException(error.toString());
    }
  }

  /// 退出登录
  Future<void> signOut() async {
    await supabase.auth.signOut();
  }

  /// 获取当前用户
  Future<AppUser?> getCurrentUser() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return null;

    try {
      final response = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      return AppUser.fromJson(response);
    } catch (e) {
      return null;
    }
  }
}

/// 认证异常
class AuthException implements Exception {
  final String message;
  AuthException(this.message);

  @override
  String toString() => message;
}
