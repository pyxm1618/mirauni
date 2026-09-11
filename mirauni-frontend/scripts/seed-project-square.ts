import { createClient } from '@supabase/supabase-js'
import { CURATED_PROJECTS } from '../data/project-square/curated-projects'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const platformUserId = process.env.PROJECT_SQUARE_PLATFORM_USER_ID

if (!supabaseUrl || !serviceRoleKey || !platformUserId) {
  throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and PROJECT_SQUARE_PLATFORM_USER_ID are required')
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const quickIChing = {
  id: 'd9e2b8f1-0c61-4a5d-8d65-3c79f6a20000',
  user_id: platformUserId,
  title: 'Quick I Ching',
  summary: '提供三枚硬币、蓍草、梅花易数和手动起卦的在线 I Ching 产品，并把卦象结构与基础解读做成无需登录即可使用的公开工具。',
  category: 'app',
  industry: 'culture_education',
  listing_type: 'owner',
  is_recruiting: false,
  roles_needed: [],
  skills_required: [],
  work_mode: null,
  cooperation_type: null,
  description: 'Quick I Ching 当前公开版本以免费起卦与 I Ching 知识内容为核心。用户可以使用三枚硬币、蓍草、梅花易数当前时间起卦或手动起卦；完成六爻后会得到本卦编号与名称、变爻位置，以及存在动爻时的之卦，并配有原创的基础解读和明确的非确定性、非专业建议边界。完成的阅读可以主动保存到浏览器本地历史。站点同时提供如何提问、变爻、本卦与之卦关系等指南，以及 64 卦资料页。当前免费流程不要求登录、支付、数据库或生产 AI 调用。',
  description_visible: true,
  background: null,
  background_visible: false,
  vision: null,
  vision_visible: false,
  team_info: null,
  team_visible: false,
  demo_url: 'https://www.quickiching.com',
  demo_visible: true,
  source_repo: null,
  source_url: null,
  curated_meta: {},
  curation_rank: null,
  status: 'active'
}

const curatedRows = CURATED_PROJECTS.map(project => ({
  ...project,
  user_id: platformUserId,
  description_visible: true,
  background: null,
  background_visible: false,
  vision: null,
  vision_visible: false,
  team_info: null,
  team_visible: false,
  demo_visible: true,
  status: 'active'
}))

const rows = [quickIChing, ...curatedRows]

const { error } = await client
  .from('mirauni_projects')
  .upsert(rows, { onConflict: 'id' })

if (error) throw error

const { count, error: countError } = await client
  .from('mirauni_projects')
  .select('id', { count: 'exact', head: true })
  .in('id', rows.map(row => row.id))
  .eq('status', 'active')

if (countError) throw countError
if (count !== 20) throw new Error(`expected 20 seeded active projects, got ${count}`)

console.log('Project Square seed complete: 20 active projects.')
