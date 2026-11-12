import type { Context } from 'hono'
import { NotesService, TagNotFoundError } from '../services/notes.service.js'

export function deleteTag(service: NotesService) {
  return async (c: Context) => {
    const name = c.req.param('name')?.trim()
    if (!name) return c.json({ error: 'name is required' }, 400)
    try {
      service.deleteTag(name)
      return c.body(null, 204)
    } catch (err) {
      if (err instanceof TagNotFoundError) {
        return c.json({ error: `Tag not found: ${name}` }, 404)
      }
      throw err
    }
  }
}
