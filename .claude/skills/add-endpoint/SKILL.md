---
name: add-endpoint
description: Use when adding a new REST endpoint to the DevNotes API (notes, snippets, or tags routes).
---

# Add a new endpoint

Follow these steps in order. Project conventions from CLAUDE.md apply throughout.
Copy the existing notes code as the pattern:

- Handler: `src/handlers/notes.handler.ts`
- Service: `src/services/notes.service.ts`
- Route registration: `src/routes/notes.routes.ts`
- Integration test: `tests/notes.integration.test.ts`

## 1. Add the route and handler
- Add a handler in `notes.handler.ts` style: a factory taking the service and
  returning `async (c: Context) => ...`, with the shared `notFound`/`missingId` helpers.
- Register it in `notes.routes.ts`. Register static paths (e.g. `/search`) before `/:id`.
- Keep the handler thin: parse input, call a service, return the response.
- Put business logic in a `NotesService` method (see `listNotes`, `getNoteById`); SQL goes
  in the repository.
- Map `NoteNotFoundError` to a 404 in the handler, as `getNote` does.
- Internal imports must use the `.js` extension (NodeNext), e.g. `import { x } from "./x.js"`.

## 2. Validate input
- Validate every route param (e.g. `:id`) and query param before use; return a 400 on bad input.
- Validate the request body (types, required fields, tag format) for POST/PUT/PATCH,
  as `createNote` does for `title`.
- Never use the non-null assertion (`!`); narrow types or handle the missing case explicitly.

## 3. Add an integration test
- Add a `describe('METHOD /api/...')` block in `tests/notes.integration.test.ts`,
  using `app.request(...)` against the `createApp` instance built in `beforeEach`.
- Cover the success path, invalid params/body (400), and not-found (404) where relevant.

## 4. Verify
- Run `npx tsc --noEmit` and fix all type errors.
- Run `npm test` and make sure everything passes.
- The endpoint is done only when both succeed.
