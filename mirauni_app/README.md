# Mirauni Flutter App

小概率移动端 App，使用 Flutter 实现项目浏览、开发者浏览、登录、付费解锁、站内信、个人中心和推送/评分等移动端能力。

## 技术栈

- Flutter 3 / Dart
- Supabase Flutter
- Riverpod
- go_router
- fluwx

## 本地开发

```bash
flutter pub get
flutter analyze
flutter test
flutter run
```

## 主要目录

| 路径 | 说明 |
|------|------|
| `lib/config/` | 环境变量、常量、主题 |
| `lib/router/` | go_router 路由 |
| `lib/pages/` | 页面 |
| `lib/providers/` | Riverpod Provider |
| `lib/services/` | 认证、用户、支付、微信、推送、评分服务 |
| `lib/models/` | 数据模型 |
| `lib/widgets/` | 通用和业务组件 |

## 配置

开发前确认 `lib/config/env.dart` 中的 Supabase、API、微信配置。iOS/Android 上架前还需要配置真实 App ID、微信开放平台参数、推送服务参数和商店签名信息。
