import { Hono } from 'hono'
import { NotesService } from '../services/notes.service.js'
import * as h from '../handlers/tags.handler.js'

export function tagsRoutes(service: NotesService): Hono {
  const router = new Hono()
  router.delete('/:name', h.deleteTag(service))
  return router
}
