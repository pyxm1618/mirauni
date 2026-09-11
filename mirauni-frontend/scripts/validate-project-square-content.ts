import { readFileSync } from 'node:fs'
import { projectSchema } from '../types/index'
import { CURATED_PROJECTS } from '../data/project-square/curated-projects'

const fail = (message: string): never => {
  throw new Error(`[project-square] ${message}`)
}

if (CURATED_PROJECTS.length !== 19) fail(`expected 19 curated projects, got ${CURATED_PROJECTS.length}`)

const ids = new Set<string>()
const repos = new Set<string>()
const urls = new Set<string>()

for (const project of CURATED_PROJECTS) {
  if (project.listing_type !== 'curated') fail(`${project.title}: listing_type must be curated`)
  if (project.is_recruiting !== false) fail(`${project.title}: curated project cannot recruit`)
  if (project.roles_needed.length !== 0) fail(`${project.title}: curated roles_needed must be empty`)
  if (project.work_mode !== null) fail(`${project.title}: curated work_mode must be null`)
  if (project.cooperation_type !== null) fail(`${project.title}: curated cooperation_type must be null`)
  if (!project.industry) fail(`${project.title}: industry is required`)
  if (!project.source_url.startsWith('https://github.com/')) fail(`${project.title}: source_url must be GitHub HTTPS`)
  if (!project.source_repo.includes('/')) fail(`${project.title}: source_repo must be owner/repo`)
  if (!project.description || project.description.length < 120) fail(`${project.title}: description is too short`)
  if (!project.curated_meta.features || project.curated_meta.features.length < 3) fail(`${project.title}: needs at least 3 features`)
  if (!project.curated_meta.editorial_reason || project.curated_meta.editorial_reason.length < 30) fail(`${project.title}: editorial reason is too short`)
  if (ids.has(project.id)) fail(`duplicate id ${project.id}`)
  if (repos.has(project.source_repo)) fail(`duplicate repo ${project.source_repo}`)
  if (urls.has(project.source_url)) fail(`duplicate source URL ${project.source_url}`)
  ids.add(project.id)
  repos.add(project.source_repo)
  urls.add(project.source_url)
}

const horilla = CURATED_PROJECTS.find(project => project.title === 'Horilla HRMS')
if (!horilla || horilla.source_repo !== 'horilla/horilla-hr' || horilla.source_url !== 'https://github.com/horilla/horilla-hr') {
  fail('Horilla source must be the verified horilla/horilla-hr repository')
}

const nonRecruitingOwner = projectSchema.safeParse({
  title: '展示型项目',
  summary: '这是一个仅用于展示、不开放合作招募的真实项目。',
  category: 'saas',
  industry: 'business_services',
  is_recruiting: false,
  roles_needed: [],
  skills_required: [],
  work_mode: null,
  cooperation_type: null,
  description: '',
  demo_url: ''
})
if (!nonRecruitingOwner.success) fail('non-recruiting owner project should pass validation without fake recruiting fields')

const recruitingOwner = projectSchema.safeParse({
  title: '招募型项目',
  summary: '这是一个正在真实招募合作伙伴的项目，需要完整合作信息。',
  category: 'saas',
  industry: 'business_services',
  is_recruiting: true,
  roles_needed: [],
  skills_required: [],
  work_mode: null,
  cooperation_type: null,
  description: '',
  demo_url: ''
})
if (recruitingOwner.success) fail('recruiting owner project must require role/work/cooperation fields')

const files = {
  listApi: readFileSync('server/api/projects/index.get.ts', 'utf8'),
  detailApi: readFileSync('server/api/projects/[id].get.ts', 'utf8'),
  createApi: readFileSync('server/api/projects/index.post.ts', 'utf8'),
  updateApi: readFileSync('server/api/projects/[id].put.ts', 'utf8'),
  card: readFileSync('components/project/ProjectCard.vue', 'utf8'),
  indexPage: readFileSync('pages/projects/index.vue', 'utf8'),
  detailPage: readFileSync('pages/projects/[id]/index.vue', 'utf8')
}

if (!files.listApi.includes('query.listing_type') || !files.listApi.includes('query.industry')) fail('list API must support listing_type and industry filters')
if (!files.listApi.includes(".eq('is_recruiting', true)")) fail('role filter must be limited to recruiting projects')
if (!files.detailApi.includes("project.listing_type === 'curated'")) fail('detail API must short-circuit curated projects before contact unlock logic')
if (!files.createApi.includes("listing_type: 'owner'")) fail('create API must force owner listing type')
if (!files.updateApi.includes("listing_type: 'owner'")) fail('update API must force owner listing type')
if (files.card.includes('ID:{{') || files.card.includes("project.id.toString().slice")) fail('project card must not expose UUID labels')
if (!files.card.includes('平台精选')) fail('project card must visibly distinguish curated projects')
if (!files.indexPage.includes('filters.listing_type') || !files.indexPage.includes('filters.industry')) fail('project index must expose listing type and industry filters')
if (!files.detailPage.includes('CuratedProjectDetail')) fail('detail page must use CuratedProjectDetail')
if (files.detailPage.includes('MinimalistTheme') || files.detailPage.includes('CyberTheme')) fail('project detail must not randomly switch among legacy themes')
if (!files.detailPage.includes("project.value?.listing_type === 'owner' && project.value?.is_recruiting")) fail('JobPosting/unlock behavior must be conditioned on recruiting owner projects')

console.log(`Project Square validation passed: ${CURATED_PROJECTS.length} curated projects + recruitment/API/UI contract.`)
