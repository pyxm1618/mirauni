import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// 推送通知服务
/// 
/// 注意：使用此服务需要先配置极光推送：
/// 1. 在极光官网 (https://www.jiguang.cn/) 创建应用获取 AppKey
/// 2. 在 pubspec.yaml 中添加依赖: jpush_flutter: ^2.5.0
/// 3. 配置 iOS 推送证书
/// 4. 配置 Android 推送服务
/// 
/// 目前此服务仅提供框架，需要用户提供 AppKey 后完成配置
class PushService {
  static PushService? _instance;
  static const String _keyDeviceToken = 'push_device_token';
  static const String _keyPushEnabled = 'push_enabled';
  
  PushService._();
  
  /// 获取单例实例
  static PushService get instance {
    _instance ??= PushService._();
    return _instance!;
  }
  
  bool _isInitialized = false;
  String? _deviceToken;
  
  /// 是否已初始化
  bool get isInitialized => _isInitialized;
  
  /// 设备令牌（用于服务端推送）
  String? get deviceToken => _deviceToken;
  
  /// 初始化推送服务
  /// 
  /// 需要在 main.dart 中调用此方法
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // TODO: 配置极光推送后取消注释以下代码
      // 
      // import 'package:jpush_flutter/jpush_flutter.dart';
      // 
      // final jpush = JPush();
      // 
      // // 初始化
      // jpush.setup(
      //   appKey: "您的极光AppKey",  // 替换为您的 AppKey
      //   channel: "developer-default",
      //   production: false,  // 生产环境设为 true
      //   debug: true,
      // );
      // 
      // // 获取 Registration ID（设备令牌）
      // jpush.getRegistrationID().then((rid) {
      //   _deviceToken = rid;
      //   _saveDeviceToken(rid);
      //   debugPrint('JPush Registration ID: $rid');
      // });
      // 
      // // 监听收到的通知
      // jpush.addEventHandler(
      //   onReceiveNotification: (Map<String, dynamic> message) async {
      //     debugPrint("收到通知: $message");
      //     _handleNotification(message);
      //   },
      //   onOpenNotification: (Map<String, dynamic> message) async {
      //     debugPrint("打开通知: $message");
      //     _handleNotificationOpen(message);
      //   },
      //   onReceiveMessage: (Map<String, dynamic> message) async {
      //     debugPrint("收到自定义消息: $message");
      //   },
      // );
      
      _isInitialized = true;
      debugPrint('推送服务初始化完成（框架模式）');
    } catch (e) {
      debugPrint('推送服务初始化失败: $e');
    }
  }
  
  /// 请求通知权限
  Future<bool> requestPermission() async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // await jpush.applyPushAuthority();
      return true;
    } catch (e) {
      debugPrint('请求通知权限失败: $e');
      return false;
    }
  }
  
  /// 设置别名（用于按用户推送）
  Future<void> setAlias(String userId) async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // await jpush.setAlias(userId);
      debugPrint('设置推送别名: $userId');
    } catch (e) {
      debugPrint('设置别名失败: $e');
    }
  }
  
  /// 删除别名（用户登出时调用）
  Future<void> deleteAlias() async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // await jpush.deleteAlias();
      debugPrint('删除推送别名');
    } catch (e) {
      debugPrint('删除别名失败: $e');
    }
  }
  
  /// 设置标签（用于分组推送）
  Future<void> setTags(List<String> tags) async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // await jpush.setTags(tags);
      debugPrint('设置推送标签: $tags');
    } catch (e) {
      debugPrint('设置标签失败: $e');
    }
  }
  
  /// 清除角标数字
  Future<void> clearBadge() async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // await jpush.clearBadge();
      // jpush.setBadge(0);
      debugPrint('清除角标');
    } catch (e) {
      debugPrint('清除角标失败: $e');
    }
  }
  
  /// 设置角标数字
  Future<void> setBadge(int count) async {
    try {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // jpush.setBadge(count);
      debugPrint('设置角标: $count');
    } catch (e) {
      debugPrint('设置角标失败: $e');
    }
  }
  
  /// 保存设备令牌到本地
  Future<void> _saveDeviceToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyDeviceToken, token);
  }
  
  /// 获取保存的设备令牌
  Future<String?> getSavedDeviceToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyDeviceToken);
  }
  
  /// 检查推送是否启用
  Future<bool> isPushEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyPushEnabled) ?? true;
  }
  
  /// 设置推送开关
  Future<void> setPushEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyPushEnabled, enabled);
    
    if (enabled) {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // jpush.resumePush();
    } else {
      // TODO: 配置极光推送后取消注释
      // final jpush = JPush();
      // jpush.stopPush();
    }
  }
  
  /// 处理收到的通知
  void _handleNotification(Map<String, dynamic> message) {
    // 在这里处理收到的通知
    // 例如：更新未读消息数、刷新消息列表等
    debugPrint('处理通知: $message');
  }
  
  /// 处理通知点击
  void _handleNotificationOpen(Map<String, dynamic> message) {
    // 在这里处理通知点击事件
    // 例如：跳转到对应的聊天页面
    // 
    // 通知数据格式示例:
    // {
    //   "title": "新消息",
    //   "alert": "张三: 你好",
    //   "extras": {
    //     "type": "chat",
    //     "conversation_id": "xxx",
    //     "from_user_id": "xxx"
    //   }
    // }
    debugPrint('处理通知点击: $message');
    
    // TODO: 根据通知类型跳转到对应页面
    // final extras = message['extras'] as Map<String, dynamic>?;
    // if (extras != null) {
    //   final type = extras['type'] as String?;
    //   if (type == 'chat') {
    //     final conversationId = extras['conversation_id'] as String?;
    //     if (conversationId != null) {
    //       // 使用 GoRouter 跳转到聊天页面
    //       // GoRouter.of(context).push('/chat/$userId');
    //     }
    //   }
    // }
  }
}

/// 推送消息类型
enum PushMessageType {
  /// 新聊天消息
  chat,
  
  /// 系统通知
  system,
  
  /// 项目相关
  project,
}

/// 推送配置常量
class PushConfig {
  /// 极光推送 AppKey
  /// 
  /// 请在极光官网创建应用后替换此值
  static const String appKey = 'YOUR_JPUSH_APP_KEY';
  
  /// 推送渠道
  static const String channel = 'developer-default';
  
  /// 是否为生产环境
  static const bool isProduction = false;
}
