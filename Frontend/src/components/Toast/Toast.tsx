import styles from "./Toast.module.css";

interface ToastProps {
    type: "success" | "error" | "info";
    message: string;
    onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            <span className={styles.message}>{message}</span>
            <button className={styles.closeButton} onClick={onClose} type="button">
                ×
            </button>
        </div>
    );
}