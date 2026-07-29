import { NavLink, useNavigate } from "react-router-dom";
import type { Project } from "../../types";
import { useAuth } from "../../context/AuthContext";
import styles from "./Sidebar.module.css";

interface SidebarProps {
    projects: Project[];
    onAddProject: () => void;
}

export default function Sidebar({ projects, onAddProject }: SidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>Taskapp</div>
            <p className={styles.tagline}>ElectroPi Task Submission</p>

            <NavLink
                to="/projects"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
                All Projects
            </NavLink>

            <NavLink
                to="/my-tasks"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
                My Tasks
            </NavLink>

            <div className={styles.sectionHeader}>
                <span>Projects</span>
                <button className={styles.addButton} onClick={onAddProject} type="button">
                    +
                </button>
            </div>

            <div className={styles.projectList}>
                {projects.map((project) => (
                    <NavLink
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className={({ isActive }) => `${styles.projectItem} ${isActive ? styles.projectItemActive : ""}`}
                    >
                        {project.name}
                    </NavLink>
                ))}
            </div>

            <div className={styles.userBox}>
                <div className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user?.name}</span>
                    <span className={styles.userEmail}>{user?.email}</span>
                </div>
                <button className={styles.logoutButton} onClick={handleLogout} type="button">
                    Log out
                </button>
            </div>

            <a
                href="https://www.linkedin.com/in/mahmoudtamer0/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.credit}
            >
                Made by Mahmoud Tamer
            </a>
        </aside>
    );
}