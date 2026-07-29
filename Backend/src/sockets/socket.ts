import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: { origin: process.env["CLIENT_URL"], credentials: true },
    });

    io.use((socket: any, next: any) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("unauthorized"));
        try {
            const payload = jwt.verify(token, process.env["JWT_SECRET"] as string) as { id: string };
            socket.data.userId = payload.id;
            next();
        } catch {
            next(new Error("unauthorized"));
        }
    });

    io.on("connection", (socket: any) => {
        socket.join(`user:${socket.data.userId}`);
    });
};

export const notifyUser = (userId: string, event: string, payload: unknown) => {
    io.to(`user:${userId}`).emit(event, payload);
};