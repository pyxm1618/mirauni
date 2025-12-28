/// 用户模型
class AppUser {
  final String id;
  final String? phone;
  final String? username;
  final String? avatarUrl;
  final String? bio;
  final List<String>? skills;
  final int? experience;
  final int? unlockCredits;
  final String? wechat;
  final String? email;
  final bool? isVerified;
  final DateTime createdAt;
  final DateTime? updatedAt;

  AppUser({
    required this.id,
    this.phone,
    this.username,
    this.avatarUrl,
    this.bio,
    this.skills,
    this.experience,
    this.unlockCredits,
    this.wechat,
    this.email,
    this.isVerified,
    required this.createdAt,
    this.updatedAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      phone: json['phone'] as String?,
      username: json['username'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      skills: (json['skills'] as List<dynamic>?)?.cast<String>(),
      experience: json['experience'] as int?,
      unlockCredits: json['unlock_credits'] as int?,
      wechat: json['wechat'] as String?,
      email: json['email'] as String?,
      isVerified: json['is_verified'] as bool?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone': phone,
      'username': username,
      'avatar_url': avatarUrl,
      'bio': bio,
      'skills': skills,
      'experience': experience,
      'unlock_credits': unlockCredits,
      'wechat': wechat,
      'email': email,
      'is_verified': isVerified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  /// 显示名称（优先用户名，其次脱敏手机号）
  String get displayName {
    if (username != null && username!.isNotEmpty) {
      return username!;
    }
    if (phone != null && phone!.length >= 11) {
      return '${phone!.substring(0, 3)}****${phone!.substring(7)}';
    }
    return '用户';
  }

  /// 是否已完善资料
  bool get isProfileComplete {
    return username != null && 
           username!.isNotEmpty && 
           skills != null && 
           skills!.isNotEmpty;
  }
}
