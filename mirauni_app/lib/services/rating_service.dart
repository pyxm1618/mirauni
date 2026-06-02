import 'package:flutter/material.dart';
import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// 智能引导评分服务
/// 
/// 触发条件：
/// - 用户启动 App ≥ 3 次
/// - 用户尚未评分过
/// - 距离上次提示 ≥ 7 天
class RatingService {
  static const String _keyLaunchCount = 'rating_launch_count';
  static const String _keyHasRated = 'rating_has_rated';
  static const String _keyLastPromptTime = 'rating_last_prompt_time';
  static const String _keyHasDeclined = 'rating_has_declined';
  
  /// 启动次数阈值
  static const int _launchCountThreshold = 3;
  
  /// 两次提示间隔（天）
  static const int _promptIntervalDays = 7;
  
  final InAppReview _inAppReview = InAppReview.instance;
  
  /// 记录一次启动
  Future<void> recordLaunch() async {
    final prefs = await SharedPreferences.getInstance();
    final currentCount = prefs.getInt(_keyLaunchCount) ?? 0;
    await prefs.setInt(_keyLaunchCount, currentCount + 1);
  }
  
  /// 检查是否应该显示评分提示
  Future<bool> shouldShowRatingPrompt() async {
    final prefs = await SharedPreferences.getInstance();
    
    // 已评分，不再提示
    final hasRated = prefs.getBool(_keyHasRated) ?? false;
    if (hasRated) return false;
    
    // 用户明确拒绝过，不再提示
    final hasDeclined = prefs.getBool(_keyHasDeclined) ?? false;
    if (hasDeclined) return false;
    
    // 启动次数不足
    final launchCount = prefs.getInt(_keyLaunchCount) ?? 0;
    if (launchCount < _launchCountThreshold) return false;
    
    // 检查上次提示时间
    final lastPromptTime = prefs.getInt(_keyLastPromptTime);
    if (lastPromptTime != null) {
      final lastPrompt = DateTime.fromMillisecondsSinceEpoch(lastPromptTime);
      final daysSinceLastPrompt = DateTime.now().difference(lastPrompt).inDays;
      if (daysSinceLastPrompt < _promptIntervalDays) return false;
    }
    
    // 检查系统是否支持应用内评分
    final isAvailable = await _inAppReview.isAvailable();
    return isAvailable;
  }
  
  /// 显示评分对话框
  Future<void> showRatingDialog(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    
    // 记录提示时间
    await prefs.setInt(_keyLastPromptTime, DateTime.now().millisecondsSinceEpoch);
    
    if (!context.mounted) return;
    
    final result = await showDialog<RatingDialogResult>(
      context: context,
      barrierDismissible: false,
      builder: (context) => const _RatingDialog(),
    );
    
    if (result == RatingDialogResult.like) {
      // 用户喜欢 -> 请求评分
      await requestReview();
      await prefs.setBool(_keyHasRated, true);
    } else if (result == RatingDialogResult.dislike) {
      // 用户不喜欢 -> 可以跳转反馈页面
      // TODO: 实现反馈功能
    } else if (result == RatingDialogResult.later) {
      // 稍后提醒 -> 下次还会提示
    } else if (result == RatingDialogResult.never) {
      // 不再提示
      await prefs.setBool(_keyHasDeclined, true);
    }
  }
  
  /// 请求系统评分
  Future<void> requestReview() async {
    try {
      await _inAppReview.requestReview();
    } catch (e) {
      debugPrint('请求评分失败: $e');
    }
  }
  
  /// 打开应用商店页面（备用方案）
  Future<void> openStoreListing() async {
    try {
      await _inAppReview.openStoreListing(
        appStoreId: '', // TODO: 填入 App Store ID
      );
    } catch (e) {
      debugPrint('打开商店页面失败: $e');
    }
  }
  
  /// 重置评分状态（仅用于测试）
  Future<void> resetForTesting() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyLaunchCount);
    await prefs.remove(_keyHasRated);
    await prefs.remove(_keyLastPromptTime);
    await prefs.remove(_keyHasDeclined);
  }
}

/// 评分对话框结果
enum RatingDialogResult {
  like,     // 喜欢
  dislike,  // 不喜欢
  later,    // 稍后
  never,    // 不再提示
}

/// 评分引导对话框
class _RatingDialog extends StatelessWidget {
  const _RatingDialog();
  
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: const Text(
        '喜欢小概率吗？',
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      content: const Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '如果您觉得好用，请给我们一个好评吧！',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '您的支持是我们前进的动力 ❤️',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
        ],
      ),
      actionsAlignment: MainAxisAlignment.center,
      actions: [
        Column(
          children: [
            // 主按钮：喜欢，去评分
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context, RatingDialogResult.like),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  '喜欢，去评分',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
            const SizedBox(height: 8),
            // 次按钮：下次再说
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context, RatingDialogResult.later),
                child: const Text(
                  '下次再说',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
            // 三级按钮：不再提示
            SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () => Navigator.pop(context, RatingDialogResult.never),
                child: const Text(
                  '不再提示',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
