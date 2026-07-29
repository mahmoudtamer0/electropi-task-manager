import pool from "../../config/db";
import { notifyUser } from "../../sockets/socket";
import ApiError from "../../utils/errors/ApiError";
import { assertCanView, assertCanManage } from "../project/project.services";

const assertAssigneeIsMember = async (projectId: string, assigneeId?: string | null) => {
    if (!assigneeId) return;

    const result = await pool.query(
        `SELECT 1 FROM project_members WHERE project_id = $1 AND "user_id" = $2`,
        [projectId, assigneeId]
    );
    if (result.rows.length === 0) {
        throw new ApiError(422, "assignee must be a member of this project");
    }
};

const getTaskOrThrow = async (projectId: string, taskId: string) => {
    const result = await pool.query(
        `SELECT * FROM tasks WHERE id = $1 AND project_id = $2`,
        [taskId, projectId]
    );
    if (result.rows.length === 0) throw new ApiError(404, "task not found");
    return result.rows[0];
};

export const createTask = async (
    projectId: string,
    { title, description, status, priority, dueDate, assigneeId }: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
    },
    userId: string,
    role: string
) => {
    await assertCanView(projectId, userId, role);
    await assertAssigneeIsMember(projectId, assigneeId);

    const result = await pool.query(
        `INSERT INTO tasks (project_id, title, description, status, priority, due_date, creator_id, assignee_id)
         VALUES ($1, $2, $3, COALESCE($4, 'todo'), COALESCE($5, 'medium'), $6, $7, $8)
         RETURNING *`,
        [projectId, title, description ?? null, status ?? null, priority ?? null, dueDate ?? null, userId, assigneeId ?? null]
    );

    if (assigneeId) {
        notifyUser(assigneeId, "notification", {
            type: "task_assigned",
            message: `You were assigned to task "${title}"`,
            projectId,
        });
    } else {
        const otherMembers = await pool.query(
            `SELECT user_id FROM project_members WHERE project_id = $1 AND user_id != $2`,
            [projectId, userId]
        );
        otherMembers.rows.forEach((row) => {
            notifyUser(row.user_id, "notification", {
                type: "task_created",
                message: `New task "${title}" was created`,
                projectId,
            });
        });
    }

    return result.rows[0];
};

export const listTasks = async (
    projectId: string,
    { status, priority, assigneeId }: { status?: string; priority?: string; assigneeId?: string },
    userId: string,
    role: string
) => {
    await assertCanView(projectId, userId, role);

    const conditions = [`project_id = $1`];
    const values: (string | undefined)[] = [projectId];
    let idx = 2;

    if (status) {
        conditions.push(`status = $${idx++}`);
        values.push(status);
    }
    if (priority) {
        conditions.push(`priority = $${idx++}`);
        values.push(priority);
    }
    if (assigneeId) {
        conditions.push(`assignee_id = $${idx++}`);
        values.push(assigneeId);
    }

    const result = await pool.query(
        `SELECT * FROM tasks WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
        values
    );
    return result.rows;
};

export const listMyTasks = async (userId: string) => {
    const result = await pool.query(
        `SELECT t.*, p.name AS project_name
         FROM tasks t
         JOIN projects p ON p.id = t.project_id
         WHERE t.assignee_id = $1
         ORDER BY t.created_at DESC`,
        [userId]
    );
    return result.rows;
};

export const getTaskById = async (projectId: string, taskId: string, userId: string, role: string) => {
    await assertCanView(projectId, userId, role);
    return getTaskOrThrow(projectId, taskId);
};

export const updateTask = async (
    projectId: string,
    taskId: string,
    body: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string | null;
    },
    userId: string,
    role: string
) => {
    await assertCanView(projectId, userId, role);
    await getTaskOrThrow(projectId, taskId);

    if (body.assigneeId !== undefined) {
        await assertAssigneeIsMember(projectId, body.assigneeId);
    }

    const columnMap: Record<string, unknown> = {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        due_date: body.dueDate,
        assignee_id: body.assigneeId,
    };

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [column, value] of Object.entries(columnMap)) {
        if (value !== undefined) {
            fields.push(`${column} = $${idx++}`);
            values.push(value);
        }
    }

    if (fields.length === 0) throw new ApiError(400, "no fields provided to update");

    fields.push(`"updated_at" = now()`);
    values.push(taskId, projectId);

    const result = await pool.query(
        `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx++} AND project_id = $${idx} RETURNING *`,
        values
    );
    return result.rows[0];
};

export const deleteTask = async (projectId: string, taskId: string, userId: string, role: string) => {
    await assertCanView(projectId, userId, role);
    const task = await getTaskOrThrow(projectId, taskId);

    const isCreator = task.creator_id === userId;
    if (!isCreator) {
        await assertCanManage(projectId, userId, role);
    }

    await pool.query(`DELETE FROM tasks WHERE id = $1 AND project_id = $2`, [taskId, projectId]);
};