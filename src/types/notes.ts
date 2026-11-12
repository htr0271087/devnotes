export interface Note {
  id: string
  title: string
  content: string
  language: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateNoteInput {
  title: string
  content?: string
  language?: string | null
  tags?: string[]
}

export interface UpdateNoteInput {
  title?: string
  content?: string
  language?: string | null
  tags?: string[]
}
