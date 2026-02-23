import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

let io: Server | null = null;

interface SocketUser {
  _id: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export const initSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CORS_ORIGIN || "http://localhost:3000",
        process.env.FRONTEND_URL || "",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
    transports: ["websocket", "polling"],
  });

  // ─── JWT Authentication Middleware ────────────────────────
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      // Allow unauthenticated connections for public event updates
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as SocketUser;
      socket.user = decoded;
      next();
    } catch (err) {
      // Allow connection but without user context
      console.warn("⚠️ Socket auth failed, connecting without user context");
      next();
    }
  });

  // ─── Connection Handler ──────────────────────────────────
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `🔌 Socket connected: ${socket.id}${socket.user ? ` (user: ${socket.user._id})` : " (anonymous)"}`,
    );

    // Join an event room for real-time updates
    socket.on("joinEvent", (eventId: string) => {
      if (!eventId || typeof eventId !== "string") return;
      const room = `event:${eventId}`;
      socket.join(room);
      console.log(`📢 Socket ${socket.id} joined room: ${room}`);
    });

    // Leave an event room
    socket.on("leaveEvent", (eventId: string) => {
      if (!eventId || typeof eventId !== "string") return;
      const room = `event:${eventId}`;
      socket.leave(room);
      console.log(`📢 Socket ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("✅ Socket.io initialized");
  return io;
};

/**
 * Get the Socket.io server instance.
 * Use this in controllers to emit events.
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket() first.");
  }
  return io;
};

export default { initSocket, getIO };
