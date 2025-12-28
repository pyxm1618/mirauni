/// 订单模型
class Order {
  final String id;
  final String userId;
  final String orderNo;
  final String packageId;
  final String packageName;
  final int amount;
  final int credits;
  final String status;
  final String? payType;
  final DateTime? paidAt;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.userId,
    required this.orderNo,
    required this.packageId,
    required this.packageName,
    required this.amount,
    required this.credits,
    required this.status,
    this.payType,
    this.paidAt,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      orderNo: json['order_no'] as String,
      packageId: json['package_id'] as String,
      packageName: json['package_name'] as String? ?? '',
      amount: json['amount'] as int,
      credits: json['credits'] as int,
      status: json['status'] as String,
      payType: json['pay_type'] as String?,
      paidAt: json['paid_at'] != null
          ? DateTime.parse(json['paid_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'order_no': orderNo,
      'package_id': packageId,
      'package_name': packageName,
      'amount': amount,
      'credits': credits,
      'status': status,
      'pay_type': payType,
      'paid_at': paidAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// 是否已支付
  bool get isPaid => status == 'paid';

  /// 金额显示文本
  String get amountText => '¥${(amount / 100).toStringAsFixed(2)}';
}

/// 充值套餐
class RechargePackage {
  final String id;
  final String name;
  final int amount; // 单位：分
  final int credits;
  final int? originalAmount; // 原价（用于显示优惠）
  final String? tag; // 标签，如"推荐"

  RechargePackage({
    required this.id,
    required this.name,
    required this.amount,
    required this.credits,
    this.originalAmount,
    this.tag,
  });

  /// 金额显示文本
  String get amountText => '¥${(amount / 100).toStringAsFixed(0)}';
  
  /// 原价显示文本
  String? get originalAmountText {
    if (originalAmount == null) return null;
    return '¥${(originalAmount! / 100).toStringAsFixed(0)}';
  }

  /// 单价（每次解锁多少钱）
  String get unitPrice {
    final price = amount / credits / 100;
    return '¥${price.toStringAsFixed(1)}/次';
  }
}

/// 预定义的充值套餐
class RechargePackages {
  static final List<RechargePackage> all = [
    RechargePackage(
      id: 'package_30',
      name: '基础包',
      amount: 3000, // 30元
      credits: 3,
      tag: null,
    ),
    RechargePackage(
      id: 'package_50',
      name: '超值包',
      amount: 5000, // 50元
      credits: 5,
      tag: '推荐',
    ),
    RechargePackage(
      id: 'package_100',
      name: '尊享包',
      amount: 10000, // 100元
      credits: 12,
      originalAmount: 12000, // 原价120元
      tag: '最划算',
    ),
  ];
}
