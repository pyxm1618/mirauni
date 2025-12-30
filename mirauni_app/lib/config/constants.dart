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
  /// 主色调 - 柠檬黄
  static const Color primary = Color(0xFFFEF08A);
  
  /// 辅助色 - 天空蓝
  static const Color secondary = Color(0xFF7DD3FC);
  
  /// 强调色 - 粉色
  static const Color accent = Color(0xFFF472B6);
  
  /// 背景色 - 米白
  static const Color background = Color(0xFFF8F5F2);
  static const Color cardBackground = Colors.white;
  static const Color backgroundDark = Color(0xFF1E1E1E); // 保留但暂时不用

  /// 文本色
  static const Color textPrimary = Color(0xFF222222); // 几乎纯黑
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textLight = Color(0xFF9CA3AF);

  /// 边框色 - 纯黑
  static const Color border = Color(0xFF000000);
  static const Color divider = Color(0xFFE5E7EB);

  /// 状态色
  static const Color success = Color(0xFF4ADE80); // Green 400
  static const Color warning = Color(0xFFFACC15); // Yellow 400
  static const Color error = Color(0xFFF87171); // Red 400
  static const Color info = Color(0xFF60A5FA); // Blue 400
  
  // 兼容旧代码的别名，逐步替换
  static const Color primaryLight = secondary;
  static const Color primaryDark = Color(0xFFEAB308); // Yellow 500
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
