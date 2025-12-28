import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/supabase/supabase_client.dart';
import '../core/storage/local_cache.dart';
import '../models/project.dart';
import '../config/constants.dart';

/// 项目筛选条件
class ProjectFilter {
  final String? category;
  final String? keyword;
  final int offset;
  final int limit;

  const ProjectFilter({
    this.category,
    this.keyword,
    this.offset = 0,
    this.limit = AppConstants.pageSize,
  });

  ProjectFilter copyWith({
    String? category,
    String? keyword,
    int? offset,
    int? limit,
  }) {
    return ProjectFilter(
      category: category ?? this.category,
      keyword: keyword ?? this.keyword,
      offset: offset ?? this.offset,
      limit: limit ?? this.limit,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ProjectFilter &&
        other.category == category &&
        other.keyword == keyword &&
        other.offset == offset &&
        other.limit == limit;
  }

  @override
  int get hashCode =>
      category.hashCode ^ keyword.hashCode ^ offset.hashCode ^ limit.hashCode;
}

/// 当前筛选条件 Provider
final projectFilterProvider = StateProvider<ProjectFilter>((ref) {
  return const ProjectFilter();
});

/// 项目列表 Provider（带缓存）
final projectListProvider = FutureProvider.family<List<Project>, ProjectFilter>(
  (ref, filter) async {
    final cache = await LocalCache.getInstance();
    final cacheKey = CacheKeys.projectList(
      category: filter.category,
      keyword: filter.keyword,
    );
    
    // 仅对首页（offset=0）进行缓存
    if (filter.offset == 0) {
      // 尝试读取缓存
      final cachedData = cache.getStale<List<dynamic>>(cacheKey);
      if (cachedData != null) {
        // 如果缓存未过期，直接返回
        if (!cache.isExpired(cacheKey)) {
          return cachedData.map((e) => Project.fromJson(e as Map<String, dynamic>)).toList();
        }
        // 如果缓存过期，后台刷新（先返回旧数据）
        // 这里简化处理：过期时仍然请求网络
      }
    }
    
    // 请求网络数据
    final result = await _fetchProjects(filter);
    
    // 缓存首页数据
    if (filter.offset == 0) {
      await cache.set(cacheKey, result.map((e) => e.toJson()).toList());
    }
    
    return result;
  },
);

/// 从网络获取项目列表
Future<List<Project>> _fetchProjects(ProjectFilter filter) async {
  var query = supabase
      .from('projects')
      .select('*, users!projects_user_id_fkey(username, avatar_url)');

  dynamic result;
  if (filter.category != null && filter.category!.isNotEmpty) {
    if (filter.keyword != null && filter.keyword!.isNotEmpty) {
      result = await query
          .eq('status', 'active')
          .eq('is_visible', true)
          .eq('category', filter.category!)
          .or('title.ilike.%${filter.keyword}%,summary.ilike.%${filter.keyword}%')
          .order('created_at', ascending: false)
          .range(filter.offset, filter.offset + filter.limit - 1);
    } else {
      result = await query
          .eq('status', 'active')
          .eq('is_visible', true)
          .eq('category', filter.category!)
          .order('created_at', ascending: false)
          .range(filter.offset, filter.offset + filter.limit - 1);
    }
  } else if (filter.keyword != null && filter.keyword!.isNotEmpty) {
    result = await query
        .eq('status', 'active')
        .eq('is_visible', true)
        .or('title.ilike.%${filter.keyword}%,summary.ilike.%${filter.keyword}%')
        .order('created_at', ascending: false)
        .range(filter.offset, filter.offset + filter.limit - 1);
  } else {
    result = await query
        .eq('status', 'active')
        .eq('is_visible', true)
        .order('created_at', ascending: false)
        .range(filter.offset, filter.offset + filter.limit - 1);
  }

  return (result as List).map((e) => Project.fromJson(e)).toList();
}

/// 项目详情 Provider（带缓存）
final projectDetailProvider = FutureProvider.family<Project?, String>(
  (ref, projectId) async {
    final cache = await LocalCache.getInstance();
    final cacheKey = CacheKeys.projectDetail(projectId);
    
    // 尝试读取缓存
    final cachedData = cache.get<Map<String, dynamic>>(cacheKey);
    if (cachedData != null) {
      return Project.fromJson(cachedData);
    }
    
    try {
      final data = await supabase
          .from('projects')
          .select('*, users!projects_user_id_fkey(username, avatar_url)')
          .eq('id', projectId)
          .single();

      final project = Project.fromJson(data);
      
      // 缓存详情数据
      await cache.set(cacheKey, data);
      
      return project;
    } catch (e) {
      return null;
    }
  },
);

/// 我的项目列表 Provider
final myProjectsProvider = FutureProvider<List<Project>>((ref) async {
  final userId = supabase.auth.currentUser?.id;
  if (userId == null) return [];

  final data = await supabase
      .from('projects')
      .select('*, users!projects_user_id_fkey(username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', ascending: false);

  return (data as List).map((e) => Project.fromJson(e)).toList();
});

