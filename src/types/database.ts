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