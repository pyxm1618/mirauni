import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';
import 'auth_provider.dart';

/// 当前用户信息 Provider
final currentUserProvider = FutureProvider<AppUser?>((ref) async {
  final userId = ref.watch(currentUserIdProvider);
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
});

/// 刷新当前用户信息
final refreshUserProvider = Provider<Future<void> Function()>((ref) {
  return () async {
    ref.invalidate(currentUserProvider);
  };
});
