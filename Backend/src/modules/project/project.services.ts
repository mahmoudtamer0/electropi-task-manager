import pool from "../../config/db";
import { notifyUser } from "../../sockets/socket";
import ApiError from "../../utils/errors/ApiError";


const getMembership = async (projectId: string, userId: string) => {
    const result = await pool.query(
        `SELECT role_in_project FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
    );
    return result.rows[0] || null;
};

export const assertCanView = async (projectId: string, userId: string, role: string) => {
    if (role === "admin") return;
    const membership = await getMembership(projectId, userId);
    if (!membership) throw new ApiError(403, "you do not have access to this project");
};

export const assertCanManage = async (projectId: string, userId: string, role: string) => {
    if (role === "admin") return;
    const membership = await getMembership(projectId, userId);
    if (!membership || membership.role_in_project !== "admin") {
        throw new ApiError(403, "only a project admin can perform this action");
    }
};

export const createProject = async (
    { name, description }: { name: string; description?: string },
    userId: string
) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const project = await client.query(
            `INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, description ?? null, userId]
        );

        await client.query(
            `INSERT INTO project_members (project_id, user_id, role_in_project) VALUES ($1, $2, $3)`,
            [project.rows[0].id, userId, "admin"]
        );

        await client.query("COMMIT");
        return project.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

export const listProjects = async (
    userId: string,
    role: string,
    { search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number }
) => {
    const offset = (page - 1) * limit;


    const conditions: string[] = [];
    const values: unknown[] = [];

    if (role !== "admin") {
        values.push(userId);
        conditions.push(`pm.user_id = $${values.length}`);
    }

    if (search) {
        values.push(`%${search}%`);
        conditions.push(`p.name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const joinClause = role !== "admin" ? `JOIN project_members pm ON pm.project_id = p.id` : "";

    const countResult = await pool.query(
        `SELECT COUNT(*)::int AS total FROM projects p ${joinClause} ${whereClause}`,
        values
    );
    const total = countResult.rows[0].total;


    const dataValues = [...values, limit, offset];
    const dataResult = await pool.query(
        `SELECT p.*,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS total_members
         FROM projects p ${joinClause} ${whereClause}
         ORDER BY p.created_at DESC
         LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
        dataValues
    );

    return {
        projects: dataResult.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const getProjectById = async (projectId: string, userId: string, role: string) => {
    await assertCanView(projectId, userId, role);

    const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [projectId]);
    if (result.rows.length === 0) throw new ApiError(404, "project not found");

    return result.rows[0];
};

export const updateProject = async (
    projectId: string,
    { name, description }: { name?: string; description?: string },
    userId: string,
    role: string
) => {
    await assertCanManage(projectId, userId, role);

    if (name === undefined && description === undefined) {
        throw new ApiError(400, "no fields provided to update");
    }

    const result = await pool.query(
        `UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description)
         WHERE id = $3 RETURNING *`,
        [name ?? null, description ?? null, projectId]
    );

    if (result.rows.length === 0) throw new ApiError(404, "project not found");
    return result.rows[0];
};

export const deleteProject = async (projectId: string, userId: string, role: string) => {
    await assertCanManage(projectId, userId, role);

    const result = await pool.query(`DELETE FROM projects WHERE id = $1`, [projectId]);
    if (result.rowCount === 0) throw new ApiError(404, "project not found");
};

export const getAvailableUsersForProject = async (
    projectId: string,
    { search }: { search?: string },
    userId: string,
    role: string
) => {
    await assertCanManage(projectId, userId, role);

    const values: unknown[] = [projectId];
    let query = `
        SELECT u.id, u.name, u.email
        FROM users u
        WHERE u.id NOT IN (
            SELECT user_id FROM project_members WHERE project_id = $1
        )`;

    if (search) {
        values.push(`%${search}%`);
        query += ` AND (u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`;
    }

    query += ` ORDER BY u.name LIMIT 10`;

    const result = await pool.query(query, values);
    return result.rows;
};

export const addMember = async (
    projectId: string,
    { userId: memberId, roleInProject }: { userId: string; roleInProject?: string },
    currentUserId: string,
    role: string
) => {
    await assertCanManage(projectId, currentUserId, role);

    const userExists = await pool.query(`SELECT id FROM users WHERE id = $1`, [memberId]);
    if (userExists.rows.length === 0) throw new ApiError(404, "user not found");


    const [, project] = await Promise.all([
        pool.query(
            `INSERT INTO project_members (project_id, user_id, role_in_project) VALUES ($1, $2, $3)
             ON CONFLICT (project_id, user_id) DO UPDATE SET role_in_project = EXCLUDED.role_in_project`,
            [projectId, memberId, roleInProject || "member"]
        ),
        await pool.query(`SELECT name FROM projects WHERE id = $1`, [projectId])
    ])

    notifyUser(memberId, "notification", {
        type: "added_to_project",
        message: `You were added to project "${project.rows[0].name}"`,
        projectId,
    });
};

export const removeMember = async (
    projectId: string,
    memberUserId: string,
    currentUserId: string,
    role: string
) => {
    await assertCanManage(projectId, currentUserId, role);

    const project = await pool.query(`SELECT "owner_id" FROM projects WHERE id = $1`, [projectId]);
    if (project.rows[0]?.owner_id === memberUserId) {
        throw new ApiError(400, "cannot remove the project owner");
    }

    const result = await pool.query(
        `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, memberUserId]
    );
    if (result.rowCount === 0) throw new ApiError(404, "member not found on this project");
};

export const listMembers = async (projectId: string, userId: string, role: string) => {
    await assertCanView(projectId, userId, role);

    const result = await pool.query(
        `SELECT u.id, u.name, u.email, pm.role_in_project
         FROM project_members pm
         JOIN users u ON u.id = pm.user_id
         WHERE pm.project_id = $1
         ORDER BY u.name`,
        [projectId]
    );
    return result.rows;
};