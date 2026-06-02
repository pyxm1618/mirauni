/// 表单验证工具类
class Validators {
  /// 验证手机号（中国大陆）
  static String? phone(String? value) {
    if (value == null || value.isEmpty) {
      return '请输入手机号';
    }
    if (value.length != 11) {
      return '请输入11位手机号';
    }
    // 简单验证：以1开头的11位数字
    final regex = RegExp(r'^1[3-9]\d{9}$');
    if (!regex.hasMatch(value)) {
      return '请输入正确的手机号';
    }
    return null;
  }

  /// 验证验证码
  static String? code(String? value) {
    if (value == null || value.isEmpty) {
      return '请输入验证码';
    }
    if (value.length != 6) {
      return '请输入6位验证码';
    }
    return null;
  }

  /// 验证用户名
  static String? username(String? value) {
    if (value == null || value.isEmpty) {
      return '请输入用户名';
    }
    if (value.length < 2) {
      return '用户名至少2个字符';
    }
    if (value.length > 20) {
      return '用户名最多20个字符';
    }
    return null;
  }

  /// 验证简介
  static String? bio(String? value) {
    if (value != null && value.length > 200) {
      return '简介最多200个字符';
    }
    return null;
  }

  /// 验证微信号
  static String? wechat(String? value) {
    if (value == null || value.isEmpty) {
      return null; // 微信号可选
    }
    if (value.length < 6) {
      return '微信号至少6个字符';
    }
    if (value.length > 20) {
      return '微信号最多20个字符';
    }
    // 微信号格式：字母开头，允许字母数字下划线
    final regex = RegExp(r'^[a-zA-Z][a-zA-Z0-9_-]{5,19}$');
    if (!regex.hasMatch(value)) {
      return '请输入正确的微信号';
    }
    return null;
  }

  /// 验证邮箱
  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return null; // 邮箱可选
    }
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!regex.hasMatch(value)) {
      return '请输入正确的邮箱';
    }
    return null;
  }
}
