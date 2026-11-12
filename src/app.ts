import { Hono } from 'hono'
import { NotesService } from './services/notes.service.js'
import { notesRoutes } from './routes/notes.routes.js'
import { tagsRoutes } from './routes/tags.routes.js'

export function createApp(service: NotesService): Hono {
  const app = new Hono()
  app.route('/api/notes', notesRoutes(service))
  app.route('/api/tags', tagsRoutes(service))
  return app
}
