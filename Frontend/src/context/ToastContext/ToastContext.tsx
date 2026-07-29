import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import Toast from "../../components/Toast/Toast";
import { registerToastHandler } from "../../lib/ToastBridg";
import styles from "./ToastContext.module.css";

type ToastType = "success" | "error" | "info";
interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), 3500);
    }, []);

    useEffect(() => {
        registerToastHandler(showToast);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container}>
                {toasts.map((t) => (
                    <Toast key={t.id} type={t.type} message={t.message} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}