import type { NotesRepository } from '../repositories/notes.repository.js'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types/notes.js'

export class NoteNotFoundError extends Error {
  constructor(id: string) {
    super(`Note not found: ${id}`)
    this.name = 'NoteNotFoundError'
  }
}

export class TagNotFoundError extends Error {
  constructor(id: string) {
    super(`Tag not found: ${id}`)
    this.name = 'TagNotFoundError'
  }
}

export class NotesService {
  constructor(private repo: NotesRepository) {}

  createNote(input: CreateNoteInput): Note {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    this.repo.insertNote({
      id,
      title: input.title,
      content: input.content ?? '',
      language: input.language ?? null,
      created_at: now,
      updated_at: now,
    })

    const tagNames = input.tags ?? []
    const tagIds = tagNames.map((name) => this.repo.upsertTag(name).id)
    this.repo.setNoteTags(id, tagIds)

    return {
      id,
      title: input.title,
      content: input.content ?? '',
      language: input.language ?? null,
      tags: tagNames,
      createdAt: now,
      updatedAt: now,
    }
  }

  getNoteById(id: string): Note {
    const row = this.repo.findNoteById(id)
    if (!row) throw new NoteNotFoundError(id)

    const tags = this.repo.getTagsForNote(id).map((t) => t.name)
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      language: row.language,
      tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  listNotes(): Note[] {
    const rows = this.repo.findAllNotes()
    if (rows.length === 0) return []

    const tagMap = this.repo.getTagsForNotes(rows.map((r) => r.id))
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      language: row.language,
      tags: (tagMap.get(row.id) ?? []).map((t) => t.name),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  searchNotes(term: string): Note[] {
    const rows = this.repo.searchNotesByTitle(term)
    if (rows.length === 0) return []

    const tagMap = this.repo.getTagsForNotes(rows.map((r) => r.id))
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      language: row.language,
      tags: (tagMap.get(row.id) ?? []).map((t) => t.name),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  updateNote(id: string, input: UpdateNoteInput): Note {
    const existing = this.repo.findNoteById(id)
    if (!existing) throw new NoteNotFoundError(id)

    const now = new Date().toISOString()
    const fields: Record<string, unknown> = { updated_at: now }
    if (input.title !== undefined) fields.title = input.title
    if (input.content !== undefined) fields.content = input.content
    if ('language' in input) fields.language = input.language ?? null

    this.repo.updateNote(id, fields)

    if (input.tags !== undefined) {
      const tagIds = input.tags.map((name) => this.repo.upsertTag(name).id)
      this.repo.setNoteTags(id, tagIds)
    }

    return this.getNoteById(id)
  }

  deleteTag(id: string): void {
    const changes = this.repo.deleteTagById(id)
    if (changes === 0) throw new TagNotFoundError(id)
  }

  deleteNote(id: string): void {
    const changes = this.repo.deleteNote(id)
    if (changes === 0) throw new NoteNotFoundError(id)
  }
}
