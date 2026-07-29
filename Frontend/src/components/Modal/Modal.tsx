import type { ReactNode } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button className={styles.closeButton} onClick={onClose} type="button">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}