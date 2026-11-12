# DevNotes

REST API for notes and code snippets with tags.

## Commands
- Dev server: npm run dev
- Tests: npm test
- Type check: npx tsc --noEmit

## Conventions
- Internal imports use the .js extension (NodeNext).
- Handlers stay thin; logic lives in services.
- Every new endpoint needs an integration test in tests/.
- Validate route params; never use the non-null assertion (!).

## Done means
- tsc has no errors and npm test passes.