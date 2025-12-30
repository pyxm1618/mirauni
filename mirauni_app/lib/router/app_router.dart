import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../pages/splash/splash_page.dart';
import '../pages/auth/login_page.dart';
import '../pages/auth/bind_phone_page.dart';
import '../pages/projects/project_detail_page.dart';
import '../pages/developers/developer_profile_page.dart';
import '../pages/messages/chat_page.dart';
import '../pages/me/recharge_page.dart';
import '../pages/me/profile_edit_page.dart';
import '../pages/me/my_projects_page.dart';
import '../widgets/main_shell.dart';

/// 路由配置 Provider
final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      // 启动页和登录页不需要登录检查
      if (state.matchedLocation == '/splash' || 
          state.matchedLocation == '/login' ||
          state.matchedLocation == '/') {
        return null;
      }

      final isLoggedIn = ref.read(isLoggedInProvider);

      // 需要登录的路由
      const protectedRoutes = ['/chat', '/recharge', '/bind-phone', '/profile', '/my-projects'];
      final needsAuth = protectedRoutes.any(
        (r) => state.matchedLocation.startsWith(r),
      );

      if (needsAuth && !isLoggedIn) {
        return '/login?redirect=${state.matchedLocation}';
      }

      return null;
    },
    routes: [
      // 启动页
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),

      // 登录页
      GoRoute(
        path: '/login',
        builder: (context, state) {
          final redirect = state.uri.queryParameters['redirect'];
          return LoginPage(redirect: redirect);
        },
      ),

      // 绑定手机号页
      GoRoute(
        path: '/bind-phone',
        builder: (context, state) => const BindPhonePage(),
      ),

      // 主页（带底部导航的 IndexedStack）
      // 不再使用 ShellRoute，而是直接用 MainShell 管理所有 Tab 页面
      GoRoute(
        path: '/',
        builder: (context, state) => const MainShell(),
      ),

      // 项目详情页
      GoRoute(
        path: '/project/:id',
        builder: (context, state) => ProjectDetailPage(
          projectId: state.pathParameters['id']!,
        ),
      ),

      // 开发者主页
      GoRoute(
        path: '/developer/:id',
        builder: (context, state) => DeveloperProfilePage(
          userId: state.pathParameters['id']!,
        ),
      ),

      // 聊天页
      GoRoute(
        path: '/chat/:userId',
        builder: (context, state) => ChatPage(
          targetUserId: state.pathParameters['userId']!,
        ),
      ),

      // 充值页
      GoRoute(
        path: '/recharge',
        builder: (context, state) => const RechargePage(),
      ),

      // 编辑资料页
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileEditPage(),
      ),

      // 我的项目页
      GoRoute(
        path: '/my-projects',
        builder: (context, state) => const MyProjectsPage(),
      ),
    ],
  );
});
