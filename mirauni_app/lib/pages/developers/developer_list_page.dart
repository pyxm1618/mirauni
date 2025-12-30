import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../providers/developer_provider.dart';
import '../../widgets/developer/developer_card.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/error_view.dart';
import '../../widgets/common/brutalist_card.dart';
/// 开发者列表页面
class DeveloperListPage extends ConsumerStatefulWidget {
  const DeveloperListPage({super.key});
  @override
  ConsumerState<DeveloperListPage> createState() => _DeveloperListPageState();
}
class _DeveloperListPageState extends ConsumerState<DeveloperListPage> {
  final _scrollController = ScrollController();
  String? _selectedSkill;
  final _searchController = TextEditingController();
  // 技能选项
  static const _skills = [
    {'value': null, 'label': 'ALL'},
    {'value': 'flutter', 'label': 'FLUTTER'},
    {'value': 'ios', 'label': 'IOS'},
    {'value': 'android', 'label': 'ANDROID'},
    {'value': 'react', 'label': 'REACT'},
    {'value': 'vue', 'label': 'VUE'},
    {'value': 'nodejs', 'label': 'NODE.JS'},
    {'value': 'python', 'label': 'PYTHON'},
    {'value': 'go', 'label': 'GO'},
  ];
  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
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
      body: SafeArea(
        child: Column(
          children: [
            // Header
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
                    'TALENT HUNT',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      height: 1.0,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Search with Label
                  Container(
                     decoration: const BoxDecoration(
                       boxShadow: [
                         BoxShadow(
                           color: Colors.black,
                           offset: Offset(4, 4),
                           blurRadius: 0,
                         )
                       ]
                     ),
                     child: Column(
                       children: [
                         Container(
                           width: double.infinity,
                           color: Colors.black,
                           padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                           alignment: Alignment.centerLeft,
                           child: const Text('FIND_DEV:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                         ),
                          Container(
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              border: Border(
                                left: BorderSide(color: Colors.black, width: 3),
                                right: BorderSide(color: Colors.black, width: 3),
                                bottom: BorderSide(color: Colors.black, width: 3),
                              ),
                            ),
                            child: TextField(
                              controller: _searchController,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                              decoration: const InputDecoration(
                                hintText: 'NAME OR ROLE...',
                                hintStyle: TextStyle(
                                  color: AppColors.textLight,
                                  fontWeight: FontWeight.bold,
                                ),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.all(16),
                              ),
                            ),
                          )
                       ],
                     ),
                  ),
                  const SizedBox(height: 16),
                  // Skills Filter
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _skills.map((skill) {
                        final isSelected = skill['value'] == _selectedSkill;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: InkWell(
                            onTap: () => _onSkillChanged(skill['value'] as String?),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.black : Colors.white,
                                border: Border.all(color: Colors.black, width: 3),
                                boxShadow: !isSelected ? const [BoxShadow(color: Colors.black, offset: Offset(2, 2))] : null,
                              ),
                              transform: !isSelected ? null : Matrix4.translationValues(2, 2, 0),
                              child: Text(
                                skill['label'] as String,
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
            
            // List
            Expanded(
              child: developersAsync.when(
                data: (developers) {
                  if (developers.isEmpty) {
                     return Center(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.black, width: 3),
                          boxShadow: const [BoxShadow(color: Colors.black, offset: Offset(4, 4))],
                        ),
                        child: const Text('NO_RESULTS', style: TextStyle(fontWeight: FontWeight.w900)),
                      ),
                    );
                  }
                  return RefreshIndicator(
                    onRefresh: _onRefresh,
                    color: Colors.black,
                    child: ListView.separated(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(20),
                      itemCount: developers.length,
                      cacheExtent: 500,
                      separatorBuilder: (_, __) => const SizedBox(height: 20),
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
      ),
    );
  }
}
