import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/constants.dart';
import '../../models/user.dart';
import '../../providers/user_provider.dart';
import '../../services/user_service.dart';
import '../../utils/toast.dart';

/// 编辑资料页面
class ProfileEditPage extends ConsumerStatefulWidget {
  const ProfileEditPage({super.key});

  @override
  ConsumerState<ProfileEditPage> createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends ConsumerState<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _bioController = TextEditingController();
  final _wechatController = TextEditingController();
  final _emailController = TextEditingController();
  final _userService = UserService();
  final _imagePicker = ImagePicker();

  List<String> _skills = [];
  int _experience = 0;
  bool _isLoading = false;
  bool _isUploading = false;
  String? _avatarUrl;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _bioController.dispose();
    _wechatController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _loadUserData() {
    final userAsync = ref.read(currentUserProvider);
    userAsync.whenData((user) {
      if (user != null) {
        _usernameController.text = user.username ?? '';
        _bioController.text = user.bio ?? '';
        _wechatController.text = user.wechat ?? '';
        _emailController.text = user.email ?? '';
        setState(() {
          _skills = user.skills ?? [];
          _experience = user.experience ?? 0;
          _avatarUrl = user.avatarUrl;
        });
      }
    });
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 512,
        maxHeight: 512,
        imageQuality: 85,
      );
      
      if (pickedFile != null) {
        await _uploadAvatar(File(pickedFile.path));
      }
    } catch (e) {
      if (mounted) {
        Toast.error(context, '选择图片失败');
      }
    }
  }

  Future<void> _uploadAvatar(File file) async {
    setState(() => _isUploading = true);

    try {
      final url = await _userService.uploadAvatar(file);
      setState(() => _avatarUrl = url);
      if (mounted) {
        Toast.success(context, '头像更新成功');
      }
      ref.invalidate(currentUserProvider);
    } catch (e) {
      if (mounted) {
        Toast.error(context, e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // 检查用户名是否可用
      final username = _usernameController.text.trim();
      if (username.isNotEmpty) {
        final isAvailable = await _userService.isUsernameAvailable(username);
        if (!isAvailable) {
          if (mounted) {
            Toast.error(context, '用户名已被使用');
          }
          setState(() => _isLoading = false);
          return;
        }
      }

      await _userService.updateProfile(
        username: username.isNotEmpty ? username : null,
        bio: _bioController.text.trim(),
        skills: _skills,
        experience: _experience,
        wechat: _wechatController.text.trim(),
        email: _emailController.text.trim(),
      );

      ref.invalidate(currentUserProvider);

      if (mounted) {
        Toast.success(context, '保存成功');
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        Toast.error(context, e.toString());
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _addSkill() {
    showDialog(
      context: context,
      builder: (context) {
        final controller = TextEditingController();
        return AlertDialog(
          title: const Text('添加技能标签'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              hintText: '例如：Flutter、iOS、后端开发',
              border: OutlineInputBorder(),
            ),
            autofocus: true,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('取消'),
            ),
            TextButton(
              onPressed: () {
                final skill = controller.text.trim();
                if (skill.isNotEmpty && !_skills.contains(skill)) {
                  setState(() => _skills.add(skill));
                }
                Navigator.pop(context);
              },
              child: const Text('添加'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          '编辑资料',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveProfile,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(
                    '保存',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 头像
              Center(
                child: GestureDetector(
                  onTap: _isUploading ? null : _pickImage,
                  child: Stack(
                    children: [
                      ClipOval(
                        child: _isUploading
                            ? Container(
                                width: 100,
                                height: 100,
                                color: AppColors.border,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              )
                            : _avatarUrl != null
                                ? CachedNetworkImage(
                                    imageUrl: _avatarUrl!,
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.cover,
                                  )
                                : Container(
                                    width: 100,
                                    height: 100,
                                    color: AppColors.border,
                                    child: Icon(
                                      Icons.person,
                                      size: 50,
                                      color: AppColors.textLight,
                                    ),
                                  ),
                      ),
                      Positioned(
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  '点击更换头像',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.textLight,
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // 用户名
              _buildLabel('昵称'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _usernameController,
                decoration: _inputDecoration('请输入昵称'),
                validator: (value) {
                  if (value != null && value.isNotEmpty && value.length < 2) {
                    return '昵称至少2个字符';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              // 简介
              _buildLabel('个人简介'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _bioController,
                decoration: _inputDecoration('介绍一下自己'),
                maxLines: 3,
                maxLength: 200,
              ),

              const SizedBox(height: 20),

              // 技能标签
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildLabel('技能标签'),
                  TextButton.icon(
                    onPressed: _addSkill,
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('添加'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _skills.map((skill) {
                  return Chip(
                    label: Text(skill),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () {
                      setState(() => _skills.remove(skill));
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              // 工作年限
              _buildLabel('工作年限'),
              const SizedBox(height: 8),
              DropdownButtonFormField<int>(
                value: _experience,
                decoration: _inputDecoration(''),
                items: [
                  const DropdownMenuItem(value: 0, child: Text('未选择')),
                  const DropdownMenuItem(value: 1, child: Text('1 年以下')),
                  const DropdownMenuItem(value: 2, child: Text('1-3 年')),
                  const DropdownMenuItem(value: 3, child: Text('3-5 年')),
                  const DropdownMenuItem(value: 5, child: Text('5-10 年')),
                  const DropdownMenuItem(value: 10, child: Text('10 年以上')),
                ],
                onChanged: (value) {
                  setState(() => _experience = value ?? 0);
                },
              ),

              const SizedBox(height: 20),

              // 微信号
              _buildLabel('微信号'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _wechatController,
                decoration: _inputDecoration('便于对方联系你'),
              ),

              const SizedBox(height: 20),

              // 邮箱
              _buildLabel('邮箱'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _emailController,
                decoration: _inputDecoration('便于接收通知'),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value != null && value.isNotEmpty) {
                    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                    if (!emailRegex.hasMatch(value)) {
                      return '请输入有效的邮箱地址';
                    }
                  }
                  return null;
                },
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: AppColors.textPrimary,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: AppColors.primary),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
