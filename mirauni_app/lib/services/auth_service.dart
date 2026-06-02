import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/env.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';

/// 认证服务
/// 封装手机号登录、密码登录等认证逻辑
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final _dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  /// 发送验证码
  Future<void> sendCode(String phone) async {
    try {
      await _dio.post('/auth/send-code', data: {'phone': phone});
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '发送验证码失败';
      throw AuthException(message.toString());
    } catch (e) {
      throw AuthException('网络错误，请稍后重试');
    }
  }

  /// 验证码登录
  Future<AppUser> loginWithCode(String phone, String code) async {
    try {
      final response = await _dio.post('/auth/verify-code', data: {
        'phone': phone,
        'code': code,
      });

      final data = response.data;
      if (data['success'] != true) {
        throw AuthException(data['message'] ?? '登录失败');
      }

      // 设置 Supabase session
      final session = data['session'];
      if (session != null) {
        await supabase.auth.setSession(
          session['access_token'],
          refreshToken: session['refresh_token'],
        );
      }

      // 返回用户信息
      return AppUser.fromJson(data['user']);
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '验证码错误';
      throw AuthException(message.toString());
    } catch (e) {
      throw AuthException('登录失败：${e.toString()}');
    }
  }

  /// 密码登录
  Future<AppUser> loginWithPassword(String phone, String password) async {
    try {
      final response = await _dio.post('/auth/login-password', data: {
        'phone': phone,
        'password': password,
      });

      final data = response.data;
      if (data['success'] != true) {
        throw AuthException(data['message'] ?? '登录失败');
      }

      final session = data['session'];
      if (session != null) {
        await supabase.auth.setSession(
          session['access_token'],
          refreshToken: session['refresh_token'],
        );
      }

      return AppUser.fromJson(data['user']);
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '账号或密码错误';
      throw AuthException(message.toString());
    } catch (e) {
      throw AuthException('登录失败：${e.toString()}');
    }
  }

  /// 设置/修改密码
  Future<void> setPassword(String password) async {
    final token = supabase.auth.currentSession?.accessToken;
    if (token == null) throw AuthException('未登录');

    try {
      await _dio.post(
        '/auth/set-password',
        data: {'password': password},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '设置密码失败';
      throw AuthException(message.toString());
    }
  }

  /// 重置密码 (忘记密码)
  Future<void> resetPassword(String phone, String code, String newPassword) async {
    try {
      await _dio.post('/auth/reset-password', data: {
        'phone': phone,
        'code': code,
        'newPassword': newPassword,
      });
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '重置密码失败';
      throw AuthException(message.toString());
    }
  }

  /// 绑定手机号（微信登录后）
  Future<void> bindPhone(String phone, String code) async {
    final token = supabase.auth.currentSession?.accessToken;
    try {
      await _dio.post(
        '/auth/bind-phone',
        data: {'phone': phone, 'code': code},
        options: Options(headers: token != null ? {'Authorization': 'Bearer $token'} : null),
      );
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? '绑定失败';
      throw AuthException(message.toString());
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
