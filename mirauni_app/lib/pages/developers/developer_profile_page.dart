import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/developer_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/error_view.dart';
import '../../widgets/common/share_bottom_sheet.dart';
import '../../utils/toast.dart';

/// 开发者主页
class DeveloperProfilePage extends ConsumerWidget {
  final String userId;

  const DeveloperProfilePage({
    super.key,
    required this.userId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final developerAsync = ref.watch(developerDetailProvider(userId));
    final isLoggedIn = ref.watch(isLoggedInProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: developerAsync.when(
        data: (developer) {
          if (developer == null) {
            return ErrorView(
              title: '用户不存在',
              message: '该用户可能已被删除',
              onRetry: () => context.pop(),
            );
          }

          return CustomScrollView(
            slivers: [
              // App Bar with avatar
              SliverAppBar(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                expandedHeight: 200,
                pinned: true,
                actions: [
                  IconButton(
                    onPressed: () {
                      ShareBottomSheet.show(
                        context: context,
                        data: ShareData(
                          title: '推荐开发者: ${developer.displayName}',
                          description: developer.bio ?? '发现一位优秀的开发者',
                          url: 'https://mirauni.com/developer/${developer.id}',
                          thumbnail: developer.avatarUrl,
                        ),
                      );
                    },
                    icon: const Icon(Icons.share_outlined),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.primary, AppColors.primaryDark],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: SafeArea(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 40),
                          // 头像
                          Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withOpacity(0.3),
                                width: 3,
                              ),
                            ),
                            child: ClipOval(
                              child: developer.avatarUrl != null
                                  ? CachedNetworkImage(
                                      imageUrl: developer.avatarUrl!,
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                    )
                                  : Container(
                                      width: 80,
                                      height: 80,
                                      color: Colors.white.withOpacity(0.2),
                                      child: const Icon(
                                        Icons.person,
                                        size: 40,
                                        color: Colors.white,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          // 用户名
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                developer.displayName,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              if (developer.isVerified == true) ...[
                                const SizedBox(width: 6),
                                const Icon(
                                  Icons.verified,
                                  size: 18,
                                  color: Colors.white,
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // 内容
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 简介
                    Container(
                      color: Colors.white,
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '个人简介',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            developer.bio ?? '这个人很懒，什么都没写~',
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

                    // 技能标签
                    if (developer.skills != null &&
                        developer.skills!.isNotEmpty)
                      Container(
                        color: Colors.white,
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '技能',
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
                              children: developer.skills!.map((skill) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(
                                        AppRadius.full),
                                  ),
                                  child: Text(
                                    skill,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),

                    const SizedBox(height: 8),

                    // 经验年限
                    if (developer.experience != null)
                      Container(
                        color: Colors.white,
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(
                              Icons.work_outline,
                              color: AppColors.textLight,
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '工作经验',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textLight,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${developer.experience} 年',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ],
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
          onRetry: () => ref.invalidate(developerDetailProvider(userId)),
        ),
      ),

      // 底部按钮
      bottomNavigationBar: developerAsync.whenOrNull(
        data: (developer) {
          if (developer == null) return null;
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
                        context.push('/login?redirect=/developer/$userId');
                        return;
                      }
                      context.push('/chat/$userId');
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
                        context.push('/login?redirect=/developer/$userId');
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
