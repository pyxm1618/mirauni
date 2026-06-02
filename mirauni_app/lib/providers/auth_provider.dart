import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

/// 认证状态 Provider
final authStateProvider = StreamProvider<AuthState>((ref) {
  return SupabaseClientManager.authStateChanges;
});

/// 当前用户详情 Provider (AppUser)
final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<AppUser?>>((ref) {
  return CurrentUserNotifier(ref);
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<AppUser?>> {
  final Ref _ref;
  final _authService = AuthService();

  CurrentUserNotifier(this._ref) : super(const AsyncValue.loading()) {
    _init();
  }

  void _init() {
    // 监听 Supabase Auth 变化
    _ref.listen(authStateProvider, (previous, next) {
      next.whenData((authState) {
        if (authState.event == AuthChangeEvent.signedIn) {
          refreshUser();
        } else if (authState.event == AuthChangeEvent.signedOut) {
          state = const AsyncValue.data(null);
        }
      });
    });
    
    // 初始加载
    refreshUser();
  }

  Future<void> refreshUser() async {
    // 只有在 Supabase 有 session 时才去 fetch
    if (supabase.auth.currentSession == null) {
      state = const AsyncValue.data(null);
      return;
    }
    
    state = const AsyncValue.loading();
    try {
      final user = await _authService.getCurrentUser();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

/// 是否已登录 Provider (基于 session)
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
