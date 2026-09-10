import type { AcademyArticle, AcademyCategory } from './academy/types'
import { academyStoryArticles } from './academy/stories'
import { academyBusinessArticles } from './academy/business'
import { academyOpportunityArticles } from './academy/opportunities'
import { academyBuildArticles } from './academy/build'
import { academyGrowthArticles } from './academy/growth'
import { academyOperationsArticles } from './academy/operations'

export const academyCategories: AcademyCategory[] = [
  {
    id: 'stories',
    label: '独立开发故事',
    eyebrow: 'PEOPLE',
    description: '真实的人、转折和选择。成功不是唯一结果，慢增长、转型和长期坚持也值得拆开看。',
  },
  {
    id: 'business',
    label: '小生意拆解',
    eyebrow: 'BUSINESS',
    description: '不只看收入数字。拆需求、分发、收费、成本和难点，再判断这种生意今天还能不能做。',
  },
  {
    id: 'opportunities',
    label: '机会雷达',
    eyebrow: 'SIGNALS',
    description: '从搜索、平台、规则变化和真实工作流里找机会，不追逐没有落点的风口。',
  },
  {
    id: 'build',
    label: '从 0 到 1',
    eyebrow: 'BUILD',
    description: '把想法变成能工作的产品：MVP、AI Coding、支付、部署和上线验收。',
  },
  {
    id: 'growth',
    label: '增长实验室',
    eyebrow: 'GROWTH',
    description: '产品做出来以后，怎么被找到：SEO、外链、社区发布和第一批用户。',
  },
  {
    id: 'operations',
    label: '经营手册',
    eyebrow: 'OPERATE',
    description: '开始长期经营以后必须面对的事：隐私、条款、账号生命周期、订阅和数据责任。',
  },
]

export const academyArticles: AcademyArticle[] = [
  ...academyStoryArticles,
  ...academyBusinessArticles,
  ...academyOpportunityArticles,
  ...academyBuildArticles,
  ...academyGrowthArticles,
  ...academyOperationsArticles,
]

export const academyCategoryMap = Object.fromEntries(
  academyCategories.map((category) => [category.id, category]),
) as Record<AcademyArticle['category'], AcademyCategory>

export const getAcademyArticleBySlug = (slug: string) =>
  academyArticles.find((article) => article.slug === slug)
