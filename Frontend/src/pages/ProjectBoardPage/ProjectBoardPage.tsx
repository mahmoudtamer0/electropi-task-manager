import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Task, TaskStatus, TaskPriority, Project, ProjectMember } from "../../types";
import { getProjectRequest, listMembersRequest } from "../../api/projects.api";
import {
    listTasksRequest,
    createTaskRequest,
    updateTaskRequest,
    deleteTaskRequest,
} from "../../api/tasks.api";
import TaskColumn from "../../components/TaskColumn/TaskColumn";
import Modal from "../../components/Modal/Modal";
import MembersModal from "../../components/MembersModal/MembersModal";
import { useToast } from "../../context/ToastContext/ToastContext";
import styles from "./ProjectBoardPage.module.css";

const COLUMNS: { status: TaskStatus; title: string }[] = [
    { status: "todo", title: "To Do" },
    { status: "in_progress", title: "In Progress" },
    { status: "done", title: "Done" },
];

export default function ProjectBoardPage() {
    const { id } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [status, setStatus] = useState<TaskStatus>("todo");
    const [dueDate, setDueDate] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        if (!id) return;
        const [projectRes, tasksRes, membersRes] = await Promise.all([
            getProjectRequest(id),
            listTasksRequest(id),
            listMembersRequest(id),
        ]);
        setProject(projectRes.project);
        setTasks(tasksRes.tasks);
        setMembers(membersRes.members);
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const openAddModal = (columnStatus: TaskStatus) => {
        setActiveTask(null);
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus(columnStatus);
        setDefaultStatus(columnStatus);
        setDueDate("");
        setAssigneeId("");
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setActiveTask(task);
        setTitle(task.title);
        setDescription(task.description || "");
        setPriority(task.priority);
        setStatus(task.status);
        setDueDate(task.due_date ? task.due_date.slice(0, 10) : "");
        setAssigneeId(task.assignee_id || "");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSubmitting(true);

        try {
            const payload = {
                title,
                description,
                priority,
                status,
                dueDate: dueDate || undefined,
                assigneeId: assigneeId || undefined,
            };
            if (activeTask) {
                await updateTaskRequest(id, activeTask.id, payload);
                showToast("success", "Task updated");
            } else {
                await createTaskRequest(id, { ...payload, status: defaultStatus });
                showToast("success", "Task created");
            }
            setIsModalOpen(false);
            await loadData();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!id || !activeTask) return;
        setIsSubmitting(true);
        try {
            await deleteTaskRequest(id, activeTask.id);
            showToast("success", "Task deleted");
            setIsModalOpen(false);
            await loadData();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return null;

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{project.name}</h1>
                    <p className={styles.description}>{project.description}</p>
                </div>
                <button
                    type="button"
                    className={styles.membersButton}
                    onClick={() => setIsMembersModalOpen(true)}
                >
                    Members
                </button>
            </div>

            <div className={styles.board}>
                {COLUMNS.map((col) => (
                    <TaskColumn
                        key={col.status}
                        title={col.title}
                        status={col.status}
                        tasks={tasks.filter((t) => t.status === col.status)}
                        members={members}
                        onTaskClick={openEditModal}
                        onAddClick={() => openAddModal(col.status)}
                    />
                ))}
            </div>

            {isModalOpen && (
                <Modal title={activeTask ? "Edit task" : "New task"} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label className={styles.label}>
                            Title
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>

                        <label className={styles.label}>
                            Description
                            <textarea
                                className={styles.textarea}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </label>

                        <div className={styles.row}>
                            <label className={styles.label}>
                                Priority
                                <select
                                    className={styles.input}
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </label>

                            {activeTask && (
                                <label className={styles.label}>
                                    Status
                                    <select
                                        className={styles.input}
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </label>
                            )}
                        </div>

                        <label className={styles.label}>
                            Assignee
                            <select
                                className={styles.input}
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className={styles.label}>
                            Due date
                            <input
                                type="date"
                                className={styles.input}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </label>

                        <div className={styles.actions}>
                            {activeTask && (
                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    onClick={handleDelete}
                                    disabled={isSubmitting}
                                >
                                    Delete
                                </button>
                            )}
                            <button type="submit" className={styles.submit} disabled={isSubmitting}>
                                {activeTask ? "Save changes" : "Create task"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
            {isMembersModalOpen && (
                <MembersModal projectId={id!} onClose={() => setIsMembersModalOpen(false)} />
            )}
        </div>
    );
}