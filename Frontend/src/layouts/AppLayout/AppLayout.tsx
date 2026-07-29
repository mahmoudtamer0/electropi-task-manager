import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import Modal from "../../components/Modal/Modal";
import { useToast } from "../../context/ToastContext/ToastContext";
import type { Project } from "../../types";
import { listProjectsRequest, createProjectRequest } from "../../api/projects.api";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadProjects = async () => {
        const res = await listProjectsRequest({ limit: 50 });
        setProjects(res.projects);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createProjectRequest({ name, description });
            showToast("success", "Project created");
            setName("");
            setDescription("");
            setIsModalOpen(false);
            await loadProjects();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar projects={projects} onAddProject={() => setIsModalOpen(true)} />

            <main className={styles.main}>
                <Outlet context={{ projects, refreshProjects: loadProjects }} />
            </main>

            {isModalOpen && (
                <Modal title="New project" onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleCreate} className={styles.form}>
                        <label className={styles.label}>
                            Name
                            <input
                                className={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                        <button className={styles.submit} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create project"}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
}