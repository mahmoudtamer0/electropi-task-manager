import type { Task } from "../../types";
import PriorityBadge from "../PriorityBadge/PriorityBadge";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
    task: Task;
    assigneeName?: string;
    onClick: () => void;
}

export default function TaskCard({ task, assigneeName, onClick }: TaskCardProps) {
    return (
        <div className={styles.card} onClick={onClick}>
            <p className={styles.title}>{task.title}</p>
            <div className={styles.footer}>
                <span className={styles.date}>
                    {assigneeName || "Unassigned"}
                    {task.due_date && ` · ${new Date(task.due_date).toLocaleDateString()}`}
                </span>
                <PriorityBadge priority={task.priority} />
            </div>
        </div>
    );
}