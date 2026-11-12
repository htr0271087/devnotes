import type { Context } from 'hono'
import { NotesService, TagNotFoundError } from '../services/notes.service.js'

export function deleteTag(service: NotesService) {
  return async (c: Context) => {
    const id = c.req.param('id')?.trim()
    if (!id) return c.json({ error: 'id is required' }, 400)
    try {
      service.deleteTag(id)
      return c.body(null, 204)
    } catch (err) {
      if (err instanceof TagNotFoundError) {
        return c.json({ error: `Tag not found: ${id}` }, 404)
      }
      throw err
    }
  }
}
