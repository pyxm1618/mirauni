> ⚠️ 早期方案归档与定位说明
> 本文件属于钱途工具相关的早期 RAG 路径推荐设计方案，尚未确认接入当前的 `plan/` (钱途工具) 线上业务。
> 本文件不属于「小概率独立开发者匹配平台」的主线 MVP 范围，不应将其与主线平台混淆。
> 另外，经审计，本方案设计的 `path_templates` 表 (使用 UUID 主键) 与种子数据 `path_templates_seed.sql` 中普通字符串 ID ('p001' 等) 存在类型冲突，直接执行会导致导入失败。
> 该 RAG 方案目前不作为当前已上线 `plan/` 业务的既有投产功能；未来如需启用，应作为钱途工具的独立迭代重新评审 schema、seed、API 与前端接入。

# RAG 知识库功能开发交接文档

> 本文档用于交接给另一个 AI 进行开发

## 一、任务概述

实现一个 **RAG (Retrieval-Augmented Generation) 路径推荐系统**，包括：
1. 创建数据库表 `path_templates`
2. 导入 50 条种子数据
3. 改造现有 `recommend.post.ts` API 实现 RAG 检索逻辑
4. 前端展示真实案例和风险提示

## 二、核心文档

请按顺序阅读以下文档：

1. **[docs/RAG.md](./docs/RAG.md)** - 完整技术设计，1000+ 行，包含：
   - 数据库 Schema（第 95-200 行）
   - 检索算法设计（第 326-560 行）
   - API 改造方案（第 560-700 行）
   - 验证测试方案（第 780-900 行）

2. **[path_templates_seed.sql](./path_templates_seed.sql)** - 50 条完整种子数据

3. **[plan/docs/PRD.md](./plan/docs/PRD.md)** - 钱途产品需求文档（背景参考）

## 三、开发步骤

> ⚠️ **禁止执行警示**  
> 以下步骤为历史规划的开发方案，因本方案尚未确认接入当前已上线的 plan 线上业务，目前禁止直接执行。

### Step 1: 创建数据库表
在 Supabase 执行 `docs/RAG.md` 中的建表 SQL（第 102-139 行）。

### Step 2: 导入种子数据
执行根目录 `path_templates_seed.sql`。

### Step 3: 创建工具函数
新建 `server/utils/path-retrieval.ts`，实现检索逻辑（参考 RAG.md 第 410-446 行）。

### Step 4: 改造推荐 API
修改 `server/api/wizard/ai/recommend.post.ts`：
- 先从知识库检索匹配路径
- 将候选路径注入 Prompt
- AI 只能从候选池选择
- 返回真实案例数据

### Step 5: 前端展示
修改 `pages/wizard/paths.vue`，展示 `real_cases`、`tips`、`risks` 字段。

### Step 6: 验证测试
执行 RAG.md 第 745-768 行的 curl 测试命令。

## 四、关键验证点

1. 用户选择"不露脸"时，返回结果不包含 `requires_show_face = true` 的路径
2. 每次推荐返回 3 条路径，且必须来自知识库
3. 返回的路径包含 `real_cases` 字段

## 五、技术栈

- Nuxt 3 + Supabase + 智谱 AI (GLM-4)
- 参考现有代码结构和风格

---

**本文件仅作历史参考，当前不得据此启动 RAG 开发。**
