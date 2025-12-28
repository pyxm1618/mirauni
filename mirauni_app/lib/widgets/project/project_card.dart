import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/constants.dart';
import '../../models/project.dart';

/// 项目卡片组件
class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback? onTap;

  const ProjectCard({
    super.key,
    required this.project,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        side: BorderSide(color: AppColors.border, width: 1),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 标题和分类
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      project.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppRadius.sm),
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
                ],
              ),

              // 简介
              if (project.summary != null && project.summary!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  project.summary!,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],

              // 需求技能
              if (project.needSkills != null &&
                  project.needSkills!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: project.needSkills!.take(4).map((skill) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(AppRadius.sm),
                      ),
                      child: Text(
                        skill,
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),

              // 底部：用户信息和预算
              Row(
                children: [
                  // 用户头像和名称
                  if (project.user != null) ...[
                    ClipOval(
                      child: project.user!.avatarUrl != null
                          ? CachedNetworkImage(
                              imageUrl: project.user!.avatarUrl!,
                              width: 24,
                              height: 24,
                              fit: BoxFit.cover,
                              placeholder: (_, __) => Container(
                                color: AppColors.border,
                              ),
                              errorWidget: (_, __, ___) => _defaultAvatar,
                            )
                          : _defaultAvatar,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      project.user!.displayName,
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                  const Spacer(),
                  // 预算
                  if (project.budgetText != null)
                    Text(
                      project.budgetText!,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.warning,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget get _defaultAvatar => Container(
        width: 24,
        height: 24,
        color: AppColors.border,
        child: Icon(
          Icons.person,
          size: 16,
          color: AppColors.textLight,
        ),
      );
}
