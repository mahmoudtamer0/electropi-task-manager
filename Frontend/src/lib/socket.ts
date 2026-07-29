import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:4000";

let socket: Socket | null = null;

export function connectSocket(token: string) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },
    });

    return socket;
}

export function disconnectSocket() {
    socket?.disconnect();
    socket = null;
}

export function getSocket() {
    return socket;
}