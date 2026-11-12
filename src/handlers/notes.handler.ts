import type { Context } from 'hono'
import { NotesService, NoteNotFoundError } from '../services/notes.service.js'
import type { CreateNoteInput, UpdateNoteInput } from '../types/notes.js'

function notFound(c: Context, id: string) {
  return c.json({ error: `Note not found: ${id}` }, 404)
}

function missingId(c: Context) {
  return c.json({ error: 'id is required' }, 400)
}

export function listNotes(service: NotesService) {
  return async (c: Context) => {
    const notes = service.listNotes()
    return c.json(notes, 200)
  }
}

export function createNote(service: NotesService) {
  return async (c: Context) => {
    const body = await c.req.json<CreateNoteInput>()
    if (!body.title || typeof body.title !== 'string') {
      return c.json({ error: 'title is required' }, 400)
    }
    const note = service.createNote(body)
    return c.json(note, 201)
  }
}

export function getNote(service: NotesService) {
  return async (c: Context) => {
    const id = c.req.param('id')
    if (!id) return missingId(c)
    try {
      return c.json(service.getNoteById(id), 200)
    } catch (err) {
      if (err instanceof NoteNotFoundError) return notFound(c, id)
      throw err
    }
  }
}

export function updateNote(service: NotesService) {
  return async (c: Context) => {
    const id = c.req.param('id')
    if (!id) return missingId(c)
    const body = await c.req.json<UpdateNoteInput>()
    try {
      return c.json(service.updateNote(id, body), 200)
    } catch (err) {
      if (err instanceof NoteNotFoundError) return notFound(c, id)
      throw err
    }
  }
}

export function deleteNote(service: NotesService) {
  return async (c: Context) => {
    const id = c.req.param('id')
    if (!id) return missingId(c)
    try {
      service.deleteNote(id)
      return c.body(null, 204)
    } catch (err) {
      if (err instanceof NoteNotFoundError) return notFound(c, id)
      throw err
    }
  }
}
