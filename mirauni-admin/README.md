# Mirauni Admin

Vue 3 + Vite 管理后台，负责仪表盘、用户管理、项目审核、文章管理、订单管理和数据分析。

## 本地开发

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run build
npm run preview
```

## 主要目录

| 路径 | 说明 |
|------|------|
| `src/router/` | 管理后台路由和登录守卫 |
| `src/views/` | 页面视图 |
| `src/layouts/AdminLayout.vue` | 后台主布局 |
| `src/stores/auth.js` | 管理员登录状态 |
| `src/utils/api.js` | 后台 API 客户端 |

后台接口位于 `../mirauni-frontend/server/api/admin/**`。部署前需要确认 Web 前台服务的 CORS 配置允许后台域名访问。
