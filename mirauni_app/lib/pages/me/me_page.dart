import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/user_provider.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../utils/toast.dart';

/// 我的页面
class MePage extends ConsumerWidget {
  const MePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // 顶部用户信息
          SliverToBoxAdapter(
            child: Container(
              padding: EdgeInsets.only(
                top: MediaQuery.of(context).padding.top + 20,
                left: 20,
                right: 20,
                bottom: 24,
              ),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, AppColors.primaryDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: userAsync.when(
                data: (user) {
                  if (user == null) {
                    return _buildLoginPrompt(context);
                  }
                  return _buildUserInfo(context, user);
                },
                loading: () => const SizedBox(height: 100),
                error: (_, __) => _buildLoginPrompt(context),
              ),
            ),
          ),

          // 解锁次数卡片
          SliverToBoxAdapter(
            child: userAsync.whenOrNull(
              data: (user) {
                if (user == null) return const SizedBox.shrink();
                return Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(AppRadius.md),
                        ),
                        child: Icon(
                          Icons.lock_open,
                          color: AppColors.warning,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '剩余解锁次数',
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${user.unlockCredits ?? 0} 次',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => context.push('/recharge'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.warning,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                        ),
                        child: const Text('充值'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // 菜单列表
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.folder_outlined,
                    title: '我的项目',
                    onTap: () {
                      context.push('/my-projects');
                    },
                  ),
                  _divider,
                  _buildMenuItem(
                    icon: Icons.history,
                    title: '解锁记录',
                    onTap: () {
                      Toast.info(context, '功能开发中');
                    },
                  ),
                  _divider,
                  _buildMenuItem(
                    icon: Icons.receipt_outlined,
                    title: '充值记录',
                    onTap: () {
                      Toast.info(context, '功能开发中');
                    },
                  ),
                ],
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 12)),

          // 其他菜单
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.description_outlined,
                    title: '用户协议',
                    onTap: () {
                      Toast.info(context, '功能开发中');
                    },
                  ),
                  _divider,
                  _buildMenuItem(
                    icon: Icons.privacy_tip_outlined,
                    title: '隐私政策',
                    onTap: () {
                      Toast.info(context, '功能开发中');
                    },
                  ),
                  _divider,
                  _buildMenuItem(
                    icon: Icons.info_outline,
                    title: '关于我们',
                    onTap: () {
                      Toast.info(context, '功能开发中');
                    },
                  ),
                ],
              ),
            ),
          ),

          // 退出登录按钮
          SliverToBoxAdapter(
            child: userAsync.whenOrNull(
              data: (user) {
                if (user == null) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: OutlinedButton(
                    onPressed: () => _logout(context, ref),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: BorderSide(color: AppColors.error.withOpacity(0.3)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                    ),
                    child: const Text('退出登录'),
                  ),
                );
              },
            ),
          ),

          // 底部间距
          const SliverToBoxAdapter(child: SizedBox(height: 50)),
        ],
      ),
    );
  }

  Widget _buildLoginPrompt(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 70,
          height: 70,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.person_outline,
            size: 36,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () => context.push('/login?redirect=/me'),
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: AppColors.primary,
            elevation: 0,
            padding: const EdgeInsets.symmetric(
              horizontal: 32,
              vertical: 12,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.full),
            ),
          ),
          child: const Text(
            '登录 / 注册',
            style: TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }

  Widget _buildUserInfo(BuildContext context, dynamic user) {
    return Row(
      children: [
        // 头像
        GestureDetector(
          onTap: () {
            context.push('/profile');
          },
          child: Stack(
            children: [
              ClipOval(
                child: user.avatarUrl != null
                    ? CachedNetworkImage(
                        imageUrl: user.avatarUrl!,
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        width: 70,
                        height: 70,
                        color: Colors.white.withOpacity(0.2),
                        child: const Icon(
                          Icons.person,
                          size: 36,
                          color: Colors.white,
                        ),
                      ),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.edit,
                    size: 14,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        // 信息
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.displayName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              if (user.bio != null && user.bio!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  user.bio!,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.8),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
        // 设置按钮
        IconButton(
          onPressed: () {
            Toast.info(context, '设置功能开发中');
          },
          icon: Icon(
            Icons.settings_outlined,
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 15,
          color: AppColors.textPrimary,
        ),
      ),
      trailing: Icon(
        Icons.chevron_right,
        color: AppColors.textLight,
      ),
      onTap: onTap,
    );
  }

  Widget get _divider => Divider(
        height: 1,
        indent: 56,
        color: AppColors.divider,
      );

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('退出登录'),
        content: const Text('确定要退出登录吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('退出'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await AuthService().signOut();
      ref.invalidate(currentUserProvider);
      Toast.success(context, '已退出登录');
      context.go('/');
    }
  }
}
