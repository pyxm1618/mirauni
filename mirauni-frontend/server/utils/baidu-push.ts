interface PushResult {
  success: boolean
  data?: any
  error?: string
}

export async function pushUrlsToBaidu(urls: string[]): Promise<PushResult> {
  const config = useRuntimeConfig()
  const token = config.baiduPushToken
  const siteUrl = (config.public.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

  if (!token || !urls.length) {
    return { success: false, error: 'missing token or urls' }
  }

  try {
    const endpoint = `http://data.zz.baidu.com/urls?site=${siteUrl}&token=${token}`
    const data = await $fetch(endpoint, {
      method: 'POST',
      body: urls.join('\n'),
      headers: { 'Content-Type': 'text/plain' }
    })
    return { success: true, data }
  } catch (error: any) {
    return { success: false, error: error?.message || 'push failed' }
  }
}
