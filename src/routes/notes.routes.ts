import { Hono } from 'hono'
import { NotesService } from '../services/notes.service.js'
import * as h from '../handlers/notes.handler.js'

export function notesRoutes(service: NotesService): Hono {
  const router = new Hono()
  router.get('/', h.listNotes(service))
  router.post('/', h.createNote(service))
  router.get('/:id', h.getNote(service))
  router.patch('/:id', h.updateNote(service))
  router.delete('/:id', h.deleteNote(service))
  return router
}
