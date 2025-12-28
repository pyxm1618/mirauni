import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/developer_provider.dart';
import '../../widgets/developer/developer_card.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/error_view.dart';

/// 开发者列表页面
class DeveloperListPage extends ConsumerStatefulWidget {
  const DeveloperListPage({super.key});

  @override
  ConsumerState<DeveloperListPage> createState() => _DeveloperListPageState();
}

class _DeveloperListPageState extends ConsumerState<DeveloperListPage> {
  final _scrollController = ScrollController();
  String? _selectedSkill;

  // 技能选项
  static const _skills = [
    {'value': null, 'label': '全部'},
    {'value': 'flutter', 'label': 'Flutter'},
    {'value': 'ios', 'label': 'iOS'},
    {'value': 'android', 'label': 'Android'},
    {'value': 'react', 'label': 'React'},
    {'value': 'vue', 'label': 'Vue'},
    {'value': 'nodejs', 'label': 'Node.js'},
    {'value': 'python', 'label': 'Python'},
    {'value': 'go', 'label': 'Go'},
  ];

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onSkillChanged(String? skill) {
    setState(() => _selectedSkill = skill);
    ref.read(developerFilterProvider.notifier).state = DeveloperFilter(
      skill: skill,
    );
  }

  Future<void> _onRefresh() async {
    ref.invalidate(developerListProvider);
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(developerFilterProvider);
    final developersAsync = ref.watch(developerListProvider(filter));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '找开发者',
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
          // 技能筛选
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(bottom: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: _skills.map((skill) {
                  final isSelected = skill['value'] == _selectedSkill;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(skill['label'] as String),
                      selected: isSelected,
                      onSelected: (_) =>
                          _onSkillChanged(skill['value'] as String?),
                      selectedColor: AppColors.primary,
                      labelStyle: TextStyle(
                        color:
                            isSelected ? Colors.white : AppColors.textSecondary,
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

          // 开发者列表
          Expanded(
            child: developersAsync.when(
              data: (developers) {
                if (developers.isEmpty) {
                  return EmptyState(
                    title: '暂无开发者',
                    description: '当前筛选条件下还没有开发者',
                    icon: Icons.people_outline,
                  );
                }

                return RefreshIndicator(
                  onRefresh: _onRefresh,
                  color: AppColors.primary,
                  child: ListView.separated(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: developers.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final developer = developers[index];
                      return DeveloperCard(
                        developer: developer,
                        onTap: () => context.push('/developer/${developer.id}'),
                      );
                    },
                  ),
                );
              },
              loading: () => const AppLoading(),
              error: (error, stack) => ErrorView(
                message: error.toString(),
                onRetry: () => ref.invalidate(developerListProvider),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
