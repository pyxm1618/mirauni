import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:fluwx/fluwx.dart';
import '../core/supabase/supabase_client.dart';
import 'wechat_service.dart';

/// 支付服务
/// 
/// 提供微信支付功能
class PaymentService {
  static final PaymentService _instance = PaymentService._internal();
  factory PaymentService() => _instance;
  PaymentService._internal();

  final WechatService _wechatService = WechatService();
  final List<WeChatResponseSubscriber> _subscribers = [];

  /// 套餐定义
  static const packages = [
    {'id': 'package_30', 'price': 30, 'credits': 3, 'label': '30元 / 3次'},
    {'id': 'package_50', 'price': 50, 'credits': 5, 'label': '50元 / 5次'},
    {'id': 'package_100', 'price': 100, 'credits': 12, 'label': '100元 / 12次'},
  ];

  /// 创建订单并发起微信支付
  /// 
  /// [packageId] 套餐 ID (package_30, package_50, package_100)
  /// 返回支付结果：true 成功，false 用户取消
  Future<bool> createOrderAndPay(String packageId) async {
    // 1. 调用后端 Edge Function 创建订单
    final response = await supabase.functions.invoke(
      'create-order',
      body: {
        'packageId': packageId,
        'payType': 'app',  // 标识为 App 支付
      },
    );

    if (response.status != 200) {
      final error = response.data is Map ? response.data['error'] : '创建订单失败';
      throw Exception(error ?? '创建订单失败');
    }

    final payParams = response.data['payParams'];
    if (payParams == null) {
      throw Exception('获取支付参数失败');
    }

    // 2. 调用微信 App 支付
    final result = await _wechatService.fluwx.pay(
      which: Payment(
        appId: payParams['appid'] ?? payParams['appId'],
        partnerId: payParams['partnerid'] ?? payParams['partnerId'],
        prepayId: payParams['prepayid'] ?? payParams['prepayId'],
        packageValue: payParams['package'] ?? 'Sign=WXPay',
        nonceStr: payParams['noncestr'] ?? payParams['nonceStr'],
        timestamp: int.tryParse(payParams['timestamp']?.toString() ?? '') ?? 0,
        sign: payParams['sign'],
      ),
    );

    if (!result) {
      throw Exception('拉起微信支付失败');
    }

    // 3. 等待支付结果
    return await _waitForPayResult();
  }

  /// 等待支付结果
  Future<bool> _waitForPayResult() async {
    final completer = Completer<bool>();

    void listener(WeChatResponse resp) {
      if (resp is WeChatPaymentResponse) {
        if (resp.errCode == 0) {
          // 支付成功
          completer.complete(true);
        } else if (resp.errCode == -2) {
          // 用户取消
          completer.complete(false);
        } else {
          // 支付失败
          completer.completeError(
            Exception('支付失败: ${resp.errStr ?? "未知错误"}'),
          );
        }
        _subscribers.remove(listener);
      }
    }

    _subscribers.add(listener);

    // 设置超时（5分钟）
    return completer.future.timeout(
      const Duration(minutes: 5),
      onTimeout: () {
        _subscribers.remove(listener);
        throw Exception('支付超时，请检查订单状态');
      },
    );
  }

  /// 解锁用户
  /// 
  /// [targetUserId] 要解锁的用户 ID
  Future<void> unlockUser(String targetUserId) async {
    final response = await supabase.functions.invoke(
      'unlock-user',
      body: {'targetUserId': targetUserId},
    );

    if (response.status != 200) {
      final error = response.data is Map ? response.data['error'] : '解锁失败';
      throw Exception(error ?? '解锁失败');
    }
  }

  /// 检查是否已解锁用户
  Future<bool> checkUnlocked(String targetUserId) async {
    try {
      final userId = supabase.auth.currentUser?.id;
      if (userId == null) return false;

      final result = await supabase
          .from('unlocks')
          .select('id')
          .eq('user_id', userId)
          .eq('target_user_id', targetUserId)
          .maybeSingle();

      return result != null;
    } catch (e) {
      debugPrint('检查解锁状态失败: $e');
      return false;
    }
  }

  /// 获取用户解锁次数余额
  Future<int> getCredits() async {
    try {
      final userId = supabase.auth.currentUser?.id;
      if (userId == null) return 0;

      final result = await supabase
          .from('users')
          .select('unlock_credits')
          .eq('id', userId)
          .single();

      return result['unlock_credits'] ?? 0;
    } catch (e) {
      debugPrint('获取解锁次数失败: $e');
      return 0;
    }
  }

  /// 销毁
  void dispose() {
    _subscribers.clear();
  }
}
