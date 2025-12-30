import { createZhipuClient } from '../../../utils/zhipu'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { context } = body

    // Construct system prompt for Path Recommendation
    const systemPrompt = `
你是一个专业的"副业赚钱规划师"。请根据用户背景推荐 3 条可行的赚钱路径组合。
用户背景：
- 目标收入：${context.incomeGoal}万/年
- 职业：${context.profile.background}
- 时间：${context.profile.weeklyHours}
- 约束：${context.profile.constraints.join(', ')}
- 想法：${context.openQuestion}

要求：
1. 返回严格的 JSON 格式（不要包含 markdown 代码块）。
2. JSON 结构如下：
{
  "paths": [
    {
      "name": "路径名称(如: 开发SaaS工具)",
      "incomeMin": 10,
      "incomeMax": 50,
      "reason": "推荐理由(20字内)",
      "category": "product"
    }
  ],
  "totalIncomeMin": 40,
  "totalIncomeMax": 100
}
3. 确保 3 条路径的总收入范围能覆盖用户的目标收入（${context.incomeGoal}万）。
4. 路径类型 category 可选: product/content/service/other
`

    try {
        const client = createZhipuClient()
        const result = await client.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: '请开始推荐' }
        ])

        let content = result.choices[0].message.content
        // Clean up potential markdown code blocks
        content = content.replace(/```json/g, '').replace(/```/g, '').trim()

        const data = JSON.parse(content)

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.error(error)
        // Fallback Mock data if AI fails
        return {
            success: true,
            data: {
                paths: [
                    { name: "接私活/外包", incomeMin: 20, incomeMax: 50, reason: "利用现有技术快速变现", category: "service" },
                    { name: "技术博客/专栏", incomeMin: 5, incomeMax: 20, reason: "建立影响力，长期被动收入", category: "content" },
                    { name: "开发微型SaaS", incomeMin: 10, incomeMax: 100, reason: "高杠杆，有机会爆发增长", category: "product" }
                ],
                totalIncomeMin: 35,
                totalIncomeMax: 170
            }
        }
    }
})
