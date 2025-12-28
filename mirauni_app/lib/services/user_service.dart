import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';

/// 用户服务
class UserService {
  static final UserService _instance = UserService._internal();
  factory UserService() => _instance;
  UserService._internal();

  /// 更新用户资料
  Future<void> updateProfile({
    String? username,
    String? bio,
    List<String>? skills,
    int? experience,
    String? wechat,
    String? email,
    String? avatarUrl,
  }) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('未登录');

    final updates = <String, dynamic>{
      'updated_at': DateTime.now().toIso8601String(),
    };

    if (username != null) updates['username'] = username;
    if (bio != null) updates['bio'] = bio;
    if (skills != null) updates['skills'] = skills;
    if (experience != null) updates['experience'] = experience;
    if (wechat != null) updates['wechat'] = wechat;
    if (email != null) updates['email'] = email;
    if (avatarUrl != null) updates['avatar_url'] = avatarUrl;

    await supabase.from('users').update(updates).eq('id', userId);
  }

  /// 上传头像
  /// 返回头像的公开 URL
  Future<String> uploadAvatar(File file) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('未登录');

    final fileExt = file.path.split('.').last.toLowerCase();
    final fileName = '$userId/avatar_${DateTime.now().millisecondsSinceEpoch}.$fileExt';

    // 上传到 Supabase Storage
    await supabase.storage.from('avatars').upload(
      fileName,
      file,
      fileOptions: const FileOptions(
        cacheControl: '3600',
        upsert: true,
      ),
    );

    // 获取公开 URL
    final url = supabase.storage.from('avatars').getPublicUrl(fileName);

    // 更新用户头像 URL
    await updateProfile(avatarUrl: url);

    return url;
  }

  /// 获取用户信息
  Future<AppUser?> getUser(String userId) async {
    try {
      final response = await supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      
      return AppUser.fromJson(response);
    } catch (e) {
      debugPrint('获取用户信息失败: $e');
      return null;
    }
  }

  /// 检查用户名是否可用
  Future<bool> isUsernameAvailable(String username) async {
    final userId = supabase.auth.currentUser?.id;
    
    final response = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

    // 如果没有找到，或者找到的是当前用户，则可用
    if (response == null) return true;
    if (response['id'] == userId) return true;
    
    return false;
  }
}

