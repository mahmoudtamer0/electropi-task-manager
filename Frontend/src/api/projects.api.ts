import { apiRequest } from "./clients";
import type { Project, Pagination, ProjectMember, User } from "../types";

export const listProjectsRequest = (params: { search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    return apiRequest<{ status: string; projects: Project[]; pagination: Pagination }>(
        `/projects?${query.toString()}`
    );
};

export const createProjectRequest = (data: { name: string; description?: string }) =>
    apiRequest<{ status: string; project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const getProjectRequest = (id: string) =>
    apiRequest<{ status: string; project: Project }>(`/projects/${id}`);

export const updateProjectRequest = (id: string, data: { name?: string; description?: string }) =>
    apiRequest<{ status: string; project: Project }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteProjectRequest = (id: string) =>
    apiRequest<{ status: string }>(`/projects/${id}`, { method: "DELETE" });

export const listMembersRequest = (id: string) =>
    apiRequest<{ status: string; members: ProjectMember[] }>(`/projects/${id}/members`);

export const addMemberRequest = (id: string, data: { userId: string; roleInProject?: string }) =>
    apiRequest<{ status: string }>(`/projects/${id}/members`, {
        method: "POST",
        body: JSON.stringify(data),
    });

export const removeMemberRequest = (id: string, userId: string) =>
    apiRequest<{ status: string }>(`/projects/${id}/members/${userId}`, { method: "DELETE" });

export const availableUsersRequest = (id: string, search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest<{ status: string; users: User[] }>(`/projects/${id}/available-users${query}`);
};