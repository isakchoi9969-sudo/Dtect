---
name: dtect-project
description: Work on the D:TECT multi-service project when changing its frontend, API, AI pipeline, infrastructure, or project documentation.
---

# D:TECT Project

Use this skill only for work inside this repository.

## Load only what is needed

1. Read `Handoff.md` first for the current implementation boundary and latest validation state.
2. Read the target service's files only. Do not enumerate or load `node_modules/` or `dist/`.
3. Use `rg` for targeted discovery; avoid recursive dumps of unrelated services.

## Service boundaries

- `frontend/` contains the current React/Vite application. UI imports are relative to this directory.
- `backend/` is reserved for the Node.js/Express API; do not place server code in `frontend/`.
- `ai-service/` is reserved for Python/FastAPI collection and NLP work.
- `infrastructure/` contains runtime configuration; `docs/` contains maintained design and API notes.
- Treat backend and AI directories as scaffolds until their actual interfaces are added. Do not invent an API contract when a task does not request one.

## Commands and checks

- Run frontend commands from the repository root: `npm run dev`, `npm run build`, `npm run lint`, and `npm run preview`.
- The root scripts delegate to `frontend/`. For dependency changes, edit `frontend/package.json` and its lockfile together.
- After a frontend change, run the smallest relevant check; run `npm run build` before handing off a feature-level change.

## Maintain concise project context

- Record material architecture changes, new API contracts, required environment variables, and the last verified command result in `Handoff.md`.
- Keep `Handoff.md` factual and short. Link to implementation files instead of duplicating code or long specifications.
