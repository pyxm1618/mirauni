import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/project_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/error_view.dart';
import '../../widgets/common/share_bottom_sheet.dart';
import '../../utils/toast.dart';

/// 项目详情页面
class ProjectDetailPage extends ConsumerWidget {
  final String projectId;

  const ProjectDetailPage({
    super.key,
    required this.projectId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final projectAsync = ref.watch(projectDetailProvider(projectId));
    final isLoggedIn = ref.watch(isLoggedInProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: projectAsync.when(
        data: (project) {
          if (project == null) {
            return ErrorView(
              title: '项目不存在',
              message: '该项目可能已被删除',
              onRetry: () => context.pop(),
            );
          }

          return CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.textPrimary,
                pinned: true,
                elevation: 0,
                title: Text(
                  '项目详情',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                actions: [
                  IconButton(
                    onPressed: () {
                      ShareBottomSheet.show(
                        context: context,
                        data: ShareData(
                          title: project.title,
                          description: project.summary ?? '发现一个好项目',
                          url: 'https://mirauni.com/project/${project.id}',
                        ),
                      );
                    },
                    icon: const Icon(Icons.share_outlined),
                  ),
                ],
              ),

              // 内容
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 标题和分类
                    Container(
                      color: Colors.white,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius:
                                      BorderRadius.circular(AppRadius.sm),
                                ),
                                child: Text(
                                  project.categoryName,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                              const Spacer(),
                              if (project.budgetText != null)
                                Text(
                                  project.budgetText!,
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.warning,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            project.title,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // 项目简介
                    Container(
                      color: Colors.white,
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '项目简介',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            project.summary ?? '暂无简介',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppColors.textSecondary,
                              height: 1.6,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // 需求技能
                    if (project.needSkills != null &&
                        project.needSkills!.isNotEmpty)
                      Container(
                        color: Colors.white,
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '需求技能',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children:
                                  project.needSkills!.map((skill) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    borderRadius:
                                        BorderRadius.circular(AppRadius.full),
                                  ),
                                  child: Text(
                                    skill,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 8),

                    // 发布者信息
                    if (project.user != null)
                      Container(
                        color: Colors.white,
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            ClipOval(
                              child: project.user!.avatarUrl != null
                                  ? CachedNetworkImage(
                                      imageUrl: project.user!.avatarUrl!,
                                      width: 48,
                                      height: 48,
                                      fit: BoxFit.cover,
                                    )
                                  : Container(
                                      width: 48,
                                      height: 48,
                                      color: AppColors.border,
                                      child: Icon(
                                        Icons.person,
                                        color: AppColors.textLight,
                                      ),
                                    ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    project.user!.displayName,
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '项目发起人',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textLight,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(
                              Icons.chevron_right,
                              color: AppColors.textLight,
                            ),
                          ],
                        ),
                      ),

                    // 底部间距
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ],
          );
        },
        loading: () => const AppLoading(),
        error: (error, stack) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(projectDetailProvider(projectId)),
        ),
      ),

      // 底部按钮
      bottomNavigationBar: projectAsync.whenOrNull(
        data: (project) {
          if (project == null) return null;
          return Container(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 12,
              bottom: MediaQuery.of(context).padding.bottom + 12,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                // 发消息按钮
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      if (!isLoggedIn) {
                        context.push('/login?redirect=/project/$projectId');
                        return;
                      }
                      context.push('/chat/${project.userId}');
                    },
                    icon: const Icon(Icons.chat_bubble_outline),
                    label: const Text('发消息'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // 解锁联系方式按钮
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      if (!isLoggedIn) {
                        context.push('/login?redirect=/project/$projectId');
                        return;
                      }
                      Toast.info(context, '解锁功能开发中');
                    },
                    icon: const Icon(Icons.lock_open),
                    label: const Text('解锁联系方式'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
