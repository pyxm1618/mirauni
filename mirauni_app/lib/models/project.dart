/// 项目模型
class Project {
  final String id;
  final String userId;
  final String title;
  final String? summary;
  final String? description;
  final String category;
  final String status;
  final List<String>? needSkills;
  final int? budget;
  final String? budgetType;
  final String? wechat;
  final bool isVisible;
  final int viewCount;
  final DateTime createdAt;
  final DateTime? updatedAt;

  /// 关联的用户信息
  final ProjectUser? user;

  Project({
    required this.id,
    required this.userId,
    required this.title,
    this.summary,
    this.description,
    required this.category,
    required this.status,
    this.needSkills,
    this.budget,
    this.budgetType,
    this.wechat,
    this.isVisible = true,
    this.viewCount = 0,
    required this.createdAt,
    this.updatedAt,
    this.user,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      summary: json['summary'] as String?,
      description: json['description'] as String?,
      category: json['category'] as String? ?? 'other',
      status: json['status'] as String? ?? 'pending',
      needSkills: (json['need_skills'] as List<dynamic>?)?.cast<String>(),
      budget: json['budget'] as int?,
      budgetType: json['budget_type'] as String?,
      wechat: json['wechat'] as String?,
      isVisible: json['is_visible'] as bool? ?? true,
      viewCount: json['view_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
      user: json['users'] != null
          ? ProjectUser.fromJson(json['users'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'title': title,
      'summary': summary,
      'description': description,
      'category': category,
      'status': status,
      'need_skills': needSkills,
      'budget': budget,
      'budget_type': budgetType,
      'wechat': wechat,
      'is_visible': isVisible,
      'view_count': viewCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  /// 分类显示名称
  String get categoryName {
    const categories = {
      'app': 'App 开发',
      'web': '网站开发',
      'mini_program': '小程序',
      'saas': 'SaaS 产品',
      'ai': 'AI 项目',
      'game': '游戏开发',
      'other': '其他',
    };
    return categories[category] ?? '其他';
  }

  /// 预算显示文本
  String? get budgetText {
    if (budget == null) return null;
    if (budgetType == 'negotiable') return '可议价';
    return '¥$budget';
  }
}

/// 项目关联的用户信息（简化版）
class ProjectUser {
  final String? username;
  final String? avatarUrl;

  ProjectUser({
    this.username,
    this.avatarUrl,
  });

  factory ProjectUser.fromJson(Map<String, dynamic> json) {
    return ProjectUser(
      username: json['username'] as String?,
      avatarUrl: json['avatar_url'] as String?,
    );
  }

  String get displayName => username ?? '匿名用户';
}
