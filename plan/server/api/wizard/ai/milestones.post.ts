import { createDeepSeekClient } from '~/server/utils/deepseek'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { paths, deadline, goal, profile } = body

    // Validate inputs
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Paths are required' })
    }

    try {
        const client = createDeepSeekClient()

        const backgroundStr = profile ? `用户背景: ${Array.isArray(profile.background) ? profile.background.join(', ') : profile.background}。每周可用时间: ${profile.weeklyHours}小时。` : ''

        const systemPrompt = `你是一位专业的项目管理顾问和职业规划师。
你的任务是将用户的赚钱路径分解为具体的里程碑(Milestones)。

用户信息：
- 目标: ${goal}万元，截止日期: ${deadline}
- ${backgroundStr}

用户选择的路径：
${JSON.stringify(paths.map((p: any) => ({
            name: p.name,
            type: p.type,
            weight: p.weight,
            dailyHours: p.dailyHours,
            formula: p.formula?.config // 包含价格、数量等收入公式细节
        })), null, 2)}

**严格要求：**
1. 返回纯JSON，不要任何markdown或解释
2. 格式: { "paths": [ { "path_index": 0, "milestones": [ { "name": "...", "weeks": 4, "criteria": "..." } ] } ] }
3. 每条路径3-5个里程碑，覆盖整个时间线
4. **关键**: 里程碑名称必须具体到用户的路径。例如：
   - 好: "发布AI头像生成器MVP"，"获取前100个付费用户"
   - 差: "第一阶段"，"产品开发"
5. criteria必须包含具体可量化的指标，基于用户的收入公式计算
6. 所有内容必须用中文`

        const config = useRuntimeConfig()

        if (config.deepseekApiKey) {
            const response = await client.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: '请立即生成里程碑规划。' }
            ])

            const content = response.choices[0]?.message?.content
            if (content) {
                // 清理可能的markdown标记
                const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
                const aiResult = JSON.parse(jsonStr)

                if (aiResult && aiResult.paths) {
                    return aiResult
                }
            }
        }

        // Fallback: 模版生成
        console.warn('AI generation failed or skipped. Using templates.')
        return generateMockMilestones(paths)

    } catch (e) {
        console.error('Milestone Generation Error:', e)
        // Fallback on error
        return generateMockMilestones(paths)
    }
})

function generateMockMilestones(paths: any[]) {
    const resultPaths = paths.map((path, index) => {
        let milestones = []

        if (path.type === 'product') {
            milestones = [
                { name: 'MVP 核心功能开发', weeks: 4, criteria: '完成核心功能闭环，部署上线' },
                { name: '种子用户获取', weeks: 4, criteria: '获得前 100 位注册用户' },
                { name: '产品迭代与收费', weeks: 8, criteria: '上线付费功能，转化率达 1%' },
                { name: '规模化推广', weeks: 12, criteria: '用户量突破 1000' }
            ]
        } else if (path.type === 'content') {
            milestones = [
                { name: '定位与基础设施', weeks: 2, criteria: '确定选题方向，搭建博客/公众号' },
                { name: '内容库填充', weeks: 4, criteria: '完成首批 10 篇高质量文章' },
                { name: '渠道铺设与引流', weeks: 4, criteria: '在 3 个主流平台分发，阅读量破万' },
                { name: '商业化变现', weeks: 12, criteria: '接第一个广告或开启付费专栏' }
            ]
        } else {
            // Service / Other
            milestones = [
                { name: '服务标准化', weeks: 2, criteria: '定义服务内容、定价与交付标准' },
                { name: '客源拓展', weeks: 4, criteria: '接触 50 个潜在客户，完成试单' },
                { name: '交付与口碑', weeks: 8, criteria: '完成 5 个付费订单，获得好评' },
                { name: '长期客户建立', weeks: 12, criteria: '建立长期合作关系，收入稳定' }
            ]
        }

        return {
            path_index: index,
            milestones
        }
    })

    return { paths: resultPaths }
}
