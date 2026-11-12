import type { Database } from 'better-sqlite3'
import type { NoteRow, TagRow } from '../db/types.js'

export class NotesRepository {
  constructor(private db: Database) {}

  insertNote(row: NoteRow): void {
    this.db
      .prepare(
        `INSERT INTO notes (id, title, content, language, created_at, updated_at)
         VALUES (@id, @title, @content, @language, @created_at, @updated_at)`
      )
      .run(row)
  }

  findNoteById(id: string): NoteRow | undefined {
    return this.db
      .prepare(`SELECT * FROM notes WHERE id = ?`)
      .get(id) as NoteRow | undefined
  }

  findAllNotes(): NoteRow[] {
    return this.db.prepare(`SELECT * FROM notes ORDER BY created_at DESC`).all() as NoteRow[]
  }

  searchNotesByTitle(term: string): NoteRow[] {
    const escaped = term.replace(/[\\%_]/g, (ch) => `\\${ch}`)
    return this.db
      .prepare(
        `SELECT * FROM notes WHERE title LIKE ? ESCAPE '\\' ORDER BY created_at DESC`
      )
      .all(`%${escaped}%`) as NoteRow[]
  }

  updateNote(id: string, fields: Partial<Omit<NoteRow, 'id' | 'created_at'>>): void {
    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')
    this.db.prepare(`UPDATE notes SET ${sets} WHERE id = @id`).run({ ...fields, id })
  }

  deleteNote(id: string): number {
    const result = this.db.prepare(`DELETE FROM notes WHERE id = ?`).run(id)
    return result.changes
  }

  // Inserts tag if not present, then returns it.
  upsertTag(name: string): TagRow {
    const id = crypto.randomUUID()
    this.db
      .prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`)
      .run(id, name)
    return this.db.prepare(`SELECT * FROM tags WHERE name = ?`).get(name) as TagRow
  }

  // note_tags rows are removed by ON DELETE CASCADE.
  deleteTagById(id: string): number {
    const result = this.db.prepare(`DELETE FROM tags WHERE id = ?`).run(id)
    return result.changes
  }

  setNoteTags(noteId: string, tagIds: string[]): void {
    this.db.prepare(`DELETE FROM note_tags WHERE note_id = ?`).run(noteId)
    const insert = this.db.prepare(
      `INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)`
    )
    for (const tagId of tagIds) {
      insert.run(noteId, tagId)
    }
  }

  getTagsForNote(noteId: string): TagRow[] {
    return this.db
      .prepare(
        `SELECT t.id, t.name FROM tags t
         JOIN note_tags nt ON nt.tag_id = t.id
         WHERE nt.note_id = ?`
      )
      .all(noteId) as TagRow[]
  }

  getTagsForNotes(noteIds: string[]): Map<string, TagRow[]> {
    const result = new Map<string, TagRow[]>()
    if (noteIds.length === 0) return result

    const placeholders = noteIds.map(() => '?').join(', ')
    const rows = this.db
      .prepare(
        `SELECT nt.note_id, t.id, t.name FROM tags t
         JOIN note_tags nt ON nt.tag_id = t.id
         WHERE nt.note_id IN (${placeholders})`
      )
      .all(...noteIds) as (TagRow & { note_id: string })[]

    for (const row of rows) {
      const list = result.get(row.note_id) ?? []
      list.push({ id: row.id, name: row.name })
      result.set(row.note_id, list)
    }
    return result
  }
}
