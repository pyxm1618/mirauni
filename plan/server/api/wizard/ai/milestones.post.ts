import { createZhipuClient } from '~/server/utils/zhipu'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { paths, deadline, goal } = body

    // Validate inputs
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Paths are required' })
    }

    try {
        const client = createZhipuClient()
        
        const systemPrompt = `
You are an expert Project Manager. Break down the user's Money Making Paths into Milestones (Level 3).
The Goal is to earn ${goal} Wan CNY by ${deadline}.

Input Paths:
${JSON.stringify(paths.map((p: any) => ({ name: p.name, type: p.type, weight: p.weight })), null, 2)}

Requirements:
1. Return a JSON object ONLY. No markdown, no explanations.
2. Structure: { "paths": [ { "path_index": 0, "milestones": [ { "name": "...", "weeks": 4, "criteria": "..." } ] } ] }
3. Each path should have 3-5 milestones covering the timeline.
4. "weeks" is the duration. "criteria" is the success metric.
        `

        // Try AI generation
        // Note: Real implementation would handle Zhipu's specific JWT requirement or use a proxy.
        // Here we optimistically try, but fallback to deterministic logic if it fails or returns garbage.
        let aiResult = null
        
        // Only try AI if we think we have a key (simple check)
        const config = useRuntimeConfig()
        if (config.zhipuApiKey) {
             const response = await client.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Generate the milestones now." }
            ])
            const content = response.choices[0]?.message?.content
            // simple cleanup for json
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim()
            aiResult = JSON.parse(jsonStr)
        }

        if (aiResult && aiResult.paths) {
            return aiResult
        }

        // Fallback: Deterministic Template Generation
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
