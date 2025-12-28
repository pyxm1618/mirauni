import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:fluwx/fluwx.dart';
import '../config/env.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user.dart';

/// 微信服务
/// 
/// 提供微信登录、分享等功能
class WechatService {
  static final WechatService _instance = WechatService._internal();
  factory WechatService() => _instance;
  WechatService._internal();

  final Fluwx _fluwx = Fluwx();
  bool _isInitialized = false;
  final List<WeChatResponseSubscriber> _subscribers = [];

  /// 初始化微信 SDK
  Future<void> init() async {
    if (_isInitialized) return;
    
    try {
      await _fluwx.registerApi(
        appId: Env.wechatAppId,
        universalLink: 'https://mirauni.com/app/',
      );
      _isInitialized = true;
      debugPrint('微信 SDK 初始化成功');
    } catch (e) {
      debugPrint('微信 SDK 初始化失败: $e');
    }
  }

  /// 检查微信是否安装
  Future<bool> isWechatInstalled() async {
    try {
      return await _fluwx.isWeChatInstalled;
    } catch (e) {
      debugPrint('检查微信安装状态失败: $e');
      return false;
    }
  }

  /// 微信登录
  /// 
  /// 返回登录成功的用户信息
  /// 抛出 [NeedBindPhoneException] 如果用户需要绑定手机号
  Future<AppUser> loginWithWechat() async {
    // 1. 检查微信是否安装
    final installed = await isWechatInstalled();
    if (!installed) {
      throw Exception('请先安装微信');
    }

    // 2. 拉起微信授权
    final result = await _fluwx.authBy(
      which: NormalAuth(
        scope: 'snsapi_userinfo',
        state: 'mirauni_login_${DateTime.now().millisecondsSinceEpoch}',
      ),
    );

    if (!result) {
      throw Exception('拉起微信授权失败');
    }

    // 3. 等待微信回调获取 code
    final code = await _waitForWechatCode();

    // 4. 调用后端 Edge Function 换取用户信息
    final response = await supabase.functions.invoke(
      'wechat-app-login',
      body: {'code': code},
    );

    if (response.status != 200) {
      final error = response.data is Map ? response.data['error'] : '登录失败';
      throw Exception(error ?? '登录失败');
    }

    // 5. 设置 session
    final sessionData = response.data['session'];
    if (sessionData != null) {
      await supabase.auth.setSession(sessionData['access_token']);
    }

    // 6. 检查是否需要绑定手机号
    final userData = response.data['user'];
    final user = AppUser.fromJson(userData);
    
    if (user.phone == null || user.phone!.isEmpty) {
      throw NeedBindPhoneException(user);
    }

    return user;
  }

  /// 等待微信授权回调
  Future<String> _waitForWechatCode() async {
    final completer = Completer<String>();

    void listener(WeChatResponse resp) {
      if (resp is WeChatAuthResponse) {
        if (resp.errCode == 0 && resp.code != null) {
          completer.complete(resp.code);
        } else if (resp.errCode == -4) {
          completer.completeError(Exception('用户拒绝授权'));
        } else if (resp.errCode == -2) {
          completer.completeError(Exception('用户取消授权'));
        } else {
          completer.completeError(Exception('授权失败: ${resp.errStr ?? "未知错误"}'));
        }
        // 移除监听器
        _subscribers.remove(listener);
      }
    }

    _subscribers.add(listener);

    // 设置超时
    return completer.future.timeout(
      const Duration(seconds: 60),
      onTimeout: () {
        _subscribers.remove(listener);
        throw Exception('授权超时，请重试');
      },
    );
  }

  /// 绑定手机号
  Future<AppUser> bindPhone(String phone, String code) async {
    final response = await supabase.functions.invoke(
      'bind-phone',
      body: {'phone': phone, 'code': code},
    );

    if (response.status != 200) {
      final error = response.data is Map ? response.data['error'] : '绑定失败';
      throw Exception(error ?? '绑定失败');
    }

    return AppUser.fromJson(response.data['user']);
  }

  /// 获取 Fluwx 实例（用于支付服务）
  Fluwx get fluwx => _fluwx;

  // ============ 分享功能 ============

  /// 分享网页到微信
  /// 
  /// [url] 网页链接
  /// [title] 标题
  /// [description] 描述（可选）
  /// [thumbnail] 缩略图 URL（可选）
  /// [scene] 分享场景：session（好友）、timeline（朋友圈）
  Future<bool> shareWebPage({
    required String url,
    required String title,
    String? description,
    String? thumbnail,
    WeChatScene scene = WeChatScene.session,
  }) async {
    final installed = await isWechatInstalled();
    if (!installed) {
      throw Exception('请先安装微信');
    }

    try {
      final model = WeChatShareWebPageModel(
        url,
        title: title,
        description: description ?? '',
        thumbnail: thumbnail != null 
            ? WeChatImage.network(thumbnail) 
            : null,
        scene: scene,
      );

      return await _fluwx.share(model);
    } catch (e) {
      debugPrint('分享网页失败: $e');
      return false;
    }
  }

  /// 分享纯文本到微信
  /// 
  /// [text] 分享的文本内容
  /// [scene] 分享场景
  Future<bool> shareText({
    required String text,
    WeChatScene scene = WeChatScene.session,
  }) async {
    final installed = await isWechatInstalled();
    if (!installed) {
      throw Exception('请先安装微信');
    }

    try {
      final model = WeChatShareTextModel(
        text,
        scene: scene,
      );

      return await _fluwx.share(model);
    } catch (e) {
      debugPrint('分享文本失败: $e');
      return false;
    }
  }

  /// 分享图片到微信
  /// 
  /// [imagePath] 图片路径（本地路径或网络 URL）
  /// [scene] 分享场景
  Future<bool> shareImage({
    required String imagePath,
    WeChatScene scene = WeChatScene.session,
  }) async {
    final installed = await isWechatInstalled();
    if (!installed) {
      throw Exception('请先安装微信');
    }

    try {
      WeChatImage image;
      if (imagePath.startsWith('http')) {
        image = WeChatImage.network(imagePath);
      } else {
        image = WeChatImage.file(imagePath);
      }

      final model = WeChatShareImageModel(image, scene: scene);

      return await _fluwx.share(model);
    } catch (e) {
      debugPrint('分享图片失败: $e');
      return false;
    }
  }

  /// 销毁
  void dispose() {
    _subscribers.clear();
  }
}

/// 需要绑定手机号异常
class NeedBindPhoneException implements Exception {
  final AppUser user;
  NeedBindPhoneException(this.user);

  @override
  String toString() => '需要绑定手机号';
}
