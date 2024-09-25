import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const server = express();
const httpServer = createServer(server);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // Change to allow only your Vercel domain later
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('msg', async (message, roomId, challengeId) => {
    const newMessage = {
      text: message.text,
      senderId: message.senderId,
      timestamp: new Date().toISOString(),
    };

    await prisma.challenge.update({
      where: { id: Number(challengeId) },
      data: {
        messages: { push: newMessage },
      },
    });

    io.to(roomId).emit('message', newMessage);
  });

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });
});

httpServer.listen(3000, () => {
  console.log('WebSocket server is running on port 3000');
});

