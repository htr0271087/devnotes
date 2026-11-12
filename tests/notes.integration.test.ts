import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase } from '../src/db/client.js'
import { NotesRepository } from '../src/repositories/notes.repository.js'
import { NotesService } from '../src/services/notes.service.js'
import { createApp } from '../src/app.js'
import type { Hono } from 'hono'

let app: Hono

beforeEach(() => {
  const db = createDatabase(':memory:')
  const repo = new NotesRepository(db)
  const service = new NotesService(repo)
  app = createApp(service)
})

describe('POST /api/notes', () => {
  it('creates a note and returns 201', async () => {
    const res = await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Hello', content: 'World', tags: ['ts', 'hono'] }),
    })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.title).toBe('Hello')
    expect(body.content).toBe('World')
    expect(body.tags).toEqual(['ts', 'hono'])
    expect(body.id).toBeDefined()
    expect(body.createdAt).toBeDefined()
  })

  it('returns 400 when title is missing', async () => {
    const res = await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'no title here' }),
    })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/notes', () => {
  it('returns empty array when no notes exist', async () => {
    const res = await app.request('/api/notes')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('returns all created notes', async () => {
    await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Note A', tags: ['a'] }),
    })
    await app.request('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Note B', tags: ['b'] }),
    })
    const res = await app.request('/api/notes')
    const notes = await res.json()
    expect(notes).toHaveLength(2)
  })
})

describe('GET /api/notes/:id', () => {
  it('returns the note by id', async () => {
    const created = await (
      await app.request('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Find me', language: 'typescript' }),
      })
    ).json()

    const res = await app.request(`/api/notes/${created.id}`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(created.id)
    expect(body.language).toBe('typescript')
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.request('/api/notes/does-not-exist')
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/notes/:id', () => {
  it('updates fields and returns updated note', async () => {
    const created = await (
      await app.request('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Original', tags: ['old'] }),
      })
    ).json()

    const res = await app.request(`/api/notes/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated', tags: ['new'] }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe('Updated')
    expect(body.tags).toEqual(['new'])
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.request('/api/notes/ghost', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'x' }),
    })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/notes/:id', () => {
  it('deletes a note and returns 204', async () => {
    const created = await (
      await app.request('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Bye' }),
      })
    ).json()

    const del = await app.request(`/api/notes/${created.id}`, { method: 'DELETE' })
    expect(del.status).toBe(204)

    const get = await app.request(`/api/notes/${created.id}`)
    expect(get.status).toBe(404)
  })

  it('returns 404 for unknown id', async () => {
    const res = await app.request('/api/notes/ghost', { method: 'DELETE' })
    expect(res.status).toBe(404)
  })
})
