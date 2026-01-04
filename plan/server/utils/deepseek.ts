// DeepSeek AI Client
// API Documentation: https://platform.deepseek.com/api-docs

export const createDeepSeekClient = () => {
    const config = useRuntimeConfig()
    const apiKey = config.deepseekApiKey || process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
        console.warn('DEEPSEEK_API_KEY not found. Using Mock Mode.')
        return {
            chat: async (messages: any[]) => {
                await new Promise(resolve => setTimeout(resolve, 500))
                return {
                    choices: [{
                        message: {
                            content: JSON.stringify({ error: 'No API Key configured' })
                        }
                    }]
                }
            }
        }
    }

    return {
        chat: async (messages: any[], options?: { temperature?: number }) => {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: messages,
                    temperature: options?.temperature ?? 0.7,
                    response_format: { type: 'json_object' } // 强制JSON输出
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('DeepSeek API Error:', errorText)
                throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`)
            }

            return await response.json()
        }
    }
}
