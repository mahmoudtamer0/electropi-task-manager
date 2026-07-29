import type { TaskPriority } from "../../types";
import styles from "./PriorityBadge.module.css";

const LABELS: Record<TaskPriority, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
    return <span className={`${styles.badge} ${styles[priority]}`}>{LABELS[priority]}</span>;
}