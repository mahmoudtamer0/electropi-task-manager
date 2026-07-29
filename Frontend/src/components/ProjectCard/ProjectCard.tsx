import { useNavigate } from "react-router-dom";
import type { Project } from "../../types";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const navigate = useNavigate();

    return (
        <div className={styles.card} onClick={() => navigate(`/projects/${project.id}`)}>
            <h3 className={styles.name}>{project.name}</h3>
            <p className={styles.description}>{project.description || "No description"}</p>
            <div className={styles.footer}>
                <span className={styles.date}>
                    Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span className={styles.members}>
                    {Number(project.total_members) || 0} member{Number(project.total_members) === 1 ? "" : "s"}
                </span>
            </div>
        </div>
    );
}