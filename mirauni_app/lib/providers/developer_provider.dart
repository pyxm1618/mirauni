import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/supabase/supabase_client.dart';
import '../core/storage/local_cache.dart';
import '../models/user.dart';
import '../config/constants.dart';

/// 开发者筛选条件
class DeveloperFilter {
  final String? skill;
  final int? minExperience;
  final String? keyword;
  final int offset;
  final int limit;

  const DeveloperFilter({
    this.skill,
    this.minExperience,
    this.keyword,
    this.offset = 0,
    this.limit = AppConstants.pageSize,
  });

  DeveloperFilter copyWith({
    String? skill,
    int? minExperience,
    String? keyword,
    int? offset,
    int? limit,
  }) {
    return DeveloperFilter(
      skill: skill ?? this.skill,
      minExperience: minExperience ?? this.minExperience,
      keyword: keyword ?? this.keyword,
      offset: offset ?? this.offset,
      limit: limit ?? this.limit,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DeveloperFilter &&
        other.skill == skill &&
        other.minExperience == minExperience &&
        other.keyword == keyword &&
        other.offset == offset &&
        other.limit == limit;
  }

  @override
  int get hashCode =>
      skill.hashCode ^
      minExperience.hashCode ^
      keyword.hashCode ^
      offset.hashCode ^
      limit.hashCode;
}

/// 当前筛选条件 Provider
final developerFilterProvider = StateProvider<DeveloperFilter>((ref) {
  return const DeveloperFilter();
});

/// 开发者列表 Provider（带缓存 - 优先返回缓存）
final developerListProvider = FutureProvider.family<List<AppUser>, DeveloperFilter>(
  (ref, filter) async {
    final cache = await LocalCache.getInstance();
    final cacheKey = CacheKeys.developerList(
      skill: filter.skill,
      keyword: filter.keyword,
    );
    
    // 仅对首页（offset=0）进行缓存
    if (filter.offset == 0) {
      // 尝试读取缓存（即使过期也返回，实现快速显示）
      final cachedData = cache.getStale<List<dynamic>>(cacheKey);
      if (cachedData != null) {
        final cachedDevelopers = cachedData.map((e) => AppUser.fromJson(e as Map<String, dynamic>)).toList();
        
        // 如果缓存未过期，直接返回
        if (!cache.isExpired(cacheKey)) {
          return cachedDevelopers;
        }
        
        // 缓存过期：后台刷新（不阻塞返回）
        Future.microtask(() async {
          try {
            final freshData = await _fetchDevelopers(filter);
            await cache.set(cacheKey, freshData.map((e) => e.toJson()).toList());
          } catch (e) {
            debugPrint('后台刷新开发者列表失败: $e');
          }
        });
        
        // 立即返回缓存的数据
        return cachedDevelopers;
      }
    }
    
    // 没有缓存时，请求网络数据
    final result = await _fetchDevelopers(filter);
    
    // 缓存首页数据
    if (filter.offset == 0) {
      await cache.set(cacheKey, result.map((e) => e.toJson()).toList());
    }
    
    return result;
  },
);

/// 从网络获取开发者列表
Future<List<AppUser>> _fetchDevelopers(DeveloperFilter filter) async {
  var query = supabase.from('users').select();

  dynamic result;
  
  if (filter.skill != null && filter.skill!.isNotEmpty) {
    if (filter.keyword != null && filter.keyword!.isNotEmpty) {
      result = await query
          .not('username', 'is', null)
          .contains('skills', [filter.skill!])
          .or('username.ilike.%${filter.keyword}%,bio.ilike.%${filter.keyword}%')
          .order('created_at', ascending: false)
          .range(filter.offset, filter.offset + filter.limit - 1);
    } else {
      result = await query
          .not('username', 'is', null)
          .contains('skills', [filter.skill!])
          .order('created_at', ascending: false)
          .range(filter.offset, filter.offset + filter.limit - 1);
    }
  } else if (filter.keyword != null && filter.keyword!.isNotEmpty) {
    result = await query
        .not('username', 'is', null)
        .or('username.ilike.%${filter.keyword}%,bio.ilike.%${filter.keyword}%')
        .order('created_at', ascending: false)
        .range(filter.offset, filter.offset + filter.limit - 1);
  } else {
    result = await query
        .not('username', 'is', null)
        .order('created_at', ascending: false)
        .range(filter.offset, filter.offset + filter.limit - 1);
  }

  return (result as List).map((e) => AppUser.fromJson(e)).toList();
}

/// 开发者详情 Provider（带缓存）
final developerDetailProvider = FutureProvider.family<AppUser?, String>(
  (ref, userId) async {
    final cache = await LocalCache.getInstance();
    final cacheKey = CacheKeys.developerDetail(userId);
    
    // 尝试读取缓存
    final cachedData = cache.get<Map<String, dynamic>>(cacheKey);
    if (cachedData != null) {
      return AppUser.fromJson(cachedData);
    }
    
    try {
      final data = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();

      final user = AppUser.fromJson(data);
      
      // 缓存详情数据
      await cache.set(cacheKey, data);

      return user;
    } catch (e) {
      return null;
    }
  },
);

