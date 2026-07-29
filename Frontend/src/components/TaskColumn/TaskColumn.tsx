import type { Task, TaskStatus, ProjectMember } from "../../types";
import TaskCard from "../TaskCard/TaskCard";
import styles from "./TaskColumn.module.css";

interface TaskColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    members: ProjectMember[];
    onTaskClick: (task: Task) => void;
    onAddClick: () => void;
}

export default function TaskColumn({ title, status, tasks, members, onTaskClick, onAddClick }: TaskColumnProps) {
    return (
        <div className={styles.column}>
            <div className={styles.header}>
                <span className={`${styles.dot} ${styles[status]}`} />
                <span className={styles.title}>{title}</span>
                <span className={styles.count}>{tasks.length}</span>
                <button className={styles.addButton} onClick={onAddClick} type="button">
                    +
                </button>
            </div>

            <div className={styles.list}>
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        assigneeName={members.find((m) => m.id === task.assignee_id)?.name}
                        onClick={() => onTaskClick(task)}
                    />
                ))}
                {tasks.length === 0 && <p className={styles.empty}>No tasks</p>}
            </div>
        </div>
    );
}