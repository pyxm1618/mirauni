import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../config/constants.dart';
import '../../core/supabase/supabase_client.dart';
import '../../providers/message_provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/message/message_bubble.dart';
import '../../widgets/common/loading.dart';
import '../../widgets/common/error_view.dart';

/// 聊天页面
class ChatPage extends ConsumerStatefulWidget {
  /// 对方用户 ID
  final String targetUserId;

  const ChatPage({super.key, required this.targetUserId});

  @override
  ConsumerState<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends ConsumerState<ChatPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();

  String? _conversationId;
  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  
  /// 对方用户信息
  Map<String, dynamic>? _targetUser;

  @override
  void initState() {
    super.initState();
    _initConversation();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  /// 初始化会话
  Future<void> _initConversation() async {
    try {
      // 获取对方用户信息
      await _fetchTargetUser();
      
      // 获取或创建会话
      final conversationId = await MessageService()
          .getOrCreateConversation(widget.targetUserId);

      if (mounted) {
        setState(() {
          _conversationId = conversationId;
          _isLoading = false;
        });

        // 标记消息为已读
        await MessageService().markAsRead(conversationId);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  /// 获取对方用户信息
  Future<void> _fetchTargetUser() async {
    try {
      final response = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .eq('id', widget.targetUserId)
          .maybeSingle();
      
      if (mounted && response != null) {
        setState(() {
          _targetUser = response;
        });
      }
    } catch (e) {
      debugPrint('获取用户信息失败: $e');
    }
  }

  /// 发送消息
  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty || _conversationId == null || _isSending) return;

    setState(() {
      _isSending = true;
    });

    try {
      await MessageService().sendMessage(
        conversationId: _conversationId!,
        toUserId: widget.targetUserId,
        content: content,
      );

      _messageController.clear();
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('发送失败: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSending = false;
        });
      }
    }
  }

  /// 滚动到底部
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, size: 20),
          color: AppColors.textPrimary,
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            // 头像
            ClipOval(
              child: _targetUser?['avatar_url'] != null
                  ? CachedNetworkImage(
                      imageUrl: _targetUser!['avatar_url'],
                      width: 36,
                      height: 36,
                      fit: BoxFit.cover,
                    )
                  : Container(
                      width: 36,
                      height: 36,
                      color: AppColors.border,
                      child: Icon(Icons.person, color: AppColors.textLight),
                    ),
            ),
            const SizedBox(width: 12),
            // 用户名
            Expanded(
              child: Text(
                _targetUser?['username'] ?? '用户',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const AppLoading();
    }

    if (_error != null) {
      return ErrorView(
        message: _error!,
        onRetry: _initConversation,
      );
    }

    if (_conversationId == null) {
      return const Center(child: Text('无法加载会话'));
    }

    return Column(
      children: [
        // 消息列表
        Expanded(
          child: _buildMessageList(),
        ),
        // 输入区域
        _buildInputArea(),
      ],
    );
  }

  Widget _buildMessageList() {
    final messagesAsync = ref.watch(chatMessagesProvider(_conversationId!));
    final currentUserId = ref.watch(currentUserIdProvider);

    return messagesAsync.when(
      data: (messages) {
        if (messages.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.chat_bubble_outline,
                  size: 64,
                  color: AppColors.textLight,
                ),
                const SizedBox(height: 16),
                Text(
                  '暂无消息，开始聊天吧',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          );
        }

        // 自动滚动到底部
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scrollToBottom();
        });

        return ListView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.symmetric(vertical: 16),
          itemCount: messages.length,
          itemBuilder: (context, index) {
            final message = messages[index];
            final isSent = message.fromUserId == currentUserId;
            
            // 检查是否需要显示日期分隔线
            bool showDateDivider = false;
            if (index == 0) {
              showDateDivider = true;
            } else {
              final prevMessage = messages[index - 1];
              final prevDate = DateTime(
                prevMessage.createdAt.year,
                prevMessage.createdAt.month,
                prevMessage.createdAt.day,
              );
              final currDate = DateTime(
                message.createdAt.year,
                message.createdAt.month,
                message.createdAt.day,
              );
              showDateDivider = prevDate != currDate;
            }

            // 检查是否需要显示时间（距离上一条消息超过5分钟）
            bool showTime = true;
            if (index > 0) {
              final prevMessage = messages[index - 1];
              final diff = message.createdAt.difference(prevMessage.createdAt);
              showTime = diff.inMinutes >= 5 || 
                         message.fromUserId != prevMessage.fromUserId;
            }

            return Column(
              children: [
                if (showDateDivider)
                  MessageTimeDivider(time: message.createdAt),
                MessageBubble(
                  content: message.content,
                  time: message.createdAt,
                  isSent: isSent,
                  avatarUrl: isSent ? null : _targetUser?['avatar_url'],
                  showTime: showTime,
                ),
              ],
            );
          },
        );
      },
      loading: () => const AppLoading(),
      error: (error, _) => ErrorView(
        message: error.toString(),
        onRetry: () => ref.invalidate(chatMessagesProvider(_conversationId!)),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.only(
        left: 12,
        right: 12,
        top: 8,
        bottom: MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // 输入框
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _messageController,
                focusNode: _focusNode,
                maxLines: 4,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: '输入消息...',
                  hintStyle: TextStyle(color: AppColors.textLight),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // 发送按钮
          GestureDetector(
            onTap: _isSending ? null : _sendMessage,
            child: Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _isSending ? AppColors.border : AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: _isSending
                  ? Padding(
                      padding: const EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.textLight,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.send_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
