import { createAdminSupabaseClient } from '~/server/utils/admin-auth'
import { pushUrlsToBaidu } from '~/server/utils/baidu-push'

export interface EnqueueSeoUrlParams {
  url: string
  type: 'project' | 'article' | 'developer'
  sourceId?: string | null
}

export interface ProcessResult {
  processed: number
  successCount: number
  failedCount: number
}

/**
 * 将指定 URL 推送任务加入队列
 */
export async function enqueueSeoUrl(params: EnqueueSeoUrlParams) {
  try {
    const { url, type, sourceId } = params

    // 1. 校验类型
    if (!['project', 'article', 'developer'].includes(type)) {
      return { success: false, error: new Error(`无效的类型: ${type}`) }
    }

    // 2. 校验 URL
    const config = useRuntimeConfig()
    const siteUrl = (config.public?.siteUrl || 'https://mirauni.com').replace(/\/+$/, '')

    if (!url.startsWith(siteUrl)) {
      return { success: false, error: new Error(`URL 必须以站点前缀 ${siteUrl} 开始`) }
    }

    try {
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname
      if (hostname !== 'mirauni.com' && !hostname.endsWith('.mirauni.com')) {
        return { success: false, error: new Error('禁止推送非 mirauni.com 域名的 URL') }
      }
    } catch (e: any) {
      return { success: false, error: new Error(`无效的 URL 格式: ${e.message || '未知'}`) }
    }

    // 3. 使用 admin 客户端以绕过表 RLS 限制
    const supabase = createAdminSupabaseClient()

    // 4. 防止重复入队 (如果已存在 pending 或 processing 的同 URL)
    const { data: existing, error: checkError } = await supabase
      .from('seo_url_push_queue')
      .select('id')
      .eq('url', url)
      .in('status', ['pending', 'processing'])
      .maybeSingle()

    if (checkError) {
      return { success: false, error: checkError }
    }

    if (existing) {
      return { success: true, alreadyExists: true }
    }

    // 5. 插入队列，状态为 pending
    const { error: insertError } = await supabase
      .from('seo_url_push_queue')
      .insert({
        url,
        type,
        source_id: sourceId || null,
        status: 'pending',
        attempts: 0,
        max_attempts: 5
      })

    if (insertError) {
      if (insertError.code === '23505') {
        return { success: true, alreadyExists: true }
      }
      return { success: false, error: insertError }
    }

    return { success: true }
  } catch (error: any) {
    // 异常情况下仅返回错误对象，不抛出致命异常
    return { success: false, error: error || new Error('Unknown enqueue error') }
  }
}

/**
 * 消费并处理百度 URL 推送队列任务
 */
export async function processSeoPushQueue(): Promise<ProcessResult> {
  const supabase = createAdminSupabaseClient()
  
  let processedCount = 0
  let successCount = 0
  let failedCount = 0

  try {
    // 1. 重置超时卡死的 processing 任务 (updated_at 超过 15 分钟的记录视为卡死)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    
    const { data: staleTasks, error: staleQueryError } = await supabase
      .from('seo_url_push_queue')
      .select('id')
      .eq('status', 'processing')
      .lt('updated_at', fifteenMinutesAgo)

    if (staleQueryError) {
      console.error('查询卡死 processing 任务出错:', staleQueryError)
    }

    if (staleTasks && staleTasks.length > 0) {
      const staleIds = staleTasks.map(t => t.id)
      const { error: resetError } = await supabase
        .from('seo_url_push_queue')
        .update({ status: 'pending' })
        .in('id', staleIds)
      
      if (resetError) {
        console.error('重置卡死 processing 任务出错:', resetError)
      } else {
        console.log(`成功重置了 ${staleIds.length} 个卡死的 processing 任务为 pending`)
      }
    }

    // 2. 查询待处理记录 (每次最多 20 条)
    // 优先加载 status = 'pending'
    const { data: pendingRecords, error: pendingError } = await supabase
      .from('seo_url_push_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(20)

    if (pendingError) {
      console.error('查询 pending 任务出错:', pendingError)
    }

    let recordsToProcess = [...(pendingRecords || [])]

    // 如果 pending 数量不足 20 条，则查询 status = 'failed' 的记录并在内存中过滤出 attempts < max_attempts 的记录
    if (recordsToProcess.length < 20) {
      const neededCount = 20 - recordsToProcess.length
      const { data: failedRecords, error: failedError } = await supabase
        .from('seo_url_push_queue')
        .select('*')
        .eq('status', 'failed')
        .order('updated_at', { ascending: true })
        .limit(500) // 多拉取部分，以确保过滤后能补足数量

      if (failedError) {
        console.error('查询 failed 任务出错:', failedError)
      }

      if (failedRecords && failedRecords.length > 0) {
        const filteredFailed = failedRecords
          .filter(r => r.attempts < r.max_attempts)
          .slice(0, neededCount)

        recordsToProcess = recordsToProcess.concat(filteredFailed)
      }
    }

    if (recordsToProcess.length === 0) {
      return { processed: 0, successCount: 0, failedCount: 0 }
    }

    processedCount = recordsToProcess.length
    const recordIds = recordsToProcess.map(r => r.id)

    // 3. 将本批记录的状态更新为 processing
    const { error: updateProcessingError } = await supabase
      .from('seo_url_push_queue')
      .update({ status: 'processing' })
      .in('id', recordIds)

    if (updateProcessingError) {
      console.error('更新记录为 processing 状态出错:', updateProcessingError)
      return { processed: 0, successCount: 0, failedCount: processedCount }
    }

    // 4. 调用 pushUrlsToBaidu 进行批量提交
    const urls = recordsToProcess.map(r => r.url)
    const pushResult = await pushUrlsToBaidu(urls)

    if (pushResult.success) {
      // 成功：批量更新状态为 success，记录推送结果和时间
      const { error: successUpdateError } = await supabase
        .from('seo_url_push_queue')
        .update({
          status: 'success',
          response_body: pushResult.data || null,
          pushed_at: new Date().toISOString()
        })
        .in('id', recordIds)

      if (successUpdateError) {
        console.error('批量更新记录为 success 状态出错:', successUpdateError)
        failedCount = processedCount
      } else {
        successCount = processedCount
      }
    } else {
      // 失败：逐个处理重试和次数更新，防止单条失败更新干扰全局
      const errorMsg = pushResult.error || '百度推送接口返回失败'
      const responseData = pushResult.data || null

      for (const record of recordsToProcess) {
        try {
          const nextAttempts = record.attempts + 1
          const isFinalFailed = nextAttempts >= record.max_attempts
          const newStatus = isFinalFailed ? 'failed' : 'pending'

          const { error: itemUpdateError } = await supabase
            .from('seo_url_push_queue')
            .update({
              status: newStatus,
              attempts: nextAttempts,
              last_error: errorMsg,
              response_body: responseData
            })
            .eq('id', record.id)

          if (itemUpdateError) {
            console.error(`更新任务 ${record.id} 状态出错:`, itemUpdateError)
          }
        } catch (e: any) {
          console.error(`更新任务 ${record.id} 状态时发生异常:`, e)
        }
      }
      failedCount = processedCount
    }
  } catch (error: any) {
    console.error('消费推送队列发生异常:', error)
  }

  return {
    processed: processedCount,
    successCount,
    failedCount
  }
}
