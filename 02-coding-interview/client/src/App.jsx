import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Editor from '@monaco-editor/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin
);

const DEFAULT_SNIPPETS = {
  javascript: `// JavaScript Solution
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input:", nums, "Target:", target);
console.log("Indices:", twoSum(nums, target));
`,
  python: `# Python Solution (Executed with Pyodide WebAssembly)
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

nums = [2, 7, 11, 15]
target = 9
print("Input:", nums, "Target:", target)
print("Indices:", two_sum(nums, target))
`
};

export default function App() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_SNIPPETS.javascript);
  const [userCount, setUserCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);

  const socketRef = useRef(null);
  const isRemoteChange = useRef(false);
  const pyodideRef = useRef(null);

  // Check URL params for room link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setInRoom(true);
    }
  }, []);

  // Initialize Socket.io connection when in room
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
      isRemoteChange.current = true;
      if (data.code !== undefined) setCode(data.code);
      if (data.language !== undefined) setLanguage(data.language);
    });

    socket.on('code-update', (data) => {
      isRemoteChange.current = true;
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

  // Code editor onChange handler
  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode(newCode);

    if (socketRef.current && !isRemoteChange.current) {
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
    isRemoteChange.current = false;
  };

  // Language selector change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = DEFAULT_SNIPPETS[newLang] || '';
    setCode(newCode);

    if (socketRef.current) {
      socketRef.current.emit('language-change', { roomId, language: newLang });
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
  };

  // Safe browser execution for JavaScript & Python (WASM via Pyodide)
  const runCode = async () => {
    setIsRunning(true);
    setIsError(false);
    setOutput('Executing code...\n');

    try {
      if (language === 'javascript') {
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        console.error = (...args) => {
          logs.push('[Error] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };

        try {
          // Execute in isolated function context
          const result = new Function(code)();
          if (result !== undefined) {
            logs.push(`=> ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`);
          }
          setOutput(logs.join('\n') || '(Code executed with no output)');
        } catch (err) {
          setIsError(true);
          setOutput((logs.length ? logs.join('\n') + '\n' : '') + `Runtime Error: ${err.message}`);
        } finally {
          console.log = originalLog;
          console.error = originalError;
        }
      } else if (language === 'python') {
        // Python execution in the browser via Pyodide WebAssembly (WASM)
        if (!window.loadPyodide) {
          throw new Error('Pyodide WASM runtime is still loading from CDN. Please wait a moment and try again.');
        }

        setOutput('Initializing Pyodide WASM Python runtime...\n');

        if (!pyodideRef.current) {
          pyodideRef.current = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
          });
        }

        const pyodide = pyodideRef.current;
        const logs = [];

        pyodide.setStdout({
          batched: (str) => logs.push(str)
        });
        pyodide.setStderr({
          batched: (str) => logs.push(`[stderr] ${str}`)
        });

        const result = await pyodide.runPythonAsync(code);
        let finalOutput = logs.join('\n');
        if (result !== undefined && result !== null) {
          finalOutput += (finalOutput ? '\n' : '') + `=> ${result}`;
        }
        setOutput(finalOutput || '(Python code executed with no output)');
      }
    } catch (err) {
      setIsError(true);
      setOutput(`Execution failed:\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms`, { method: 'POST' });
      const data = await response.json();
      setRoomId(data.roomId);
      window.history.pushState({}, '', `?room=${data.roomId}`);
      setInRoom(true);
    } catch {
      const fallbackId = Math.random().toString(36).substring(2, 9);
      setRoomId(fallbackId);
      window.history.pushState({}, '', `?room=${fallbackId}`);
      setInRoom(true);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    window.history.pushState({}, '', `?room=${roomId.trim()}`);
    setInRoom(true);
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) socketRef.current.disconnect();
    window.history.pushState({}, '', window.location.pathname);
    setInRoom(false);
    setRoomId('');
    setOutput('');
  };

  if (!inRoom) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">CodeInterview Live</h1>
        <p className="lobby-subtitle">
          Real-time collaborative technical interview platform with Monaco code editor, WebSockets sync, and browser-safe WebAssembly (Pyodide) code execution.
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Language:</span>
              <select
                className="input-text"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>

              <button
                className="btn-run"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Status: {connectionStatus === 'connected' ? '🟢 Live Sync Active' : '🔴 Connecting...'}
            </div>
          </div>

          <div className="monaco-container">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : 'javascript'}
              value={code}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2
              }}
            />
          </div>

          <div className="output-pane">
            <div className="output-header">
              <span>Console Output ({language === 'python' ? 'Pyodide WASM' : 'Browser Engine'})</span>
              {output && (
                <button
                  className="btn-sm"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setOutput('')}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={`output-body ${isError ? 'output-error' : ''}`}>
              {output || '// Click "Run Code" to execute script...'}
            </div>
          </div>

          <div className="status-bar">
            <span>Editor: Monaco (@monaco-editor/react) | Engine: {language === 'python' ? 'Pyodide WASM' : 'JavaScript Sandbox'}</span>
            <span>Room: {roomId}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
