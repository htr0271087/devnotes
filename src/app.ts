import { Hono } from 'hono'
import { NotesService } from './services/notes.service.js'
import { notesRoutes } from './routes/notes.routes.js'

export function createApp(service: NotesService): Hono {
  const app = new Hono()
  app.route('/api/notes', notesRoutes(service))
  return app
}
