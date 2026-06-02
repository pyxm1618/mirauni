import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/supabase/supabase_client.dart';
import '../core/storage/local_cache.dart';
import '../models/message.dart';
import '../providers/auth_provider.dart';

/// 未读消息数 Provider (实时)
final unreadCountProvider = StreamProvider<int>((ref) {
  final userId = ref.watch(currentUserIdProvider);
  if (userId == null) return Stream.value(0);

  return supabase
      .from('messages')
      .stream(primaryKey: ['id'])
      .eq('to_user_id', userId)
      .map((list) => list.where((m) => m['is_read'] == false).length);
});

/// 会话列表 Provider（带缓存）
final conversationsProvider = FutureProvider<List<Conversation>>((ref) async {
  final userId = ref.watch(currentUserIdProvider);
  if (userId == null) return [];

  final cache = await LocalCache.getInstance();
  const cacheKey = CacheKeys.messageList;
  
  // 请求网络数据
  final data = await supabase
      .from('conversations')
      .select('''
        *,
        last_message:messages(*)
      ''')
      .or('user1_id.eq.$userId,user2_id.eq.$userId')
      .order('last_message_at', ascending: false);

  final conversations = (data as List)
      .map((e) => Conversation.fromJson(e, currentUserId: userId))
      .toList();
  
  // 缓存数据
  await cache.set(cacheKey, data);

  return conversations;
});

/// 聊天消息列表 Provider
final chatMessagesProvider = StreamProvider.family<List<Message>, String>(
  (ref, conversationId) {
    return supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('conversation_id', conversationId)
        .order('created_at', ascending: true)
        .map((list) => list.map((e) => Message.fromJson(e)).toList());
  },
);

/// 消息服务
class MessageService {
  static final MessageService _instance = MessageService._internal();
  factory MessageService() => _instance;
  MessageService._internal();

  /// 发送消息
  Future<void> sendMessage({
    required String conversationId,
    required String toUserId,
    required String content,
  }) async {
    final fromUserId = supabase.auth.currentUser?.id;
    if (fromUserId == null) throw Exception('未登录');

    await supabase.from('messages').insert({
      'conversation_id': conversationId,
      'from_user_id': fromUserId,
      'to_user_id': toUserId,
      'content': content,
      'message_type': 'text',
    });

    // 更新会话的最后消息时间
    await supabase.from('conversations').update({
      'last_message_at': DateTime.now().toIso8601String(),
    }).eq('id', conversationId);
  }

  /// 获取或创建会话
  Future<String> getOrCreateConversation(String targetUserId) async {
    final currentUserId = supabase.auth.currentUser?.id;
    if (currentUserId == null) throw Exception('未登录');

    // 查找现有会话
    final existing = await supabase
        .from('conversations')
        .select('id')
        .or('and(user1_id.eq.$currentUserId,user2_id.eq.$targetUserId),and(user1_id.eq.$targetUserId,user2_id.eq.$currentUserId)')
        .maybeSingle();

    if (existing != null) {
      return existing['id'] as String;
    }

    // 创建新会话
    final result = await supabase.from('conversations').insert({
      'user1_id': currentUserId,
      'user2_id': targetUserId,
    }).select('id').single();

    return result['id'] as String;
  }

  /// 标记消息为已读
  Future<void> markAsRead(String conversationId) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return;

    await supabase
        .from('messages')
        .update({'is_read': true})
        .eq('conversation_id', conversationId)
        .eq('to_user_id', userId)
        .eq('is_read', false);
  }
}
