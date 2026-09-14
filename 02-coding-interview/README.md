# Real-Time Collaborative Coding Interview Platform

An AI-assisted full-stack platform for live technical interviews, featuring real-time code synchronization across participants, room management, syntax highlighting, and in-browser safe code execution.

Built for **Homework 2 (AI Dev Tools Zoomcamp 2026)**.

---

## Architecture

- **Frontend (`/client`)**: React 18 with Vite, modern dark-themed UI, real-time WebSocket connection to the interview session.
- **Backend (`/server`)**: Node.js + Express + Socket.io for managing room isolation, participant presence, and broadcasting live code changes.
- **Protocol**: WebSockets (Socket.io) with room scoping (`join-room`, `code-change`, `sync-code`, `room-users`).

---

## Getting Started

### 1. Install Dependencies
From the root of this project:
```bash
npm run install:all
```
Or install manually in each subfolder:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

---

## Running the Application

To run both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend Client**: http://localhost:5173
- **Backend Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## Running Integration Tests

To run the full suite of integration tests (HTTP REST API + WebSocket real-time synchronization):

```bash
npm test
```

### What the tests cover:
1. **HTTP REST API**:
   - `GET /api/health` returns status `ok`.
   - `POST /api/rooms` creates a new room with a unique room ID.
   - `GET /api/rooms/:roomId` returns metadata and active user counts.
   - `GET /api/rooms/:roomId` returns 404 for nonexistent rooms.
2. **WebSocket Client-Server Interaction**:
   - Client joins room and receives initial code synchronization (`sync-code`).
   - Multiple clients join the same room and synchronize code edits in real-time (`code-change` -> `code-update`).
