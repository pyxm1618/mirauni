import { createZhipuClient } from '~/server/utils/zhipu'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { milestone, path, budgetHours } = body

    if (!milestone || !path) {
        throw createError({ statusCode: 400, statusMessage: 'Milestone and Path are required' })
    }

    try {
        const client = createZhipuClient()
        
        const systemPrompt = `
You are an expert Project Manager. Break down the Milestone (L3) into actionable Tasks (L4).
Path Context: ${path.name} (${path.type})
Milestone: "${milestone.name}"
Duration: ${milestone.weeks} weeks.
Success Criteria: "${milestone.criteria}"

Requirements:
1. Return a JSON object with "tasks" array.
2. Each task: { "name": "...", "hours": 2, "type": "core" | "support", "sort_order": 1 }
3. Tasks should be granular (2-8 hours each).
4. **CRITICAL**: The tasks MUST be derived directly from the Milestone Name and Criteria. 
   - If the milestone is "Market Research", do NOT generate coding tasks.
   - If the milestone is "Write Code", do NOT generate marketing tasks.
   - Respect the user's custom definition of the milestone.
5. Focus on ESSENTIAL tasks.
6. "type": "core" for essential tasks, "support" for admin/learning/setup.
        `

        // Try AI generation
        let aiResult = null
        const config = useRuntimeConfig()
        
        if (config.zhipuApiKey) {
             const response = await client.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Generate the task list now." }
            ])
            const content = response.choices[0]?.message?.content
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
            aiResult = JSON.parse(jsonStr)
        }

        if (aiResult && aiResult.tasks) {
            return aiResult
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
