import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/constants.dart';
import '../../models/user.dart';

/// 开发者卡片组件
class DeveloperCard extends StatelessWidget {
  final AppUser developer;
  final VoidCallback? onTap;

  const DeveloperCard({
    super.key,
    required this.developer,
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
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 头像
              ClipOval(
                child: developer.avatarUrl != null
                    ? CachedNetworkImage(
                        imageUrl: developer.avatarUrl!,
                        width: 56,
                        height: 56,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          color: AppColors.border,
                        ),
                        errorWidget: (_, __, ___) => _defaultAvatar,
                      )
                    : _defaultAvatar,
              ),
              const SizedBox(width: 12),

              // 信息
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 用户名和认证标识
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            developer.displayName,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (developer.isVerified == true) ...[
                          const SizedBox(width: 4),
                          Icon(
                            Icons.verified,
                            size: 16,
                            color: AppColors.primary,
                          ),
                        ],
                      ],
                    ),

                    // 简介
                    if (developer.bio != null && developer.bio!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        developer.bio!,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],

                    // 技能标签
                    if (developer.skills != null && developer.skills!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: developer.skills!.take(4).map((skill) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(AppRadius.sm),
                            ),
                            child: Text(
                              skill,
                              style: TextStyle(
                                fontSize: 11,
                                color: AppColors.primary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],

                    // 经验年限
                    if (developer.experience != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.work_outline,
                            size: 14,
                            color: AppColors.textLight,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${developer.experience} 年经验',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textLight,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget get _defaultAvatar => Container(
        width: 56,
        height: 56,
        color: AppColors.border,
        child: Icon(
          Icons.person,
          size: 28,
          color: AppColors.textLight,
        ),
      );
}
