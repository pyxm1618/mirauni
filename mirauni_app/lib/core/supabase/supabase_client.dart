import 'package:supabase_flutter/supabase_flutter.dart';
import '../../config/env.dart';

/// Supabase 客户端管理器
class SupabaseClientManager {
  static SupabaseClient? _client;

  /// 初始化 Supabase
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: Env.supabaseUrl,
      anonKey: Env.supabaseAnonKey,
      debug: Env.isDevelopment,
    );
  }

  /// 获取 Supabase 客户端实例
  static SupabaseClient get client {
    _client ??= Supabase.instance.client;
    return _client!;
  }

  /// 获取当前认证用户
  static User? get currentUser => client.auth.currentUser;

  /// 获取当前会话
  static Session? get currentSession => client.auth.currentSession;

  /// 是否已登录
  static bool get isLoggedIn => currentSession != null;

  /// 监听认证状态变化
  static Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;
}

/// 快捷访问 Supabase 客户端
SupabaseClient get supabase => SupabaseClientManager.client;
