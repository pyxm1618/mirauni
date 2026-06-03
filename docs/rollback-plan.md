# 紧急回滚与防灾应急预案

为了在「小概率匹配平台 (主线)」上线后出现突发性严重故障（如业务中断、安全漏洞泄露、关键支付失效）时能够快速、稳妥地恢复系统，特制定此紧急回滚与防灾应急预案。

---

## 🖥️ 1. Vercel 代码回滚 (Vercel Rollback)

当新发布的前端或服务端 API 存在代码层面的运行时 Bug 时，应立即通过 Vercel 控制台执行一键秒级回滚。

### 1.1 操作步骤
1.  登录 [Vercel 控制台](https://vercel.com)。
2.  进入 `mirauni-frontend` 项目仪表盘，切换到 **Deployments** 选项卡。
3.  在部署列表中找到上一次稳定运行的部署记录（Revision）。
4.  点击右侧的三个点菜单，选择 **Redeploy**。
5.  在弹出的确认框中，勾选“Use existing build cache”（如果代码无底层构建包改动）以加速回退，点击 **Redeploy** 按钮。
6.  Vercel 将在数十秒内重新路由生产流量至该稳定历史版本。

### 1.2 兼容性验证
*   回滚后，立即访问平台，核对旧版代码与当前生产数据库 Schema 是否存在不兼容导致的接口异常。
*   清除浏览器缓存，确认客户端静态文件能够正常解密与加载。

---

## 🗄️ 2. 数据库回滚与防灾注意事项 (Supabase Database Rollback)

数据库表结构或数据的回滚是极其敏感的操作，稍有不慎就会带来灾难性后果。

### 2.1 ⚠️ 为什么不能盲目回滚数据库？
*   **严禁盲目恢复备份快照**：当新版上线运行一段时间后，可能已经产生了一批**真实的充值订单（orders）、联系人解锁记录（unlocks）、以及扣除余额的用户资金数据**。
*   如果在此刻直接通过还原历史备份快照的方式回滚数据库，**在上线与回滚时间差内产生的所有用户资金和充值订单数据将瞬间蒸发**，会引发严重的账目不一致与用户法律诉讼风险！

### 2.2 正确的数据库防灾与订正逻辑
1.  **首选向前修复 (Roll-forward)**：
    *   对于绝大多数 Schema 修改引起的 Bug，不应降级 Schema 结构，而是立刻在 Staging 编写一段“向下兼容的订正补丁”（如新增空值兼容、调整约束），通过 `supabase db push` 快速部署热修复。
2.  **必须回滚时的“数据挽救与提取”流程**：
    *   如果数据库损坏严重，必须回滚到发布前的快照备份，**必须严格执行以下步骤**：
        1.  **挂起写操作**：紧急开启平台维护模式（详见第 4 节功能开关），封锁所有充值和解锁请求，防止新增写数据。
        2.  **导出增量流水**：在 Supabase SQL 终端中执行 SQL，将发布后至当前时间段内产生的 `orders`、`unlocks`、`users` 充值变化记录导出为 CSV 或备份表（如 `temp_rescue_orders`）。
        3.  **还原备份**：执行 Supabase 快照恢复，将数据库结构与数据回退到发布前的安全时刻。
        4.  **数据重放与核销**：导入之前导出的临时增量流水表，通过手工或后台补偿脚本，将这段时间内付款的用户余额与解锁权限重新合并写入恢复后的数据库中，确保用户资产零丢失。

---

## ⚙️ 3. 环境变量回滚 (Environment Variables Rollback)

当因为新增或错改了环境变量（如微信支付商户私钥、短信 SDK ID 格式错误）导致生产报错时：

### 3.1 操作步骤
1.  登录 Vercel 控制台，进入项目的 **Settings** -> **Environment Variables**。
2.  找到报错的配置项，将其修改回之前记录的稳定 Key 值；或者直接删除新增的冲突变量。
3.  点击 **Save** 保存。
4.  **重要**：仅保存环境变量不会自动更新已经构建好的运行包。必须回到 **Deployments** 页面，重新触发一次 `Redeploy` 编译，使新的环境变量注入到 Serverless 环境中。

---

## 🔌 4. 紧急功能开关与降级兜底建议 (Feature Flags & Kill Switch)

为了在不进行代码重新编译与发布的前提下，在秒级时间内阻断严重故障，建议在系统架构中引入以下轻量级功能开关（Kill Switch）。

### 4.1 开关方案一：数据库级系统控制配置表 (Recommended)
*   **设计思路**：在 Supabase 中新建一张单行配置表 `system_settings`：
    ```sql
    CREATE TABLE system_settings (
      id INT PRIMARY KEY DEFAULT 1,
      is_maintenance_mode BOOLEAN DEFAULT false, -- 全站维护模式
      enable_wechat_pay BOOLEAN DEFAULT true,     -- 微信支付紧急开关
      enable_sms_sending BOOLEAN DEFAULT true,   -- 短信验证码紧急开关
      system_announcement TEXT                    -- 紧急公告
    );
    -- 开启 RLS，仅允许 Service Role 修改，普通用户可 SELECT
    ```
*   **应急应用**：
    *   **微信支付通道受阻**：在 Supabase SQL 终端中执行 `UPDATE system_settings SET enable_wechat_pay = false;`。前端检测到该字段为 false 时，充值页面自动展示“系统维护中，请稍后再试”，拦截充值入口。
    *   **短信验证码被刷**：执行 `UPDATE system_settings SET enable_sms_sending = false;`，紧急阻断短信网关调用，保护资金安全。
    *   **系统发生重大安全漏洞**：执行 `UPDATE system_settings SET is_maintenance_mode = true;`，服务端 API 拦截所有非管理员请求，返回 `503 Service Unavailable`，全站展示维护页面。

### 4.2 开关方案二：Vercel Edge Config / 环境变量热插拔
*   如果前台接口读取了 Vercel Edge Config，可以直接在 Edge Config 仪表盘修改配置，前端可在不查询 Supabase 的情况下以毫秒级时间完成降级响应。
