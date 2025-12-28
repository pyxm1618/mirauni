import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../services/rating_service.dart';

/// 启动页
class SplashPage extends StatefulWidget {
  const SplashPage({super.key});

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    // 记录启动次数（用于智能引导评分）
    final ratingService = RatingService();
    await ratingService.recordLaunch();
    
    // 模拟加载时间
    await Future.delayed(const Duration(milliseconds: 1500));

    if (!mounted) return;

    // 检查登录状态，跳转到首页
    // 即使未登录也可以访问首页浏览内容
    context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.xl),
              ),
              child: const Icon(
                Icons.handshake_outlined,
                size: 60,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            // 应用名称
            const Text(
              AppConstants.appName,
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            // 应用描述
            const Text(
              AppConstants.appDescription,
              style: TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
            // 加载指示器
            const CircularProgressIndicator(
              color: Colors.white,
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}
