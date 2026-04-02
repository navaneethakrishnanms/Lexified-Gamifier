import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow cross-domain for local network testing
    methods: ["GET", "POST"]
  }
});

const rooms = {};

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

io.on('connection', (socket) => {
  console.log(`[+] User connected: ${socket.id}`);

  // 1. Host creates a room
  socket.on('create_room', ({ username }) => {
    const code = generateCode();
    rooms[code] = {
      host: { id: socket.id, username, score: null, correct: null, timeTaken: null },
      guest: null,
      status: 'waiting',
      seed: Math.floor(Math.random() * 2147483647) // Shared random seed so they get same questions
    };
    
    socket.join(code);
    socket.emit('room_created', { code, seed: rooms[code].seed });
    console.log(`[ROOM] ${username} created room ${code}`);
  });

  // 2. Guest joins the room
  socket.on('join_room', ({ code, username }) => {
    const roomCode = code.toUpperCase();
    const room = rooms[roomCode];
    
    if (!room) {
      return socket.emit('join_error', { message: 'Room not found or invalid code.' });
    }
    if (room.status !== 'waiting' || room.guest !== null) {
      return socket.emit('join_error', { message: 'Room is already full or battle started.' });
    }

    room.guest = { id: socket.id, username, score: null, correct: null, timeTaken: null };
    room.status = 'ready';
    socket.join(roomCode);
    
    // Tell everyone in the room that the guest has arrived
    io.to(roomCode).emit('room_ready', { 
      host: room.host.username,
      guest: username,
      seed: room.seed
    });
    console.log(`[ROOM] ${username} joined ${roomCode}`);
  });

  // 3. Host starts match
  socket.on('start_match', ({ code }) => {
    const room = rooms[code];
    if (room && room.status === 'ready') {
      room.status = 'playing';
      // Broadcast to both players to start!
      io.to(code).emit('match_started', { timestamp: Date.now() });
      console.log(`[ROOM] ${code} MATCH STARTED!`);
    }
  });

  // 4. Submit Scores (when a player finishes 10 questions)
  socket.on('submit_score', ({ code, score, correct, timeTaken }) => {
    const room = rooms[code];
    if (!room) return;

    let isHost = socket.id === room.host.id;
    let isGuest = room.guest && socket.id === room.guest.id;

    if (isHost) {
      room.host.score = score;
      room.host.correct = correct;
      room.host.timeTaken = timeTaken;
    } else if (isGuest) {
      room.guest.score = score;
      room.guest.correct = correct;
      room.guest.timeTaken = timeTaken;
    }

    // Check if both players have submitted!
    if (room.host.score !== null && room.guest.score !== null) {
      // Both finished. Compute winner!
      // Speed Bonus Calculation: Faster time = higher bonus score. Example: Max time allowed 300s.
      // E.g., Bonus = (300 - timeTaken) * 2 points.
      
      const hostTotal = room.host.score + Math.max(0, parseInt((300 - room.host.timeTaken) * 2));
      const guestTotal = room.guest.score + Math.max(0, parseInt((300 - room.guest.timeTaken) * 2));

      let winner = "Tie";
      if (hostTotal > guestTotal) winner = room.host.username;
      else if (guestTotal > hostTotal) winner = room.guest.username;

      const results = {
        winner,
        hostTotal,
        guestTotal,
        hostStats: room.host,
        guestStats: room.guest
      };

      io.to(code).emit('battle_complete', results);
      console.log(`[ROOM] ${code} FINISHED. Winner: ${winner}`);
      
      // Cleanup room after completion
      room.status = 'completed';
      setTimeout(() => delete rooms[code], 60000);
    } else {
      // Opponent is still playing
      socket.broadcast.to(code).emit('opponent_finished', {
        username: isHost ? room.host.username : room.guest.username
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[-] User disconnected: ${socket.id}`);
    // If a player disconnects mid-match, we could handle it here.
    // Simplifying for now.
  });
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lexifyd Multiplayer Socket Server running at http://0.0.0.0:${PORT}`);
});
