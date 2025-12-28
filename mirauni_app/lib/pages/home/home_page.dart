import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';

/// 首页
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: 搜索功能
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // TODO: 刷新数据
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 欢迎横幅
              _buildWelcomeBanner(context),
              const SizedBox(height: AppSpacing.lg),

              // 快捷入口
              _buildQuickActions(context),
              const SizedBox(height: AppSpacing.lg),

              // 热门项目
              _buildSectionHeader(context, '热门项目', onMore: () {
                context.go('/projects');
              }),
              const SizedBox(height: AppSpacing.md),
              _buildProjectPlaceholder(),
              const SizedBox(height: AppSpacing.lg),

              // 推荐开发者
              _buildSectionHeader(context, '推荐开发者', onMore: () {
                context.go('/developers');
              }),
              const SizedBox(height: AppSpacing.md),
              _buildDeveloperPlaceholder(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeBanner(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '找到你的技术合伙人',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            '独立开发者匹配平台，让创业不孤单',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton(
            onPressed: () => context.go('/projects'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppColors.primary,
            ),
            child: const Text('发现项目'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildActionCard(
            context,
            icon: Icons.add_box_outlined,
            title: '发布项目',
            onTap: () {
              // TODO: 发布项目
            },
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildActionCard(
            context,
            icon: Icons.person_search_outlined,
            title: '找开发者',
            onTap: () => context.go('/developers'),
          ),
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: _buildActionCard(
            context,
            icon: Icons.school_outlined,
            title: '学院',
            onTap: () {
              // TODO: 学院模块
            },
          ),
        ),
      ],
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, size: 28, color: AppColors.primary),
            const SizedBox(height: AppSpacing.xs),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(
    BuildContext context,
    String title, {
    VoidCallback? onMore,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        if (onMore != null)
          TextButton(
            onPressed: onMore,
            child: const Text('更多'),
          ),
      ],
    );
  }

  Widget _buildProjectPlaceholder() {
    return Container(
      height: 150,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.folder_outlined, size: 40, color: AppColors.textLight),
            SizedBox(height: AppSpacing.sm),
            Text(
              '项目列表加载中...',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeveloperPlaceholder() {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outlined, size: 40, color: AppColors.textLight),
            SizedBox(height: AppSpacing.sm),
            Text(
              '开发者列表加载中...',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
