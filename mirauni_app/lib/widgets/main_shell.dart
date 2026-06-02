import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/constants.dart';
import '../providers/message_provider.dart';
import '../providers/auth_provider.dart';
import '../services/rating_service.dart';
import '../pages/home/home_page.dart';
import '../pages/projects/project_list_page.dart';
import '../pages/developers/developer_list_page.dart';
import '../pages/messages/message_list_page.dart';
import '../pages/me/me_page.dart';

/// 当前选中的 Tab 索引 Provider
final currentTabIndexProvider = StateProvider<int>((ref) => 0);

/// 底部导航栏 Shell 组件
/// 
/// 使用 IndexedStack 实现页面状态保持，避免每次切换重建页面
class MainShell extends ConsumerStatefulWidget {
  const MainShell({super.key});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  bool _hasCheckedRating = false;

  // 所有 Tab 页面 - 只初始化一次，状态永久保持
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    // 初始化所有页面（只执行一次）
    _pages = const [
      HomePage(),
      ProjectListPage(),
      DeveloperListPage(),
      MessageListPage(),
      MePage(),
    ];
  }

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

  void _onTabTapped(int index) {
    // 检查是否需要登录
    final isLoggedIn = ref.read(isLoggedInProvider);
    const protectedTabs = [3, 4]; // 消息、我的 需要登录
    
    if (protectedTabs.contains(index) && !isLoggedIn) {
      // 跳转到登录页
      context.push('/login');
      return;
    }
    
    // 直接切换 Tab（秒切）
    ref.read(currentTabIndexProvider.notifier).state = index;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = ref.watch(currentTabIndexProvider);
    final unreadCountAsync = ref.watch(unreadCountProvider);
    final unreadCount = unreadCountAsync.valueOrNull ?? 0;

    return Scaffold(
      // 使用 IndexedStack 保持所有页面状态
      body: IndexedStack(
        index: currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.textPrimary,
        unselectedItemColor: AppColors.textSecondary,
        backgroundColor: Colors.white,
        elevation: 0,
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
}
