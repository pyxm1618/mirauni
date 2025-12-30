import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/project_provider.dart';
import '../../widgets/project/project_card.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/error_view.dart';

/// 项目列表页面
class ProjectListPage extends ConsumerStatefulWidget {
  const ProjectListPage({super.key});

  @override
  ConsumerState<ProjectListPage> createState() => _ProjectListPageState();
}

class _ProjectListPageState extends ConsumerState<ProjectListPage> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();
  String? _selectedCategory;
  bool _isLoadingMore = false;

  // 分类选项
  static const _categories = [
    {'value': null, 'label': 'ALL'}, // Brutalist: Uppercase
    {'value': 'app', 'label': 'APP'},
    {'value': 'web', 'label': 'WEB'},
    {'value': 'mini_program', 'label': 'MP'},
    {'value': 'saas', 'label': 'SAAS'},
    {'value': 'ai', 'label': 'AI'},
    {'value': 'game', 'label': 'GAME'},
    {'value': 'other', 'label': 'OTHER'},
  ];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
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
      body: SafeArea(
        child: Column(
          children: [
            // Header & Filter Area
            Container(
              padding: const EdgeInsets.all(20),
               decoration: const BoxDecoration(
                color: AppColors.background,
                border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   const Text(
                    'PROJECTS SQUARE',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  // Search Bar
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: Colors.black, width: 3),
                             boxShadow: const [
                               BoxShadow(
                                 color: Colors.black,
                                 offset: Offset(4, 4),
                                 blurRadius: 0,
                               )
                             ]
                          ),
                          child: TextField(
                            controller: _searchController,
                             style: const TextStyle(
                               fontWeight: FontWeight.bold,
                               fontSize: 14,
                             ),
                             decoration: const InputDecoration(
                               hintText: 'SEARCH_PROJECTS...',
                               hintStyle: TextStyle(
                                 color: AppColors.textLight,
                                 fontWeight: FontWeight.bold,
                               ),
                               border: InputBorder.none,
                               contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                               isDense: true,
                             ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Categories
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _categories.map((cat) {
                        final isSelected = cat['value'] == _selectedCategory;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: InkWell(
                            onTap: () => _onCategoryChanged(cat['value'] as String?),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.black : Colors.white,
                                border: Border.all(color: Colors.black, width: 3),
                                boxShadow: !isSelected ? const [
                                   BoxShadow(color: Colors.black, offset: Offset(2, 2), blurRadius: 0)
                                ] : null,
                              ),
                              transform: !isSelected ? null : Matrix4.translationValues(2, 2, 0),
                              child: Text(
                                cat['label'] as String,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.black,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),

            // Project List
            Expanded(
              child: projectsAsync.when(
                data: (projects) {
                  if (projects.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                             Container(
                               padding: const EdgeInsets.all(16),
                               decoration: BoxDecoration(
                                 color: Colors.white,
                                 border: Border.all(color: Colors.black, width: 3),
                                 boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                               ),
                               child: const Text('NO_RESULTS_FOUND', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                             ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: _onRefresh,
                    color: Colors.black,
                    backgroundColor: AppColors.primary,
                    child: ListView.separated(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(20),
                      itemCount: projects.length,
                      cacheExtent: 500, // Preload content
                      separatorBuilder: (_, __) => const SizedBox(height: 20),
                      itemBuilder: (context, index) {
                        final project = projects[index];
                        // Wrap ProjectCard or Replace it. 
                        // For now we will update ProjectCard separately to be brutalist, 
                        // so here we just use it, or we could inline the brutalist design here.
                        // Let's modify ProjectCard in the next step to be brutalist.
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
      ),
    );
  }
}
