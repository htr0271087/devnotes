import { serve } from '@hono/node-server'
import { createDatabase } from './db/client.js'
import { NotesRepository } from './repositories/notes.repository.js'
import { NotesService } from './services/notes.service.js'
import { createApp } from './app.js'

const db = createDatabase()
const repo = new NotesRepository(db)
const service = new NotesService(repo)
const app = createApp(service)

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('DevNotes API listening on http://localhost:3000')
})
