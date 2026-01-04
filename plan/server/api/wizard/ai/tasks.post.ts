import { createDeepSeekClient } from '~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { milestone, path, budgetHours } = body

    if (!milestone || !path) {
        throw createError({ statusCode: 400, statusMessage: 'Milestone and Path are required' })
    }

    try {
        const client = createDeepSeekClient()

        const systemPrompt = `你是一位专业的项目管理顾问。将里程碑分解为具体可执行的任务清单。

**路径信息：**
- 路径名称: ${path.name}
- 路径类型: ${path.type}

**要分解的里程碑（用户自定义）：**
- 里程碑名称: "${milestone.name}"
- 周期: ${milestone.weeks}周
- 验收标准: "${milestone.criteria}"
- 预算工时: ${budgetHours}小时

**严格要求：**
1. 返回纯JSON: { "tasks": [ { "name": "...", "hours": 2, "type": "core", "sort_order": 1 } ] }
2. 任务必须**完全基于**上述里程碑名称和验收标准来设计
3. 如果里程碑是"市场调研"，不要生成编码任务
4. 如果里程碑是"开发MVP"，不要生成营销任务
5. 每个任务2-8小时，颗粒度要细
6. type: "core"=核心任务, "support"=辅助任务
7. 总工时尽量不超过预算${budgetHours}小时
8. 所有内容用中文`

        const config = useRuntimeConfig()

        if (config.deepseekApiKey) {
            const response = await client.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: '请根据里程碑生成任务列表。' }
            ])

            const content = response.choices[0]?.message?.content
            if (content) {
                const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
                const aiResult = JSON.parse(jsonStr)

                if (aiResult && aiResult.tasks) {
                    return aiResult
                }
            }
        }

        // Fallback
        console.warn('AI task generation failed. Using templates.')
        return generateMockTasks(path, milestone)

    } catch (e) {
        console.error('Task Generation Error:', e)
        return generateMockTasks(path, milestone)
    }
})

function generateMockTasks(path: any, milestone: any) {
    // Simple template based on keywords or path type
    let tasks = []

    if (path.type === 'product') {
        tasks = [
            { name: '竞品与市场调研', hours: 4, type: 'core', sort_order: 1 },
            { name: '核心功能需求定义', hours: 3, type: 'core', sort_order: 2 },
            { name: '数据库 Schema 设计', hours: 4, type: 'core', sort_order: 3 },
            { name: '技术选型与脚手架搭建', hours: 4, type: 'support', sort_order: 4 },
            { name: 'UI/UX 原型草图绘制', hours: 6, type: 'core', sort_order: 5 },
            { name: '核心API接口开发 (Login/User)', hours: 8, type: 'core', sort_order: 6 },
            { name: '前端基础组件封装', hours: 6, type: 'support', sort_order: 7 }
        ]
    } else if (path.type === 'content') {
        tasks = [
            { name: '确定目标读者画像', hours: 2, type: 'core', sort_order: 1 },
            { name: '搭建博客/注册公众号', hours: 4, type: 'support', sort_order: 2 },
            { name: '撰写前 3 篇选题大纲', hours: 3, type: 'core', sort_order: 3 },
            { name: '第一篇文章初稿撰写', hours: 4, type: 'core', sort_order: 4 },
            { name: '文章配图与排版', hours: 2, type: 'support', sort_order: 5 },
            { name: '社交媒体账号矩阵注册', hours: 3, type: 'support', sort_order: 6 }
        ]
    } else {
        tasks = [
            { name: '梳理服务内容与定价', hours: 4, type: 'core', sort_order: 1 },
            { name: '制作服务介绍 PDF/PPT', hours: 6, type: 'core', sort_order: 2 },
            { name: '寻找潜在客户渠道', hours: 4, type: 'core', sort_order: 3 },
            { name: '准备合同与收款方式', hours: 2, type: 'support', sort_order: 4 },
            { name: '第一次客户冷启动联系', hours: 2, type: 'core', sort_order: 5 }
        ]
    }

    return { tasks }
}
