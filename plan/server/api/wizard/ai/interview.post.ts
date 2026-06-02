import { createZhipuClient } from '../../../utils/zhipu'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { history, context } = body

    // Construct system prompt
    const systemPrompt = `
你是一个专业的"副业赚钱咨询师"。你的目标通过简短的追问，帮用户理清赚钱思路。
用户背景：
- 目标收入：${context.incomeGoal}万/年
- 职业：${context.profile.background}
- 时间：${context.profile.weeklyHours}
- 初始想法：${context.openQuestion}

任务：
1. 分析用户的信息是否足够生成具体的执行计划。
2. 如果信息太模糊（例如只说"想赚钱"但没方向），请追问 1 个具体问题。
3. 如果信息已基本足够，或者已经追问了 3 轮，请回复 "CONFIRM_END" 并总结你的理解。
4. 追问要口语化、亲切、简短（不超过 50 字）。
`

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history
    ]

    try {
        const client = createZhipuClient()
        const result = await client.chat(messages)
        const reply = result.choices[0].message.content

        return {
            success: true,
            reply: reply
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            reply: "AI 暂时开小差了，我们可以直接进入下一步。"
        }
    }
})
