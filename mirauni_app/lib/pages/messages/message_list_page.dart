import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/constants.dart';
import '../../providers/message_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/error_view.dart';

/// 消息列表页面
class MessageListPage extends ConsumerWidget {
  const MessageListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final conversationsAsync = ref.watch(conversationsProvider);
    final currentUserId = ref.watch(currentUserIdProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '消息',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: conversationsAsync.when(
        data: (conversations) {
          if (conversations.isEmpty) {
            return EmptyState(
              title: '暂无消息',
              description: '快去找项目或开发者聊聊吧',
              icon: Icons.chat_bubble_outline,
              action: ElevatedButton(
                onPressed: () => context.go('/projects'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                child: const Text('浏览项目'),
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(conversationsProvider);
            },
            color: AppColors.primary,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: conversations.length,
              separatorBuilder: (_, __) => Divider(
                height: 1,
                indent: 76,
                color: AppColors.divider,
              ),
              itemBuilder: (context, index) {
                final conversation = conversations[index];
                final otherUserId = conversation.getOtherUserId(currentUserId ?? '');
                
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  leading: ClipOval(
                    child: conversation.otherUser?.avatarUrl != null
                        ? CachedNetworkImage(
                            imageUrl: conversation.otherUser!.avatarUrl!,
                            width: 52,
                            height: 52,
                            fit: BoxFit.cover,
                          )
                        : Container(
                            width: 52,
                            height: 52,
                            color: AppColors.border,
                            child: Icon(
                              Icons.person,
                              color: AppColors.textLight,
                            ),
                          ),
                  ),
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(
                          conversation.otherUser?.displayName ?? '用户',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (conversation.lastMessageAt != null)
                        Text(
                          _formatTime(conversation.lastMessageAt!),
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textLight,
                          ),
                        ),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            conversation.lastMessage?.content ?? '',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (conversation.unreadCount > 0)
                          Container(
                            margin: const EdgeInsets.only(left: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              conversation.unreadCount > 99
                                  ? '99+'
                                  : '${conversation.unreadCount}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  onTap: () => context.push('/chat/$otherUserId'),
                );
              },
            ),
          );
        },
        loading: () => const AppLoading(),
        error: (error, stack) => ErrorView(
          message: error.toString(),
          onRetry: () => ref.invalidate(conversationsProvider),
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) {
      return '刚刚';
    } else if (diff.inHours < 1) {
      return '${diff.inMinutes}分钟前';
    } else if (diff.inDays < 1) {
      return '${diff.inHours}小时前';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}天前';
    } else {
      return '${time.month}/${time.day}';
    }
  }
}
