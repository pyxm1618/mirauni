import 'package:flutter/material.dart';
import '../../config/constants.dart';

/// 消息气泡组件
class MessageBubble extends StatelessWidget {
  /// 消息内容
  final String content;

  /// 消息时间
  final DateTime time;

  /// 是否为发送的消息（true = 右侧蓝色，false = 左侧灰色）
  final bool isSent;

  /// 头像 URL（仅接收消息显示）
  final String? avatarUrl;

  /// 是否显示时间
  final bool showTime;

  const MessageBubble({
    super.key,
    required this.content,
    required this.time,
    required this.isSent,
    this.avatarUrl,
    this.showTime = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: isSent ? 60 : 12,
        right: isSent ? 12 : 60,
        top: 4,
        bottom: 4,
      ),
      child: Row(
        mainAxisAlignment:
            isSent ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 接收消息显示头像
          if (!isSent) ...[
            _buildAvatar(),
            const SizedBox(width: 8),
          ],
          // 消息气泡
          Flexible(
            child: Column(
              crossAxisAlignment:
                  isSent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 10,
                  ),
                  decoration: BoxDecoration(
                    color: isSent ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(16),
                      topRight: const Radius.circular(16),
                      bottomLeft: Radius.circular(isSent ? 16 : 4),
                      bottomRight: Radius.circular(isSent ? 4 : 16),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 5,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Text(
                    content,
                    style: TextStyle(
                      fontSize: 15,
                      color: isSent ? Colors.white : AppColors.textPrimary,
                      height: 1.4,
                    ),
                  ),
                ),
                if (showTime) ...[
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(time),
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return ClipOval(
      child: avatarUrl != null
          ? Image.network(
              avatarUrl!,
              width: 36,
              height: 36,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _defaultAvatar(),
            )
          : _defaultAvatar(),
    );
  }

  Widget _defaultAvatar() {
    return Container(
      width: 36,
      height: 36,
      color: AppColors.border,
      child: Icon(
        Icons.person,
        size: 20,
        color: AppColors.textLight,
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
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}天前';
    } else {
      return '${time.month}/${time.day}';
    }
  }
}

/// 时间分隔线组件
class MessageTimeDivider extends StatelessWidget {
  final DateTime time;

  const MessageTimeDivider({super.key, required this.time});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.border.withOpacity(0.5),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          _formatDate(time),
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textLight,
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime time) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final date = DateTime(time.year, time.month, time.day);

    if (date == today) {
      return '今天';
    } else if (date == today.subtract(const Duration(days: 1))) {
      return '昨天';
    } else if (time.year == now.year) {
      return '${time.month}月${time.day}日';
    } else {
      return '${time.year}年${time.month}月${time.day}日';
    }
  }
}
