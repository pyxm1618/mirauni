import { academyArticles, academyCategories } from '../data/academy-content'

const expectedCategories = ['stories', 'business', 'opportunities', 'build', 'growth', 'operations']
const bannedPhrases = [
  '在当今',
  '随着科技的发展',
  '随着人工智能的发展',
  '值得一提的是',
  '综上所述',
  '总而言之',
  '无论你是',
  '赋能独立开发者',
  '助力独立开发者',
  '本文将带你',
  '让我们一起',
]

const errors: string[] = []

const categoryIds = academyCategories.map((category) => category.id)
if (JSON.stringify(categoryIds) !== JSON.stringify(expectedCategories)) {
  errors.push(`学院栏目必须固定为 ${expectedCategories.join(', ')}，当前为 ${categoryIds.join(', ')}`)
}

if (academyArticles.length !== 30) {
  errors.push(`首批学院文章必须为 30 篇，当前为 ${academyArticles.length} 篇`)
}

const slugSet = new Set<string>()
const categoryCounts = new Map<string, number>()

for (const article of academyArticles) {
  if (slugSet.has(article.slug)) errors.push(`重复 slug: ${article.slug}`)
  slugSet.add(article.slug)

  if (!expectedCategories.includes(article.category)) {
    errors.push(`${article.slug}: 非法栏目 ${article.category}`)
  }
  categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1)

  if (article.title.trim().length < 8 || article.title.trim().length > 36) {
    errors.push(`${article.slug}: 标题长度应为 8-36 字`)
  }
  if (article.summary.trim().length < 35 || article.summary.trim().length > 180) {
    errors.push(`${article.slug}: 摘要长度应为 35-180 字`)
  }
  if (article.content.trim().length < 900) {
    errors.push(`${article.slug}: 正文少于 900 字，不能作为正式学院文章发布`)
  }
  if (!article.sources?.length) {
    errors.push(`${article.slug}: 缺少事实来源`)
  }
  if (['stories', 'business'].includes(article.category) && article.sources.length < 2) {
    errors.push(`${article.slug}: 故事/商业拆解至少需要 2 个来源`)
  }
  for (const source of article.sources || []) {
    if (!source.url.startsWith('https://')) errors.push(`${article.slug}: 来源必须使用 HTTPS: ${source.url}`)
    if (!source.label.trim()) errors.push(`${article.slug}: 来源缺少可读名称`)
  }

  for (const phrase of bannedPhrases) {
    if (`${article.title}\n${article.summary}\n${article.content}`.includes(phrase)) {
      errors.push(`${article.slug}: 命中 AI 套话“${phrase}”`)
    }
  }
}

for (const category of expectedCategories) {
  const count = categoryCounts.get(category) || 0
  if (count < 4) errors.push(`${category}: 至少需要 4 篇文章，当前 ${count} 篇`)
}

const featured = academyArticles.filter((article) => article.featured)
if (featured.length < 3 || featured.length > 6) {
  errors.push(`首页精选应保持 3-6 篇，当前 ${featured.length} 篇`)
}

if (errors.length) {
  console.error('Academy content validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`Academy content validation passed: ${academyArticles.length} articles across ${academyCategories.length} categories.`)
