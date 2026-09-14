# Real-Time Collaborative Coding Interview Platform

An AI-assisted full-stack platform for live technical interviews, featuring real-time code synchronization across participants, room management, syntax highlighting, and in-browser safe code execution using WebAssembly.

Built for **Homework 2 (AI Dev Tools Zoomcamp 2026)**.

---

## Features

- ⚡ **Real-Time Collaboration**: Instant synchronization of code edits and room presence using WebSockets (`socket.io`).
- 🎨 **Syntax Highlighting**: Powered by **Monaco Editor** (`@monaco-editor/react`), supporting JavaScript and Python with VS Code dark theme.
- 🚀 **Browser-Safe Code Execution**:
  - **JavaScript**: Evaluated in-browser with console capturing.
  - **Python**: Compiled and executed entirely client-side via **Pyodide** WebAssembly (WASM).
- 🔗 **Shareable Interview Links**: Candidates and interviewers join the same session via unique room URLs (`?room=<id>`).
- 🐳 **Single-Container Dockerfile**: Multi-stage build packaging both backend and frontend into a lightweight container.

---

## Architecture

- **Frontend (`/client`)**: React 18, Vite, `@monaco-editor/react`, Pyodide CDN.
- **Backend (`/server`)**: Node.js, Express, Socket.io, CORS.
- **Root Orchestrator**: Managed via `concurrently`.

---

## Getting Started

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Both Client & Server Concurrently
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## Integration Tests

To run the integration test suite covering REST APIs and WebSocket synchronization:
```bash
npm test
```

---

## Containerization (Docker)

Build the unified production Docker container:
```bash
docker build -t coding-interview:latest .
```

Run the container:
```bash
docker run -p 3001:3001 coding-interview:latest
```
Access the application at http://localhost:3001.

---

## Deployment

Deployable to **Render** or **Railway**:
1. Connect this GitHub repository.
2. Select Docker runtime or Node.js environment.
3. Root directory: `02-coding-interview`.
4. Port: `3001`.
