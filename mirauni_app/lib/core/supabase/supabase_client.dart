import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../config/env.dart';

/// Supabase 客户端管理器
/// 
/// 包含初始化失败时的自动恢复机制，解决本地存储损坏导致的闪退问题
class SupabaseClientManager {
  static SupabaseClient? _client;
  static const String _initErrorKey = 'supabase_init_error_count';
  static const int _maxRetries = 2;

  /// 初始化 Supabase
  /// 
  /// 如果初始化失败（通常是本地存储损坏），会自动清除本地数据并重试
  static Future<void> initialize() async {
    try {
      await _doInitialize();
      // 初始化成功，重置错误计数
      await _resetErrorCount();
    } catch (e) {
      debugPrint('Supabase 初始化失败: $e');
      
      // 检查重试次数
      final errorCount = await _getErrorCount();
      if (errorCount < _maxRetries) {
        debugPrint('尝试恢复... (第 ${errorCount + 1} 次)');
        await _incrementErrorCount();
        
        // 清除 Supabase 本地存储数据
        await _clearLocalStorage();
        
        // 重新初始化
        try {
          await _doInitialize();
          await _resetErrorCount();
          debugPrint('Supabase 恢复成功');
        } catch (retryError) {
          debugPrint('Supabase 恢复失败: $retryError');
          // 即使失败也继续运行，让用户可以使用其他功能
          rethrow;
        }
      } else {
        debugPrint('Supabase 初始化多次失败，放弃重试');
        await _resetErrorCount();
        // 清除本地数据，让下次启动有机会成功
        await _clearLocalStorage();
        rethrow;
      }
    }
  }

  /// 执行实际的初始化
  static Future<void> _doInitialize() async {
    await Supabase.initialize(
      url: Env.supabaseUrl,
      anonKey: Env.supabaseAnonKey,
      debug: Env.isDevelopment,
    );
  }

  /// 清除 Supabase 本地存储数据
  static Future<void> _clearLocalStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // 获取所有 Supabase 相关的键
      final keys = prefs.getKeys().where((key) => 
        key.contains('supabase') || 
        key.contains('sb-') ||
        key.contains('auth') ||
        key.contains('session')
      ).toList();
      
      for (final key in keys) {
        await prefs.remove(key);
        debugPrint('已清除: $key');
      }
      
      debugPrint('Supabase 本地存储已清除');
    } catch (e) {
      debugPrint('清除本地存储失败: $e');
    }
  }

  /// 获取错误计数
  static Future<int> _getErrorCount() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_initErrorKey) ?? 0;
  }

  /// 增加错误计数
  static Future<void> _incrementErrorCount() async {
    final prefs = await SharedPreferences.getInstance();
    final count = prefs.getInt(_initErrorKey) ?? 0;
    await prefs.setInt(_initErrorKey, count + 1);
  }

  /// 重置错误计数
  static Future<void> _resetErrorCount() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_initErrorKey);
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
