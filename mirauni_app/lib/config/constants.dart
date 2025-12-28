import 'package:flutter/material.dart';

/// 应用常量定义
class AppConstants {
  /// 应用名称
  static const String appName = '小概率';

  /// 应用描述
  static const String appDescription = '独立开发者找合伙人的第一站';

  /// 分页每页数量
  static const int pageSize = 20;

  /// 缓存过期时间（小时）
  static const int cacheExpireHours = 24;
}

/// 颜色常量
class AppColors {
  /// 主色调 - 紫色系
  static const Color primary = Color(0xFF6366F1);
  static const Color primaryLight = Color(0xFF818CF8);
  static const Color primaryDark = Color(0xFF4F46E5);

  /// 背景色
  static const Color background = Color(0xFFF8FAFC);
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color cardBackground = Colors.white;

  /// 文本色
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textLight = Color(0xFF94A3B8);

  /// 边框色
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFF1F5F9);

  /// 状态色
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
}

/// 间距常量
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

/// 圆角常量
class AppRadius {
  static const double sm = 4.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double full = 9999.0;
}
