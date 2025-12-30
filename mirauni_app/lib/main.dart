import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/supabase/supabase_client.dart';
import 'core/storage/local_cache.dart';
import 'app.dart';

void main() async {
  print('🚀 Main: Starting app initialization...');
  
  // 确保 Flutter 绑定已初始化
  WidgetsFlutterBinding.ensureInitialized();
  print('🚀 Main: WidgetsFlutterBinding initialized');

  // 预初始化 LocalCache (避免切换页面时的延迟)
  print('🚀 Main: Pre-initializing LocalCache...');
  await LocalCache.getInstance();
  print('🚀 Main: LocalCache initialized');

  // 初始化 Supabase（包含自动恢复机制）
  try {
    print('🚀 Main: Initializing Supabase...');
    await SupabaseClientManager.initialize();
    print('🚀 Main: Supabase initialized successfully');
  } catch (e) {
    // 即使 Supabase 初始化失败，也让应用能够启动
    // 用户可以在应用内看到错误提示并重试
    debugPrint('❌ Main: Supabase 初始化最终失败: $e');
  }

  print('🚀 Main: Calling runApp...');
  // 运行应用，使用 Riverpod ProviderScope 包裹
  runApp(
    const ProviderScope(
      child: MirauniApp(),
    ),
  );
  print('🚀 Main: runApp called');
}
