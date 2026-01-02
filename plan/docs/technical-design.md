# 技术设计文档：智能规划向导 (Wizard Flow) v2.0

> **文档版本**: v2.0
> **关联PRD**: `docs/wizard_requirements.md` (v3.0+)
> **状态**: 已修订，匹配 L1-L4 层级与滚动规划逻辑

---

## 1. 架构与数据流

### 1.1 核心层级映射 (Hierarchy Mapping)
为消除歧义，数据库表与业务概念的映射如下：

| 业务层级 | 业务名称 | 数据库表 | 说明 |
|:---:|:---|:---|:---|
| **L1** | **Goal** | `user_profiles` | 存储 `income_goal`, `deadline` |
| **L2** | **Path** | `paths` | 存储路径、权重、公式配置 |
| **L3** | **Milestone** | `projects` | **关键**: 原 `projects` 表即为里程碑表 |
| **L4** | **Task** | `tasks` | 存储具体任务 |

### 1.2 数据交互流
1.  **Wizard 阶段**: 前端 Pinia 存储所有 Steps 状态 → `POST /api/wizard/save` (一次性事务提交)。
2.  **AI 生成**: 
    *   Step 3: 调用 `/api/wizard/ai/milestones` (生成 L3 骨架)。
    *   Step 4: 并行调用 `/api/wizard/ai/tasks` (填充 L4 细节)。
3.  **滚动规划**: 后续通过 `/api/planning/trigger-next` 触发新里程碑规划。

---

## 2. 数据库设计 (Schema Design)

### 2.1 `paths` 表 (L2)
```sql
ALTER TABLE paths 
ADD COLUMN weight INTEGER DEFAULT 100,             -- 资源权重 (如 70)
ADD COLUMN formula_config JSONB DEFAULT '{}',      -- 公式配置 (Step 2)
ADD COLUMN start_date DATE,
ADD COLUMN duration_weeks INTEGER;
```

### 2.2 `projects` 表 (L3 Milestone)
**注意**: 此表承担 Milestone 角色。

```sql
ALTER TABLE projects 
ADD COLUMN start_date DATE,                        -- 计划开始
ADD COLUMN end_date DATE,                          -- 计划结束
ADD COLUMN is_active BOOLEAN DEFAULT FALSE,        -- 是否为当前活跃里程碑
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE,        -- 是否已完成 L4 拆解
ADD COLUMN completion_rate DECIMAL(5,2) DEFAULT 0, -- 进度 (0-100)
ADD COLUMN acceptance_criteria TEXT,               -- 验收标准
ADD COLUMN income_contribution DECIMAL(12,2);      -- 预计收入贡献
```

### 2.3 `tasks` 表 (L4)
```sql
ALTER TABLE tasks 
ADD COLUMN task_type TEXT DEFAULT 'core',          -- core/support
ADD COLUMN original_estimate DECIMAL(5,2),         -- AI 原始估时
ADD COLUMN planned_date DATE,                      -- 排期日期
ADD COLUMN sort_order INTEGER;
-- project_id 即为 milestone_id 外键
```

---

## 3. 详细步骤技术设计

### Step 0: 目标设定 (Goal)
*   **前端**: 存储 `incomeGoal` 和 `deadline` 到 Pinia。
*   **后端**: 最终保存到 `user_profiles` 表的扩展字段（或新建 `goals` 表，MVP 建议存 profile）。

### Step 1 & 2: 路径与资源 (Path & Formula)
*   **逻辑**: 前端校验 `sum(weights) == 100`。
*   **AI**: 这里的公式计算是纯前端数学逻辑，**不调用 AI**。AI 仅在用户点击"不知道怎么填"时提供建议 (Optional)。

### Step 3: 里程碑生成 (L3 Bone Generation)
*   **API**: `POST /api/wizard/ai/milestones`
*   **Input**: `goal`, `deadline`, `paths` (含 weights)。
*   **System Prompt**: 
    > "You are a Project Manager. Generate a timeline of Milestones (L3) for the following Paths. Do NOT generate Tasks (L4). The timeline must fit within [Deadline]."
