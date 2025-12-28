import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/constants.dart';
import '../providers/message_provider.dart';
import '../services/rating_service.dart';

/// 底部导航栏 Shell 组件
class MainShell extends ConsumerStatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  bool _hasCheckedRating = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 首次进入时检查是否需要显示评分弹窗
    if (!_hasCheckedRating) {
      _hasCheckedRating = true;
      _checkAndShowRatingPrompt();
    }
  }

  Future<void> _checkAndShowRatingPrompt() async {
    // 延迟一下，等页面完全加载
    await Future.delayed(const Duration(seconds: 2));
    
    if (!mounted) return;
    
    final ratingService = RatingService();
    final shouldShow = await ratingService.shouldShowRatingPrompt();
    
    if (shouldShow && mounted) {
      await ratingService.showRatingDialog(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final unreadCountAsync = ref.watch(unreadCountProvider);
    final unreadCount = unreadCountAsync.valueOrNull ?? 0;

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _calculateIndex(context),
        onTap: (index) => _onTap(context, index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: '首页',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.folder_outlined),
            activeIcon: Icon(Icons.folder),
            label: '项目',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: '开发者',
          ),
          BottomNavigationBarItem(
            icon: _buildMessageIcon(Icons.message_outlined, unreadCount),
            activeIcon: _buildMessageIcon(Icons.message, unreadCount),
            label: '消息',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: '我的',
          ),
        ],
      ),
    );
  }

  /// 构建消息图标（带未读徽章）
  Widget _buildMessageIcon(IconData icon, int unreadCount) {
    if (unreadCount == 0) {
      return Icon(icon);
    }

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(icon),
        Positioned(
          right: -8,
          top: -4,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: AppColors.error,
              borderRadius: BorderRadius.circular(10),
            ),
            constraints: const BoxConstraints(
              minWidth: 16,
              minHeight: 16,
            ),
            child: Text(
              unreadCount > 99 ? '99+' : '$unreadCount',
              style: const TextStyle(
                fontSize: 10,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ],
    );
  }

  int _calculateIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    if (location.startsWith('/projects')) return 1;
    if (location.startsWith('/developers')) return 2;
    if (location.startsWith('/messages')) return 3;
    if (location.startsWith('/me')) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    const routes = ['/', '/projects', '/developers', '/messages', '/me'];
    context.go(routes[index]);
  }
}

