import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin
);

export default function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [code, setCode] = useState('// Welcome to the live coding interview!\n\nfunction solution() {\n  return "Hello, World!";\n}\n\nconsole.log(solution());\n');
  const [language, setLanguage] = useState('javascript');
  const [userCount, setUserCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  // Parse URL on initial load to check if user opened a shared link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setInRoom(true);
    }
  }, []);

  // Manage Socket.io connection when entering a room
  useEffect(() => {
    if (!inRoom || !roomId) return;

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join-room', {
        roomId,
        username: username || 'Candidate'
      });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('sync-code', (data) => {
      isRemoteUpdate.current = true;
      if (data.code !== undefined) setCode(data.code);
      if (data.language !== undefined) setLanguage(data.language);
    });

    socket.on('code-update', (data) => {
      isRemoteUpdate.current = true;
      setCode(data.code);
    });

    socket.on('language-update', (data) => {
      setLanguage(data.language);
    });

    socket.on('room-users', (data) => {
      setUserCount(data.userCount);
    });

    socket.on('user-joined', (data) => {
      setUserCount(data.userCount);
    });

    socket.on('user-left', (data) => {
      setUserCount(data.userCount);
    });

    return () => {
      socket.disconnect();
    };
  }, [inRoom, roomId]);

  // Handle local code editing
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    if (socketRef.current && !isRemoteUpdate.current) {
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
    isRemoteUpdate.current = false;
  };

  // Create new interview room
  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms`, { method: 'POST' });
      const data = await response.json();
      const newRoomId = data.roomId;
      setRoomId(newRoomId);
      window.history.pushState({}, '', `?room=${newRoomId}`);
      setInRoom(true);
    } catch (err) {
      // Fallback client-side ID generation if server HTTP route unavailable
      const fallbackId = Math.random().toString(36).substring(2, 9);
      setRoomId(fallbackId);
      window.history.pushState({}, '', `?room=${fallbackId}`);
      setInRoom(true);
    }
  };

  // Join existing room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    window.history.pushState({}, '', `?room=${roomId.trim()}`);
    setInRoom(true);
  };

  // Copy shareable invite link
  const copyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Leave room back to lobby
  const handleLeaveRoom = () => {
    if (socketRef.current) socketRef.current.disconnect();
    window.history.pushState({}, '', window.location.pathname);
    setInRoom(false);
    setRoomId('');
  };

  // Render Lobby screen
  if (!inRoom) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">CodeInterview Live</h1>
        <p className="lobby-subtitle">
          Real-time collaborative technical interview platform with live code editing and instant synchronization.
        </p>

        <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Your Name / Handle
          </label>
          <input
            type="text"
            className="input-text"
            style={{ width: '100%' }}
            placeholder="e.g., Alex Rivera (Interviewer)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <button className="btn-primary" onClick={handleCreateRoom}>
          + Create New Interview Room
        </button>

        <div className="divider">
          <span>or join existing</span>
        </div>

        <form onSubmit={handleJoinRoom} className="join-form">
          <input
            type="text"
            className="input-text"
            placeholder="Enter Room ID (e.g., abc-123)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', marginBottom: 0 }}>
            Join
          </button>
        </form>
      </div>
    );
  }

  // Render Workspace screen
  return (
    <div className="workspace">
      <header className="navbar">
        <div className="nav-brand">
          <span style={{ fontSize: '1.3rem' }}>⚡</span>
          <span>CodeInterview Live</span>
        </div>

        <div className="nav-room-info">
          <span className="badge badge-green">
            ● {userCount} {userCount === 1 ? 'user' : 'users'} online
          </span>

          <span className="badge">
            Room: <strong style={{ marginLeft: '4px', color: '#fff' }}>{roomId}</strong>
          </span>

          <button className="btn-sm" onClick={copyInviteLink}>
            {copied ? '✓ Link Copied!' : '🔗 Copy Invite Link'}
          </button>

          <button className="btn-sm" onClick={handleLeaveRoom}>
            Exit
          </button>
        </div>
      </header>

      <div className="main-content">
        <section className="editor-pane">
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Language:</span>
              <select
                className="input-text"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  if (socketRef.current) {
                    socketRef.current.emit('language-change', { roomId, language: newLang });
                  }
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Status: {connectionStatus === 'connected' ? '🟢 Live Sync Active' : '🔴 Connecting...'}
            </div>
          </div>

          <textarea
            className="code-textarea"
            value={code}
            onChange={handleCodeChange}
            spellCheck="false"
            placeholder="Type your code here..."
          />

          <div className="status-bar">
            <span>Lines: {code.split('\n').length} | Characters: {code.length}</span>
            <span>Real-time WebSocket connection</span>
          </div>
        </section>
      </div>
    </div>
  );
}
