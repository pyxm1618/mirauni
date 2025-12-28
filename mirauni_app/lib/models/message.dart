/// 消息模型
class Message {
  final String id;
  final String conversationId;
  final String fromUserId;
  final String toUserId;
  final String content;
  final String? messageType;
  final bool isRead;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.fromUserId,
    required this.toUserId,
    required this.content,
    this.messageType = 'text',
    this.isRead = false,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      conversationId: json['conversation_id'] as String,
      fromUserId: json['from_user_id'] as String,
      toUserId: json['to_user_id'] as String,
      content: json['content'] as String,
      messageType: json['message_type'] as String? ?? 'text',
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'from_user_id': fromUserId,
      'to_user_id': toUserId,
      'content': content,
      'message_type': messageType,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

/// 会话模型
class Conversation {
  final String id;
  final String user1Id;
  final String user2Id;
  final DateTime? lastMessageAt;
  final DateTime createdAt;

  /// 最后一条消息
  final Message? lastMessage;
  
  /// 对方用户信息
  final ConversationUser? otherUser;

  /// 未读消息数
  final int unreadCount;

  Conversation({
    required this.id,
    required this.user1Id,
    required this.user2Id,
    this.lastMessageAt,
    required this.createdAt,
    this.lastMessage,
    this.otherUser,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json, {String? currentUserId}) {
    Message? lastMessage;
    if (json['last_message'] != null) {
      if (json['last_message'] is List) {
        final list = json['last_message'] as List;
        if (list.isNotEmpty) {
          lastMessage = Message.fromJson(list.first as Map<String, dynamic>);
        }
      } else if (json['last_message'] is Map) {
        lastMessage = Message.fromJson(json['last_message'] as Map<String, dynamic>);
      }
    }

    return Conversation(
      id: json['id'] as String,
      user1Id: json['user1_id'] as String,
      user2Id: json['user2_id'] as String,
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.parse(json['last_message_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastMessage: lastMessage,
      otherUser: json['other_user'] != null
          ? ConversationUser.fromJson(json['other_user'] as Map<String, dynamic>)
          : null,
      unreadCount: json['unread_count'] as int? ?? 0,
    );
  }

  /// 获取对方用户 ID
  String getOtherUserId(String currentUserId) {
    return user1Id == currentUserId ? user2Id : user1Id;
  }
}

/// 会话中的用户信息（简化版）
class ConversationUser {
  final String id;
  final String? username;
  final String? avatarUrl;

  ConversationUser({
    required this.id,
    this.username,
    this.avatarUrl,
  });

  factory ConversationUser.fromJson(Map<String, dynamic> json) {
    return ConversationUser(
      id: json['id'] as String,
      username: json['username'] as String?,
      avatarUrl: json['avatar_url'] as String?,
    );
  }

  String get displayName => username ?? '用户';
}
