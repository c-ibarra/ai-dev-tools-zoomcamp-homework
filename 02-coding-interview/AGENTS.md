# AI Agent Instructions for Homework 2

This document provides instructions for AI coding assistants working on the `02-coding-interview` project.

---

## 1. Project Overview & Architecture
- **Application**: Real-time collaborative coding interview platform.
- **Backend (`/server`)**: Node.js + Express + Socket.io.
- **Frontend (`/client`)**: React 18 + Vite + `@monaco-editor/react`.
- **WASM Engine**: Pyodide loaded in the browser to safely execute Python without server load.
- **Containerization**: Single container multi-stage Dockerfile (`node:20-alpine`).

---

## 2. Git & Workflow Guidelines
- Always maintain atomic, meaningful git commits for each feature or homework step.
- When committing changes:
  ```bash
  git add 02-coding-interview/
  git commit -m "feat(hw02): <description of change>"
  git push origin main
  ```
- Do not commit generated artifacts, dependencies, or logs (`node_modules/`, `dist/`, `.env`, `*.log`).
- Keep code, comments, documentation, and commit messages in English.

---

## 3. Testing & Verification Rules
- Always run the integration tests before completing changes:
  ```bash
  cd 02-coding-interview && npm test
  ```
- Ensure the frontend builds cleanly with Vite:
  ```bash
  cd 02-coding-interview/client && npm run build
  ```
