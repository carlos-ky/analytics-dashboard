export interface Article {
  id: string
  user_id: string
  title: string
  slug: string | null
  content: string | null
  excerpt: string | null
  status: 'draft' | 'published'
  cover_image: string | null
  created_at: string
  updated_at: string
}

export type ArticleInput = {
  title: string
  content: string
  excerpt?: string
  status: 'draft' | 'published'
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  tech_stack: string[] | null
  project_url: string | null
  github_url: string | null
  cover_image: string | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export type ProjectInput = {
  title: string
  description: string
  tech_stack: string[]
  project_url: string
  github_url: string
  status: 'draft' | 'published'
}

export interface Message {
  id: string
  user_id: string
  sender_name: string
  sender_email: string
  subject: string | null
  message: string
  read: boolean
  created_at: string
}