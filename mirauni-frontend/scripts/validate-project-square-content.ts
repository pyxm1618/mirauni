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

console.log(`Project Square validation passed: ${CURATED_PROJECTS.length} curated projects + recruitment contract.`)
