export type Role = "admin" | "member";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profilePic?: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  total_members?: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  creator_id: string;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role_in_project: Role;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}