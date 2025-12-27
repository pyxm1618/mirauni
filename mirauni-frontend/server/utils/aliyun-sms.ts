/**
 * 阿里云短信发送工具
 * 文档：https://help.aliyun.com/document_detail/419273.html
 */
import crypto from 'crypto'

interface SendSmsParams {
    phone: string
    code: string
}

interface AliyunSmsResponse {
    Code: string
    Message: string
    RequestId: string
    BizId?: string
}

/**
 * 发送短信验证码
 */
export async function sendAliyunSms({ phone, code }: SendSmsParams): Promise<boolean> {
    const config = useRuntimeConfig()

    // 开发环境直接返回成功（验证码已在调用处打印）
    if (process.dev && !config.aliyunAccessKeyId) {
        console.log(`[DEV] 阿里云短信未配置，跳过发送。验证码: ${code}`)
        return true
    }

    const accessKeyId = config.aliyunAccessKeyId
    const accessKeySecret = config.aliyunAccessKeySecret
    const signName = config.aliyunSmsSignName || '小概率'
    const templateCode = config.aliyunSmsTemplateCode

    if (!accessKeyId || !accessKeySecret || !templateCode) {
        console.error('阿里云短信配置不完整')
        return false
    }

    // API 参数
    const params: Record<string, string> = {
        AccessKeyId: accessKeyId,
        Action: 'SendSms',
        Format: 'JSON',
        PhoneNumbers: phone,
        SignName: signName,
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: Math.random().toString(36).slice(2),
        SignatureVersion: '1.0',
        TemplateCode: templateCode,
        TemplateParam: JSON.stringify({ code }),
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        Version: '2017-05-25'
    }

    // 生成签名
    const signature = generateSignature(params, accessKeySecret)
    params.Signature = signature

    try {
        const response = await $fetch<AliyunSmsResponse>(
            'https://dysmsapi.aliyuncs.com/',
            {
                method: 'GET',
                query: params
            }
        )

        if (response.Code === 'OK') {
            console.log(`短信发送成功: ${phone}`)
            return true
        } else {
            console.error(`短信发送失败: ${response.Code} - ${response.Message}`)
            return false
        }
    } catch (error) {
        console.error('短信发送异常:', error)
        return false
    }
}

/**
 * 生成阿里云 API 签名
 */
function generateSignature(params: Record<string, string>, secret: string): string {
    // 1. 按参数名排序
    const sortedKeys = Object.keys(params).sort()

    // 2. 构造规范化请求字符串
    const canonicalizedQueryString = sortedKeys
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')

    // 3. 构造待签名字符串
    const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(canonicalizedQueryString)}`

    // 4. 计算 HMAC-SHA1
    const hmac = crypto.createHmac('sha1', `${secret}&`)
    hmac.update(stringToSign)

    return hmac.digest('base64')
}

/**
 * 检查发送频率限制
 * 返回 true 表示可以发送，false 表示需要等待
 */
export async function checkSmsRateLimit(phone: string, supabase: any): Promise<{ canSend: boolean; waitSeconds?: number }> {
    // 查询最近一次发送记录
    const { data } = await supabase
        .from('sms_codes')
        .select('created_at')
        .eq('phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!data) {
        return { canSend: true }
    }

    const lastSendTime = new Date(data.created_at).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - lastSendTime) / 1000)
    const waitTime = 60 // 60秒限制

    if (elapsed < waitTime) {
        return { canSend: false, waitSeconds: waitTime - elapsed }
    }

    return { canSend: true }
}
