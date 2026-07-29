import { useState, useEffect } from "react";
import type { Project, Pagination } from "../../types";
import { listProjectsRequest } from "../../api/projects.api";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import styles from "./ProjectsListPage.module.css";

export default function ProjectsListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            setIsLoading(true);
            const res = await listProjectsRequest({ search, page, limit: 8 });
            setProjects(res.projects);
            setPagination(res.pagination);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, page]);

    console.log(projects);

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Projects</h1>
                <input
                    className={styles.search}
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            {isLoading ? (
                <p className={styles.empty}>Loading...</p>
            ) : projects.length === 0 ? (
                <p className={styles.empty}>No projects yet.</p>
            ) : (
                <div className={styles.grid}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className={styles.pageButton}
                        type="button"
                    >
                        Prev
                    </button>
                    <span className={styles.pageInfo}>
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className={styles.pageButton}
                        type="button"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}