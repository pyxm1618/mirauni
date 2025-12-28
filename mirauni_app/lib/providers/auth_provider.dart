import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase/supabase_client.dart';

/// 认证状态 Provider
/// 监听 Supabase 认证状态变化
final authStateProvider = StreamProvider<AuthState>((ref) {
  return SupabaseClientManager.authStateChanges;
});

/// 是否已登录 Provider
final isLoggedInProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.whenOrNull(
    data: (state) => state.session != null,
  ) ?? false;
});

/// 当前用户 ID Provider
final currentUserIdProvider = Provider<String?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.whenOrNull(
    data: (state) => state.session?.user.id,
  );
});