*   **Output Schema**:
    ```json
    {
      "paths": [
        {
          "path_index": 0, // 对应前端数组索引
          "milestones": [
            { "name": "MVP", "weeks": 4, "criteria": "..." }
          ]
        }
      ]
    }
    ```

### Step 4: 首个里程碑拆解 (L4 Detail Generation)
*   **API**: `POST /api/wizard/ai/tasks`
*   **Strategy**: **Frontend Parallel Requests**. 前端对每条 Path 发起一个请求。
*   **Input**: 单个 Milestone 信息 + 该 Path 的每日可用工时 (DailyHours * Weight%)。
*   **System Prompt**:
    > "Generate detailed Tasks (L4) for this Milestone. Total hours must not exceed [BudgetHours]. Mark tasks as 'core' or 'support'."

### Step 5: 可行性验证 (Feasibility)
*   **位置**: 纯前端逻辑 (Client-side Calculation)。
*   **算法**:
    1.  `TotalDemand_A` = Sum(TaskHours in Path A)
    2.  `TotalSupply_A` = (DailyHours * Weight_A%) * DaysUntilMilestoneEnd
    3.  `Ratio` = Demand / Supply
    4.  If `Ratio > 1.0` -> Warning.

---

## 4. 滚动规划状态机 (Rolling Planning Logic)

这是 v3.0 的核心逻辑，用于处理 "Next Trigger"。

### 4.1 触发条件
1.  **自动监测**: 每次 `UPDATE tasks SET status='done'` 时，触发后端 Hook。
2.  **判断逻辑**: 
    ```typescript
    if (Milestone.completion_rate > 80% && !NextMilestone.is_locked) {
      createNotification("当前里程碑即将完成，点击规划下一阶段");
    }
    ```

### 4.2 规划接口 (`POST /api/planning/trigger-next`)
*   **Input**: `current_milestone_id`
*   **Process**:
    1.  找到 `next_milestone` (基于 sort_order)。
    2.  调用 AI 生成 `next_milestone` 的 Tasks。
    3.  保存 Tasks 到 DB。
    4.  更新 `next_milestone.is_locked = true`。
    5.  更新 `next_milestone.is_active = true` (可选，或等用户确认)。

---

## 5. 核心算法：穿插排期 (Weighted Scheduler)

用于 Step 6 及后续日历生成。

```typescript
/**
 * @param paths - 包含 tasks 和 weight 的路径列表
 * @param dailyHours - 用户每日总工时 (如 4h)
 * @param startDate - 开始排期日期
 */
function weightedSchedule(paths: Path[], dailyHours: number, startDate: Date) {
  let currentDate = new Date(startDate);
  
  // 1. 计算每条路径每日配额
  // Path A (70%): 2.8h, Path B (30%): 1.2h
  const quotas = paths.map(p => ({ 
    id: p.id, 
    dailyQuota: dailyHours * (p.weight / 100),
    queue: [...p.tasks] // 待排期任务队列
  }));

  while (quotas.some(q => q.queue.length > 0)) {
    // 跳过非工作日 (简单版逻辑)
    if (isWeekend(currentDate)) { currentDate.addDay(1); continue; }

    // 2. 每日填充
    for (const path of quotas) {
      let usedQuota = 0;
      while (path.queue.length > 0 && usedQuota < path.dailyQuota) {
        const task = path.queue[0];
        // 如果任务能塞进今日剩余配额 (允许微小溢出以避免任务碎片化)
        if (usedQuota + task.hours <= path.dailyQuota * 1.2) { 
          task.plannedDate = currentDate;
          usedQuota += task.hours;
          path.queue.shift();
        } else {
          break; // 今日配额用完，留给明天
        }
      }
    }
    
    currentDate.addDay(1);
  }
}
```

---

## 6. 安全与一致性

*   **事务保证**: `/api/wizard/save` 必须使用 Supabase/Postgres 事务，确保 Profile/Path/Project/Task 要么全写入，要么全失败。
*   **Prompt 注入防御**: 在 Backend 拼接 Prompt 时，对用户输入进行 Escape 处理。
