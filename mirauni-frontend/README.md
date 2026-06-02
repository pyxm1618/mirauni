# Mirauni Web Frontend

Nuxt 3 Web 前台，负责小概率主站、SSR 页面、用户认证、项目/开发者/学院页面，以及服务端 API。

## 技术栈

- Nuxt 3 + Vue 3
- Supabase
- Pinia
- Tailwind CSS + Nuxt UI
- `@nuxtjs/i18n`

## 本地开发

```bash
npm install
cp .env.example .env
npm run dev
```

开发服务固定运行在 `http://localhost:3000`，用于 SSO 和跨端联调。

## 常用命令

```bash
npm run typecheck
npm run build
npm run preview
```

## 主要目录

| 路径 | 说明 |
|------|------|
| `pages/` | 主站页面路由 |
| `server/api/` | Nuxt 服务端 API，含 Web 与管理后台接口 |
| `server/utils/` | 微信、短信、百度推送、鉴权等服务端工具 |
| `composables/` | 认证、支付、消息、上传、埋点等前端逻辑 |
| `stores/` | Pinia 状态 |
| `supabase/schema.sql` | Supabase 数据库 Schema |

## 配置

环境变量以 `.env.example` 为准。生产环境必须配置 Supabase、微信、腾讯云短信、百度、`JWT_SECRET`、`IP_HASH_SECRET`、微信支付商户配置。
