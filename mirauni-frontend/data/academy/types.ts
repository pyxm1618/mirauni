export type AcademyCategoryId = 'stories' | 'business' | 'opportunities' | 'build' | 'growth' | 'operations'

export interface AcademySource {
  label: string
  url: string
  note?: string
}

export interface AcademyArticle {
  id: string
  slug: string
  title: string
  summary: string
  category: AcademyCategoryId
  series: string
  featured?: boolean
  content: string
  sources: AcademySource[]
  created_at: string
  updated_at: string
  view_count: number
  cover_url?: string
  author: {
    username: string
    avatar_url?: string
  }
}

export interface AcademyCategory {
  id: AcademyCategoryId
  label: string
  eyebrow: string
  description: string
}
