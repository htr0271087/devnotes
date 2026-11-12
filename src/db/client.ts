import Database from 'better-sqlite3'
import { applySchema } from './schema.js'

export function createDatabase(path: string = 'devnotes.db'): Database.Database {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  applySchema(db)
  return db
}
