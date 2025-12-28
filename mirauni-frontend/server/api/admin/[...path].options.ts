/**
 * 通用 OPTIONS 处理器 - 处理所有 /api/admin/* 的 CORS 预检请求
 * 
 * 文件名 [...path].options.ts 会匹配所有 /api/admin/* 路径的 OPTIONS 请求
 */
export default defineEventHandler((event) => {
    const origin = getHeader(event, 'origin') || ''

    // 允许的来源
    const allowedOrigins = [
        'https://admin.mirauni.com',
        'http://localhost:3001',
        'http://localhost:5173',
    ]

    if (allowedOrigins.includes(origin)) {
        setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
    }

    setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setResponseHeader(event, 'Access-Control-Max-Age', '86400')

    // 返回 204 No Content
    event.node.res.statusCode = 204
    return ''
})
