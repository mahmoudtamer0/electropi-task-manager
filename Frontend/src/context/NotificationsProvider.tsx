import { useEffect, type ReactNode } from "react";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext/ToastContext";

interface NotificationPayload {
    type: string;
    message: string;
    projectId?: string;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!token) {
            disconnectSocket();
            return;
        }

        const socket = connectSocket(token);

        socket.on("notification", (payload: NotificationPayload) => {
            showToast("info", payload.message);
        });

        return () => {
            socket.off("notification");
        };
    }, [token, showToast]);

    return <>{children}</>;
}