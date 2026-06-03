import { serverSupabaseClient } from '#supabase/server'
import { SAMPLE_PROJECTS } from '~/server/utils/sample-projects'
import { SAMPLE_ARTICLES } from '~/server/utils/sample-articles'

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
    const [projectsRes, articlesRes] = await Promise.all([
        supabase.from('mirauni_projects').select('id, updated_at').eq('status', 'active'),
        supabase.from('articles').select('slug, updated_at').eq('status', 'published')
    ])

    const projects = projectsRes.data || []
    const articles = articlesRes.data || []
    const articleSlugs = new Set(articles.map(a => a.slug))

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

        // 冷启动样板项目页（无真实项目时也保留可抓取资产）
        ...SAMPLE_PROJECTS.map(p => ({
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

        // 冷启动样板文章页
        ...SAMPLE_ARTICLES.filter(a => !articleSlugs.has(a.slug)).map(a => ({
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
