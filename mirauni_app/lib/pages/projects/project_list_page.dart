import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/project_provider.dart';
import '../../widgets/project/project_card.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/error_view.dart';

/// 项目列表页面
class ProjectListPage extends ConsumerStatefulWidget {
  const ProjectListPage({super.key});

  @override
  ConsumerState<ProjectListPage> createState() => _ProjectListPageState();
}

class _ProjectListPageState extends ConsumerState<ProjectListPage> {
  final _scrollController = ScrollController();
  String? _selectedCategory;
  bool _isLoadingMore = false;

  // 分类选项
  static const _categories = [
    {'value': null, 'label': '全部'},
    {'value': 'app', 'label': 'App'},
    {'value': 'web', 'label': '网站'},
    {'value': 'mini_program', 'label': '小程序'},
    {'value': 'saas', 'label': 'SaaS'},
    {'value': 'ai', 'label': 'AI'},
    {'value': 'game', 'label': '游戏'},
    {'value': 'other', 'label': '其他'},
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  void _loadMore() {
    if (_isLoadingMore) return;
    // TODO: 实现加载更多
  }

  void _onCategoryChanged(String? category) {
    setState(() => _selectedCategory = category);
    ref.read(projectFilterProvider.notifier).state = ProjectFilter(
      category: category,
    );
  }

  Future<void> _onRefresh() async {
    ref.invalidate(projectListProvider);
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(projectFilterProvider);
    final projectsAsync = ref.watch(projectListProvider(filter));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '找项目',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: 搜索功能
            },
            icon: Icon(
              Icons.search,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // 分类筛选
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = cat['value'] == _selectedCategory;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(cat['label'] as String),
                      selected: isSelected,
                      onSelected: (_) =>
                          _onCategoryChanged(cat['value'] as String?),
                      selectedColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                      backgroundColor: AppColors.background,
                      side: BorderSide.none,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // 项目列表
          Expanded(
            child: projectsAsync.when(
              data: (projects) {
                if (projects.isEmpty) {
                  return EmptyState(
                    title: '暂无项目',
                    description: '当前分类下还没有项目',
                    icon: Icons.folder_open,
                  );
                }

                return RefreshIndicator(
                  onRefresh: _onRefresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: projects.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final project = projects[index];
                      return ProjectCard(
                        project: project,
                        onTap: () => context.push('/project/${project.id}'),
                      );
                    },
                  ),
                );
              },
              loading: () => const AppLoading(),
              error: (error, stack) => ErrorView(
                message: error.toString(),
                onRetry: () => ref.invalidate(projectListProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
