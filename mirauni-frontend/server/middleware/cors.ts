// CORS 中间件
// 允许 admin.mirauni.com 跨域访问 /api/admin/* 接口

export default defineEventHandler((event) => {
    const origin = getHeader(event, 'origin') || ''
    const path = event.path || ''

    // 仅对 /api/admin 路径应用 CORS
    if (path.startsWith('/api/admin')) {
        // 允许的来源
        const allowedOrigins = [
            'https://admin.mirauni.com',
            'http://localhost:3001', // 本地开发
            'http://localhost:5173', // Vite 默认端口
        ]

        if (allowedOrigins.includes(origin)) {
            setResponseHeader(event, 'Access-Control-Allow-Origin', origin)
        }

        setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        setResponseHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
        setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true')
        setResponseHeader(event, 'Access-Control-Max-Age', '86400')

        // 处理 OPTIONS 预检请求
        if (event.method === 'OPTIONS') {
            event.node.res.statusCode = 204
            event.node.res.end()
            return
        }
    }
})
