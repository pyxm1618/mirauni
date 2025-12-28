import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/supabase/supabase_client.dart';
import 'app.dart';

void main() async {
  // 确保 Flutter 绑定已初始化
  WidgetsFlutterBinding.ensureInitialized();

  // 初始化 Supabase
  await SupabaseClientManager.initialize();

  // 运行应用，使用 Riverpod ProviderScope 包裹
  runApp(
    const ProviderScope(
      child: MirauniApp(),
    ),
  );
}
