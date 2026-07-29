import { apiRequest } from "./clients";
import type { Task, TaskStatus, TaskPriority } from "../types";

export const listTasksRequest = (projectId: string) =>
    apiRequest<{ status: string; tasks: Task[] }>(`/projects/${projectId}/tasks`);

export const listMyTasksRequest = () =>
    apiRequest<{ status: string; tasks: Task[] }>(`/tasks/my-tasks`);

export const createTaskRequest = (
    projectId: string,
    data: {
        title: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        dueDate?: string;
        assigneeId?: string;
    }
) =>
    apiRequest<{ status: string; task: Task }>(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
    });

export const updateTaskRequest = (
    projectId: string,
    taskId: string,
    data: Partial<{
        title: string;
        description: string;
        status: TaskStatus;
        priority: TaskPriority;
        dueDate: string;
        assigneeId: string | null;
    }>
) =>
    apiRequest<{ status: string; task: Task }>(`/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const deleteTaskRequest = (projectId: string, taskId: string) =>
    apiRequest<{ status: string }>(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });