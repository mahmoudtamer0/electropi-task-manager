import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Task } from "../../types";
import { listMyTasksRequest } from "../../api/tasks.api";
import PriorityBadge from "../../components/PriorityBadge/PriorityBadge";
import styles from "./MyTasksPage.module.css";

const STATUS_LABELS: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    done: "Done",
};

export default function MyTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        listMyTasksRequest()
            .then((res) => setTasks(res.tasks))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div>
            <h1 className={styles.title}>My Tasks</h1>

            {isLoading ? (
                <p className={styles.empty}>Loading...</p>
            ) : tasks.length === 0 ? (
                <p className={styles.empty}>No tasks assigned to you yet.</p>
            ) : (
                <div className={styles.list}>
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={styles.row}
                            onClick={() => navigate(`/projects/${task.project_id}`)}
                        >
                            <div className={styles.info}>
                                <span className={styles.taskTitle}>{task.title}</span>
                                <span className={styles.projectName}>{task.project_name}</span>
                            </div>

                            <span className={styles.status}>{STATUS_LABELS[task.status]}</span>

                            {task.due_date && (
                                <span className={styles.date}>{new Date(task.due_date).toLocaleDateString()}</span>
                            )}

                            <PriorityBadge priority={task.priority} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}