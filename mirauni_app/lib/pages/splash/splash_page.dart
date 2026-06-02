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
    print('🚀 SplashPage: initState called');
    _initialize();
  }

  Future<void> _initialize() async {
    print('🚀 SplashPage: _initialize started');
    
    // 记录启动次数（用于智能引导评分）
    final ratingService = RatingService();
    await ratingService.recordLaunch();
    
    // 模拟加载时间
    await Future.delayed(const Duration(milliseconds: 1500));
    print('🚀 SplashPage: Delay completed, checking mounted...');

    if (!mounted) {
      print('❌ SplashPage: Widget not mounted, cannot navigate');
      return;
    }

    print('✅ SplashPage: Navigating to home page...');
    // 检查登录状态，跳转到首页
    // 即使未登录也可以访问首页浏览内容
    context.go('/');
    print('✅ SplashPage: Navigation complete');
  }

  @override
  Widget build(BuildContext context) {
    print('🎨 SplashPage: build called');
    return Scaffold(
      backgroundColor: Colors.black, // 黑色背景更明显
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Brutalist Logo Box
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary,
                border: Border.all(color: Colors.white, width: 4),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.white,
                    offset: Offset(8, 8),
                    blurRadius: 0,
                  ),
                ],
              ),
              child: const Icon(
                Icons.handshake_outlined,
                size: 60,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 40),
            // 应用名称 - Brutalist Style
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.primary,
                border: Border.all(color: Colors.white, width: 3),
              ),
              child: const Text(
                AppConstants.appName,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: Colors.black,
                  letterSpacing: 2,
                ),
              ),
            ),
            const SizedBox(height: 20),
            // 应用描述
            const Text(
              AppConstants.appDescription,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 60),
            // 加载指示器 - Brutalist Style
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 4),
              ),
              child: const CircularProgressIndicator(
                color: AppColors.primary,
                strokeWidth: 3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
