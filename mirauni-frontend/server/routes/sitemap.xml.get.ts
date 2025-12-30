import { serverSupabaseClient } from '#supabase/server'

interface SitemapUrl {
    loc: string
    lastmod?: string
    priority: string
    changefreq: string
}

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://mirauni.com'

    // 并行获取所有数据
    const [projectsRes, developersRes, articlesRes] = await Promise.all([
        supabase.from('projects').select('id, updated_at').eq('status', 'active'),
        supabase.from('users').select('id, updated_at').not('username', 'is', null),
        supabase.from('articles').select('slug, updated_at').eq('status', 'published')
    ])

    const projects = projectsRes.data || []
    const developers = developersRes.data || []
    const articles = articlesRes.data || []

    // 构建 URL 列表
    const urls: SitemapUrl[] = [
        // 静态页面
        { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${siteUrl}/projects`, priority: '0.9', changefreq: 'daily' },
        { loc: `${siteUrl}/developers`, priority: '0.8', changefreq: 'daily' },
        { loc: `${siteUrl}/academy`, priority: '0.8', changefreq: 'weekly' },

        // 动态项目页面
        ...projects.map(p => ({
            loc: `${siteUrl}/projects/detail/${p.id}`,
            lastmod: p.updated_at?.split('T')[0],
            priority: '0.7',
            changefreq: 'weekly'
        })),

        // 开发者主页
        ...developers.map(d => ({
            loc: `${siteUrl}/developers/${d.id}`,
            lastmod: d.updated_at?.split('T')[0],
            priority: '0.6',
            changefreq: 'weekly'
        })),

        // 学院文章
        ...articles.map(a => ({
            loc: `${siteUrl}/academy/${a.slug}`,
            lastmod: a.updated_at?.split('T')[0],
            priority: '0.7',
            changefreq: 'monthly'
        }))
    ]

    // 生成 XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
  </url>`).join('\n')}
</urlset>`

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return xml
})
