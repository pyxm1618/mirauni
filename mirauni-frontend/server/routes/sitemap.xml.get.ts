import { serverSupabaseClient } from '#supabase/server'

interface SitemapUrl {
    loc: string
    lastmod?: string
    priority: string
    changefreq: string
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://mirauni.com'

    // 使用 Promise.allSettled 容错并行拉取所有动态数据
    const [projectsRes, articlesRes, developersRes] = await Promise.allSettled([
        supabase.from('mirauni_projects').select('id, updated_at').eq('status', 'active'),
        supabase.from('articles').select('slug, updated_at').eq('status', 'published'),
        supabase.from('public_profiles').select('id, username, created_at')
    ])

    // 处理项目的拉取结果
    let projects: any[] = []
    if (projectsRes.status === 'fulfilled') {
        const val = projectsRes.value
        if (val.error) {
            console.warn('Failed to fetch projects for sitemap:', val.error)
        } else {
            projects = val.data || []
        }
    } else {
        console.warn('Failed to fetch projects for sitemap:', projectsRes.reason)
    }

    // 处理文章的拉取结果
    let articles: any[] = []
    if (articlesRes.status === 'fulfilled') {
        const val = articlesRes.value
        if (val.error) {
            console.warn('Failed to fetch articles for sitemap:', val.error)
        } else {
            articles = val.data || []
        }
    } else {
        console.warn('Failed to fetch articles for sitemap:', articlesRes.reason)
    }

    // 处理开发者的拉取结果
    let developers: any[] = []
    if (developersRes.status === 'fulfilled') {
        const val = developersRes.value
        if (val.error) {
            console.warn('Failed to fetch developers for sitemap:', val.error)
        } else {
            developers = val.data || []
        }
    } else {
        console.warn('Failed to fetch developers for sitemap:', developersRes.reason)
    }

    // 构建 URL 列表
    const urls: SitemapUrl[] = [
        // 静态页面
        { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${siteUrl}/projects`, priority: '0.9', changefreq: 'daily' },
        { loc: `${siteUrl}/developers`, priority: '0.8', changefreq: 'daily' },
        { loc: `${siteUrl}/academy`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${siteUrl}/about`, priority: '0.3', changefreq: 'monthly' },
        { loc: `${siteUrl}/contact`, priority: '0.3', changefreq: 'monthly' },
        { loc: `${siteUrl}/privacy`, priority: '0.2', changefreq: 'monthly' },
        { loc: `${siteUrl}/terms`, priority: '0.2', changefreq: 'monthly' },

        // 动态项目页面
        ...projects.map(p => ({
            loc: `${siteUrl}/projects/${p.id}`,
            lastmod: p.updated_at?.split('T')[0],
            priority: '0.7',
            changefreq: 'weekly'
        })),

        // 学院文章
        ...articles.map(a => ({
            loc: `${siteUrl}/academy/${a.slug}`,
            lastmod: a.updated_at?.split('T')[0],
            priority: '0.7',
            changefreq: 'monthly'
        })),

        // 动态公开开发者主页
        ...developers
            .filter(d => d.id && d.username) // 过滤掉没有 id 或 username 的不完整/异常数据
            .map(d => ({
                loc: `${siteUrl}/developers/${d.id}`,
                lastmod: d.created_at?.split('T')[0],
                priority: '0.7',
                changefreq: 'weekly'
            }))
    ]

    // 生成 XML，对字段内容进行 XML 转义
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${escapeXml(u.lastmod)}</lastmod>` : ''}
    ${u.priority ? `<priority>${escapeXml(u.priority)}</priority>` : ''}
    ${u.changefreq ? `<changefreq>${escapeXml(u.changefreq)}</changefreq>` : ''}
  </url>`).join('\n')}
</urlset>`

    setResponseHeader(event, 'Content-Type', 'application/xml')
    return xml
})
