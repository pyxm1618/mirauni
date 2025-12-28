/// 环境配置
/// 
/// 使用方式：
/// 运行时通过 --dart-define 指定环境变量：
/// flutter run --dart-define=SUPABASE_URL=xxx --dart-define=SUPABASE_ANON_KEY=xxx
class Env {
  /// Supabase 项目 URL
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://oqdlieazealiztewgjan.supabase.co',
  );

  /// Supabase 匿名 Key（公开密钥，可安全包含在客户端）
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'sb_publishable_1BZsVIO91IictwaSCewZKA__XWZAGJa',
  );

  /// 微信开放平台 App ID（待申请）
  static const wechatAppId = String.fromEnvironment(
    'WECHAT_APP_ID',
    defaultValue: '',
  );

  /// API 基础 URL（与 Web 共用 Supabase Edge Functions）
  static String get apiBaseUrl => '$supabaseUrl/functions/v1';

  /// 是否为开发环境
  static const isDevelopment = bool.fromEnvironment('DEVELOPMENT', defaultValue: true);
}
