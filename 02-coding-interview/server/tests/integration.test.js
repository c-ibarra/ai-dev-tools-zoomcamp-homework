const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { io: Client } = require('socket.io-client');
const { app, server, io } = require('../index.js');

describe('Coding Interview Platform - Integration Tests', () => {
  let serverInstance;
  let port;

  before(async () => {
    await new Promise((resolve) => {
      serverInstance = server.listen(0, () => {
        port = serverInstance.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    io.close();
    await new Promise((resolve) => {
      serverInstance.close(resolve);
    });
  });

  describe('HTTP REST API', () => {
    test('GET /api/health should return ok status', async () => {
      const res = await request(app).get('/api/health');
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.status, 'ok');
    });

    test('POST /api/rooms should generate a new room ID', async () => {
      const res = await request(app).post('/api/rooms');
      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.body.roomId, 'Expected roomId in response body');
    });

    test('GET /api/rooms/:roomId should return room metadata', async () => {
      const createRes = await request(app).post('/api/rooms');
      const { roomId } = createRes.body;

      const getRes = await request(app).get(`/api/rooms/${roomId}`);
      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(getRes.body.roomId, roomId);
      assert.strictEqual(getRes.body.userCount, 0);
    });

    test('GET /api/rooms/:roomId with non-existent ID should return 404', async () => {
      const res = await request(app).get('/api/rooms/non-existent-xyz-999');
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.error, 'Room not found');
    });
  });

  describe('WebSocket Client-Server Interaction', () => {
    test('Client receives sync-code upon joining a room', async () => {
      const client = Client(`http://localhost:${port}`);
      const roomId = 'test-room-sync';

      await new Promise((resolve) => client.on('connect', resolve));

      const syncPromise = new Promise((resolve) => {
        client.on('sync-code', (data) => {
          assert.ok(data.code !== undefined);
          assert.strictEqual(data.language, 'javascript');
          resolve();
        });
      });

      client.emit('join-room', { roomId, username: 'Tester' });
      await syncPromise;

      client.disconnect();
    });

    test('Two clients in the same room synchronize real-time code changes', async () => {
      const client1 = Client(`http://localhost:${port}`);
      const client2 = Client(`http://localhost:${port}`);
      const roomId = 'test-room-collab';

      await Promise.all([
        new Promise((r) => client1.on('connect', r)),
        new Promise((r) => client2.on('connect', r))
      ]);

      client1.emit('join-room', { roomId, username: 'Interviewer' });
      client2.emit('join-room', { roomId, username: 'Candidate' });

      // Wait a short tick for rooms to register
      await new Promise((r) => setTimeout(r, 100));

      const updatedCode = 'function add(a, b) {\n  return a + b;\n}\n';

      const updateReceivedPromise = new Promise((resolve) => {
        client2.on('code-update', (data) => {
          assert.strictEqual(data.code, updatedCode);
          resolve();
        });
      });

      client1.emit('code-change', { roomId, code: updatedCode });
      await updateReceivedPromise;

      client1.disconnect();
      client2.disconnect();
    });
  });
});
