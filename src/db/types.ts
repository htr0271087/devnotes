export interface NoteRow {
  id: string
  title: string
  content: string
  language: string | null
  created_at: string
  updated_at: string
}

export interface TagRow {
  id: string
  name: string
}

export interface NoteTagRow {
  note_id: string
  tag_id: string
}
