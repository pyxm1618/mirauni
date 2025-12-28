import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../models/project.dart';
import '../../core/supabase/supabase_client.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/empty_state.dart';
import '../../widgets/common/error_view.dart';

/// 我的项目页面
class MyProjectsPage extends ConsumerStatefulWidget {
  const MyProjectsPage({super.key});

  @override
  ConsumerState<MyProjectsPage> createState() => _MyProjectsPageState();
}

class _MyProjectsPageState extends ConsumerState<MyProjectsPage> {
  List<Project>? _projects;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final userId = supabase.auth.currentUser?.id;
      if (userId == null) {
        throw Exception('未登录');
      }

      final response = await supabase
          .from('projects')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      setState(() {
        _projects = (response as List)
            .map((e) => Project.fromJson(e as Map<String, dynamic>))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '我的项目',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const AppLoading();
    }

    if (_error != null) {
      return ErrorView(
        message: _error!,
        onRetry: _loadProjects,
      );
    }

    if (_projects == null || _projects!.isEmpty) {
      return EmptyState(
        icon: Icons.folder_outlined,
        title: '暂无项目',
        description: '您还没有发布任何项目',
      );
    }

    return RefreshIndicator(
      onRefresh: _loadProjects,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _projects!.length,
        itemBuilder: (context, index) {
          return _buildProjectCard(_projects![index]);
        },
      ),
    );
  }

  Widget _buildProjectCard(Project project) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: InkWell(
        onTap: () => context.push('/project/${project.id}'),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 标题行
              Row(
                children: [
                  Expanded(
                    child: Text(
                      project.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildStatusBadge(project.status),
                ],
              ),

              const SizedBox(height: 8),

              // 摘要
              Text(
                project.summary ?? '暂无描述',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 12),

              // 底部信息
              Row(
                children: [
                  // 分类
                  if (project.category != null) ...[
                    Icon(
                      Icons.category_outlined,
                      size: 14,
                      color: AppColors.textLight,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      project.category!,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textLight,
                      ),
                    ),
                    const SizedBox(width: 16),
                  ],
                  
                  // 预算
                  Icon(
                    Icons.attach_money,
                    size: 14,
                    color: AppColors.textLight,
                  ),
                  Text(
                    project.budgetText ?? '面议',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),

                  const Spacer(),

                  // 创建时间
                  Text(
                    _formatDate(project.createdAt),
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textLight,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;
    
    switch (status) {
      case 'active':
        color = AppColors.success;
        text = '进行中';
        break;
      case 'completed':
        color = AppColors.info;
        text = '已完成';
        break;
      case 'closed':
        color = AppColors.textLight;
        text = '已关闭';
        break;
      default:
        color = AppColors.warning;
        text = '待审核';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppRadius.sm),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) {
      return '今天';
    } else if (diff.inDays == 1) {
      return '昨天';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}天前';
    } else if (diff.inDays < 30) {
      return '${diff.inDays ~/ 7}周前';
    } else if (diff.inDays < 365) {
      return '${diff.inDays ~/ 30}月前';
    } else {
      return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    }
  }
}
