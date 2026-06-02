import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluwx/fluwx.dart';
import '../../config/constants.dart';
import '../../services/wechat_service.dart';
import '../../utils/toast.dart';

/// 分享数据模型
class ShareData {
  final String title;
  final String description;
  final String url;
  final String? thumbnail;

  const ShareData({
    required this.title,
    required this.description,
    required this.url,
    this.thumbnail,
  });
}

/// 分享底部弹窗
/// 
/// 使用方式:
/// ```dart
/// ShareBottomSheet.show(
///   context: context,
///   data: ShareData(
///     title: '项目标题',
///     description: '项目描述',
///     url: 'https://mirauni.com/project/xxx',
///   ),
/// );
/// ```
class ShareBottomSheet extends StatelessWidget {
  final ShareData data;

  const ShareBottomSheet({
    super.key,
    required this.data,
  });

  /// 显示分享弹窗
  static Future<void> show({
    required BuildContext context,
    required ShareData data,
  }) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => ShareBottomSheet(data: data),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 顶部指示器
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            
            // 标题
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                '分享到',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),

            // 分享选项
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildShareOption(
                    context: context,
                    icon: Icons.chat_bubble,
                    label: '微信好友',
                    color: const Color(0xFF07C160),
                    onTap: () => _shareToWechat(context, WeChatScene.session),
                  ),
                  _buildShareOption(
                    context: context,
                    icon: Icons.public,
                    label: '朋友圈',
                    color: const Color(0xFF07C160),
                    onTap: () => _shareToWechat(context, WeChatScene.timeline),
                  ),
                  _buildShareOption(
                    context: context,
                    icon: Icons.copy,
                    label: '复制链接',
                    color: AppColors.textSecondary,
                    onTap: () => _copyLink(context),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 取消按钮
            InkWell(
              onTap: () => Navigator.pop(context),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  border: Border(
                    top: BorderSide(color: AppColors.border),
                  ),
                ),
                child: Center(
                  child: Text(
                    '取消',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShareOption({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                size: 28,
                color: color,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _shareToWechat(BuildContext context, WeChatScene scene) async {
    Navigator.pop(context);

    try {
      final wechatService = WechatService();
      final success = await wechatService.shareWebPage(
        url: data.url,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        scene: scene,
      );

      if (context.mounted) {
        if (success) {
          Toast.success(context, '已打开微信');
        } else {
          Toast.error(context, '分享失败，请重试');
        }
      }
    } catch (e) {
      if (context.mounted) {
        Toast.error(context, e.toString());
      }
    }
  }

  void _copyLink(BuildContext context) {
    Clipboard.setData(ClipboardData(text: data.url));
    Navigator.pop(context);
    Toast.success(context, '链接已复制');
  }
}
