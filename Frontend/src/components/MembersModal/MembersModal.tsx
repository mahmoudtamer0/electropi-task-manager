import { useState, useEffect } from "react";
import type { ProjectMember, User } from "../../types";
import {
    listMembersRequest,
    addMemberRequest,
    removeMemberRequest,
    availableUsersRequest,
} from "../../api/projects.api";
import { useToast } from "../../context/ToastContext/ToastContext";
import Modal from "../Modal/Modal";
import styles from "./MembersModal.module.css";

interface MembersModalProps {
    projectId: string;
    onClose: () => void;
}

export default function MembersModal({ projectId, onClose }: MembersModalProps) {
    const { showToast } = useToast();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [search, setSearch] = useState("");
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMembers = async () => {
        const res = await listMembersRequest(projectId);
        setMembers(res.members);
    };

    useEffect(() => {
        loadMembers().finally(() => setIsLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (!search.trim()) {
            setAvailableUsers([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const res = await availableUsersRequest(projectId, search);
            setAvailableUsers(res.users);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, projectId]);

    const handleAdd = async (userId: string) => {
        await addMemberRequest(projectId, { userId });
        showToast("success", "Member added");
        setSearch("");
        setAvailableUsers([]);
        await loadMembers();
    };

    const handleRemove = async (userId: string) => {
        await removeMemberRequest(projectId, userId);
        showToast("success", "Member removed");
        await loadMembers();
    };

    return (
        <Modal title="Members" onClose={onClose}>
            <div className={styles.searchBox}>
                <input
                    className={styles.input}
                    placeholder="Search people to add..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {availableUsers.length > 0 && (
                    <div className={styles.dropdown}>
                        {availableUsers.map((user) => (
                            <button
                                key={user.id}
                                type="button"
                                className={styles.dropdownItem}
                                onClick={() => handleAdd(user.id)}
                            >
                                <span className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
                                <span className={styles.userText}>
                                    <span className={styles.userName}>{user.name}</span>
                                    <span className={styles.userEmail}>{user.email}</span>
                                </span>
                                <span className={styles.addLabel}>Add</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <p className={styles.empty}>Loading...</p>
                ) : members.length === 0 ? (
                    <p className={styles.empty}>No members yet.</p>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className={styles.row}>
                            <span className={styles.avatar}>{member.name.charAt(0).toUpperCase()}</span>
                            <span className={styles.userText}>
                                <span className={styles.userName}>{member.name}</span>
                                <span className={styles.userEmail}>{member.email}</span>
                            </span>
                            <span className={`${styles.roleBadge} ${member.role_in_project === "admin" ? styles.roleAdmin : ""}`}>
                                {member.role_in_project}
                            </span>
                            <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => handleRemove(member.id)}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
}