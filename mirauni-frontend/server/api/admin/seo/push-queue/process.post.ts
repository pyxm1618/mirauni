import { requireAdmin } from '~/server/utils/admin-auth'
import { processSeoPushQueue } from '~/server/utils/seo-push-queue'

export default defineEventHandler(async (event) => {
  // 1. 鉴权：仅管理员允许访问，客户端未登录或非 admin 访问返回 401/403
  await requireAdmin(event)

  // 2. 调用处理队列方法
  const result = await processSeoPushQueue()

  // 3. 返回本次处理统计结果
  return {
    success: true,
    data: {
      processed: result.processed,
      success: result.successCount,
      failed: result.failedCount
    }
  }
})
