import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../config/constants.dart';

/// 本地缓存管理器
/// 
/// 使用 SharedPreferences 缓存数据，支持过期时间控制
/// 采用"缓存优先 + 后台刷新"策略
class LocalCache {
  static LocalCache? _instance;
  static SharedPreferences? _prefs;
  
  LocalCache._();
  
  /// 获取单例实例
  static Future<LocalCache> getInstance() async {
    _instance ??= LocalCache._();
    _prefs ??= await SharedPreferences.getInstance();
    return _instance!;
  }
  
  /// 缓存键前缀
  static const String _keyPrefix = 'cache_';
  static const String _keyTimestampSuffix = '_timestamp';
  
  /// 缓存过期时间（小时）
  static int get _expireHours => AppConstants.cacheExpireHours;
  
  /// 保存数据到缓存
  Future<bool> set(String key, dynamic value) async {
    try {
      final cacheKey = _keyPrefix + key;
      final jsonString = jsonEncode(value);
      
      // 保存数据
      await _prefs!.setString(cacheKey, jsonString);
      
      // 保存时间戳
      await _prefs!.setInt(
        cacheKey + _keyTimestampSuffix,
        DateTime.now().millisecondsSinceEpoch,
      );
      
      return true;
    } catch (e) {
      debugPrint('缓存保存失败: $e');
      return false;
    }
  }
  
  /// 从缓存获取数据
  /// 
  /// 如果数据过期或不存在，返回 null
  T? get<T>(String key) {
    try {
      final cacheKey = _keyPrefix + key;
      final jsonString = _prefs!.getString(cacheKey);
      
      if (jsonString == null) return null;
      
      // 检查是否过期
      if (_isExpired(cacheKey)) {
        // 异步清理过期数据
        _remove(cacheKey);
        return null;
      }
      
      return jsonDecode(jsonString) as T;
    } catch (e) {
      debugPrint('缓存读取失败: $e');
      return null;
    }
  }
  
  /// 获取缓存数据（即使过期也返回）
  /// 
  /// 用于"缓存优先"策略，先展示旧数据，后台刷新
  T? getStale<T>(String key) {
    try {
      final cacheKey = _keyPrefix + key;
      final jsonString = _prefs!.getString(cacheKey);
      
      if (jsonString == null) return null;
      
      return jsonDecode(jsonString) as T;
    } catch (e) {
      debugPrint('缓存读取失败: $e');
      return null;
    }
  }
  
  /// 检查缓存是否过期
  bool isExpired(String key) {
    return _isExpired(_keyPrefix + key);
  }
  
  bool _isExpired(String cacheKey) {
    final timestamp = _prefs!.getInt(cacheKey + _keyTimestampSuffix);
    if (timestamp == null) return true;
    
    final cacheTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
    final now = DateTime.now();
    
    return now.difference(cacheTime).inHours >= _expireHours;
  }
  
  /// 删除缓存
  Future<void> remove(String key) async {
    await _remove(_keyPrefix + key);
  }
  
  Future<void> _remove(String cacheKey) async {
    await _prefs!.remove(cacheKey);
    await _prefs!.remove(cacheKey + _keyTimestampSuffix);
  }
  
  /// 清除所有缓存
  Future<void> clear() async {
    final keys = _prefs!.getKeys().where((k) => k.startsWith(_keyPrefix));
    for (final key in keys) {
      await _prefs!.remove(key);
    }
  }
  
  /// 获取缓存统计信息
  Map<String, dynamic> getStats() {
    final keys = _prefs!.getKeys().where(
      (k) => k.startsWith(_keyPrefix) && !k.endsWith(_keyTimestampSuffix),
    );
    
    int validCount = 0;
    int expiredCount = 0;
    
    for (final key in keys) {
      if (_isExpired(key)) {
        expiredCount++;
      } else {
        validCount++;
      }
    }
    
    return {
      'total': keys.length,
      'valid': validCount,
      'expired': expiredCount,
    };
  }
}

/// 缓存键定义
class CacheKeys {
  /// 项目列表（首页）
  static String projectList({String? category, String? keyword}) {
    final parts = ['projects'];
    if (category != null && category.isNotEmpty) parts.add('cat_$category');
    if (keyword != null && keyword.isNotEmpty) parts.add('kw_$keyword');
    return parts.join('_');
  }
  
  /// 项目详情
  static String projectDetail(String id) => 'project_$id';
  
  /// 开发者列表
  static String developerList({String? skill, String? keyword}) {
    final parts = ['developers'];
    if (skill != null && skill.isNotEmpty) parts.add('skill_$skill');
    if (keyword != null && keyword.isNotEmpty) parts.add('kw_$keyword');
    return parts.join('_');
  }
  
  /// 开发者详情
  static String developerDetail(String id) => 'developer_$id';
  
  /// 消息会话列表
  static const String messageList = 'messages';
  
  /// 当前用户信息
  static const String currentUser = 'current_user';
}
