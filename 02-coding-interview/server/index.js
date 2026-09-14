const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory store for active rooms, their current code, and participants
const rooms = new Map();

// Helper to get or initialize room data
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: '// Start coding here...\nfunction solution() {\n  console.log("Hello, World!");\n}\nsolution();\n',
      language: 'javascript',
      users: new Set()
    });
  }
  return rooms.get(roomId);
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/rooms', (req, res) => {
  const roomId = Math.random().toString(36).substring(2, 9);
  getRoom(roomId);
  res.status(201).json({ roomId, message: 'Room created successfully' });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    roomId,
    userCount: room.users.size,
    language: room.language
  });
});

// Socket.io real-time events
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUsername = 'Anonymous';

  socket.on('join-room', ({ roomId, username }) => {
    currentRoomId = roomId;
    currentUsername = username || `User-${socket.id.slice(0, 4)}`;

    socket.join(roomId);
    const room = getRoom(roomId);
    room.users.add(socket.id);

    // Send latest code and language to the newly joined client
    socket.emit('sync-code', {
      code: room.code,
      language: room.language
    });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      username: currentUsername,
      userCount: room.users.size
    });

    // Broadcast updated participant count to all in room
    io.to(roomId).emit('room-users', {
      userCount: room.users.size
    });
  });

  socket.on('code-change', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.code = code;
      // Broadcast update to all OTHER clients in the room
      socket.to(roomId).emit('code-update', { code });
    }
  });

  socket.on('language-change', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.language = language;
      socket.to(roomId).emit('language-update', { language });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      const room = rooms.get(currentRoomId);
      room.users.delete(socket.id);

      io.to(currentRoomId).emit('user-left', {
        userId: socket.id,
        username: currentUsername,
        userCount: room.users.size
      });

      // Cleanup room if empty after some time
      if (room.users.size === 0) {
        setTimeout(() => {
          if (rooms.has(currentRoomId) && rooms.get(currentRoomId).users.size === 0) {
            rooms.delete(currentRoomId);
          }
        }, 1000 * 60 * 60); // 1 hour grace period
      }
    }
  });
});

const path = require('path');
const fs = require('fs');

// Serve static frontend in production if built
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { app, server, io, rooms };
