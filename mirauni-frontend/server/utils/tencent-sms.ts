/**
 * 腾讯云短信发送工具
 * 文档：https://cloud.tencent.com/document/product/382/55981
 */
import crypto from 'crypto'

interface SendSmsParams {
    phone: string
    code: string
}

interface TencentSmsResponse {
    Response: {
        SendStatusSet?: Array<{
            SerialNo: string
            PhoneNumber: string
            Fee: number
            SessionContext: string
            Code: string
            Message: string
            IsoCode: string
        }>
        RequestId: string
        Error?: {
            Code: string
            Message: string
        }
    }
}

/**
 * 发送短信验证码
 */
export async function sendTencentSms({ phone, code }: SendSmsParams): Promise<boolean> {
    const config = useRuntimeConfig()

    // 开发环境直接返回成功（验证码已在调用处打印）
    if (process.dev && !config.tencentSecretId) {
        console.log(`[DEV] 腾讯云短信未配置，跳过发送。验证码: ${code}`)
        return true
    }

    const secretId = config.tencentSecretId as string
    const secretKey = config.tencentSecretKey as string
    const sdkAppId = config.tencentSmsSdkAppId as string
    const signName = (config.tencentSmsSignName as string) || '小概率'
    const templateId = config.tencentSmsTemplateId as string

    if (!secretId || !secretKey || !sdkAppId || !templateId) {
        console.error('腾讯云短信配置不完整')
        return false
    }

    // 确保手机号格式正确（+86 前缀）
    const formattedPhone = phone.startsWith('+86') ? phone : `+86${phone}`

    // 请求参数
    const payload = {
        PhoneNumberSet: [formattedPhone],
        SmsSdkAppId: sdkAppId,
        SignName: signName,
        TemplateId: templateId,
        TemplateParamSet: [code, '5'] // 验证码和有效期（分钟）
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
    const service = 'sms'
    const host = 'sms.tencentcloudapi.com'
    const action = 'SendSms'
    const version = '2021-01-11'
    const region = 'ap-guangzhou'

    // 生成签名
    const payloadStr = JSON.stringify(payload)
    const hashedPayload = crypto.createHash('sha256').update(payloadStr).digest('hex')

    const httpRequestMethod = 'POST'
    const canonicalUri = '/'
    const canonicalQueryString = ''
    const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-tc-action:${action.toLowerCase()}\n`
    const signedHeaders = 'content-type;host;x-tc-action'

    const canonicalRequest = [
        httpRequestMethod,
        canonicalUri,
        canonicalQueryString,
        canonicalHeaders,
        signedHeaders,
        hashedPayload
    ].join('\n')

    const algorithm = 'TC3-HMAC-SHA256'
    const credentialScope = `${date}/${service}/tc3_request`
    const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    const stringToSign = [
        algorithm,
        timestamp,
        credentialScope,
        hashedCanonicalRequest
    ].join('\n')

    // 计算签名
    const secretDate = hmacSha256(`TC3${secretKey}`, date)
    const secretService = hmacSha256(secretDate, service)
    const secretSigning = hmacSha256(secretService, 'tc3_request')
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex')

    const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

    try {
        const response = await $fetch<TencentSmsResponse>(`https://${host}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Host': host,
                'X-TC-Action': action,
                'X-TC-Version': version,
                'X-TC-Timestamp': timestamp.toString(),
                'X-TC-Region': region,
                'Authorization': authorization
            },
            body: payloadStr
        })

        if (response.Response.Error) {
            console.error(`短信发送失败: ${response.Response.Error.Code} - ${response.Response.Error.Message}`)
            return false
        }

        const sendStatus = response.Response.SendStatusSet?.[0]
        if (sendStatus?.Code === 'Ok') {
            console.log(`短信发送成功: ${phone}`)
            return true
        } else {
            console.error(`短信发送失败: ${sendStatus?.Code} - ${sendStatus?.Message}`)
            return false
        }
    } catch (error) {
        console.error('短信发送异常:', error)
        return false
    }
}

/**
 * HMAC-SHA256 签名
 */
function hmacSha256(key: string | Buffer, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest()
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
