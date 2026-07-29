import bcrypt from "bcrypt";
import pool from "../config/db";

const SALT_ROUNDS = 10;

async function seed() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const adminPasswordHash = await bcrypt.hash("admin123", SALT_ROUNDS);
        const memberPasswordHash = await bcrypt.hash("member123", SALT_ROUNDS);

        const adminResult = await client.query(
            `
            INSERT INTO users (
                name,
                email,
                password,
                role,
                "isEmailVerified",
                status
            )
            VALUES ($1, $2, $3, 'admin', true, 'active')

            ON CONFLICT (email)
            DO UPDATE SET
                name = EXCLUDED.name,
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                "isEmailVerified" = EXCLUDED."isEmailVerified",
                status = EXCLUDED.status

            RETURNING id;
            `,
            [
                "Admin User",
                "admin@example.com",
                adminPasswordHash,
            ]
        );

        const memberResult = await client.query(
            `
            INSERT INTO users (
                name,
                email,
                password,
                role,
                "isEmailVerified",
                status
            )
            VALUES ($1, $2, $3, 'member', true, 'active')

            ON CONFLICT (email)
            DO UPDATE SET
                name = EXCLUDED.name,
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                "isEmailVerified" = EXCLUDED."isEmailVerified",
                status = EXCLUDED.status

            RETURNING id;
            `,
            [
                "Member User",
                "member@example.com",
                memberPasswordHash,
            ]
        );

        const adminId = adminResult.rows[0].id;
        const memberId = memberResult.rows[0].id;

        const projectResult = await client.query(
            `
            INSERT INTO projects (name, description, owner_id)
            VALUES ($1, $2, $3)
            RETURNING id;
            `,
            [
                "Demo Project",
                "Seed project for local testing / reviewer walkthrough",
                adminId,
            ]
        );

        const projectId = projectResult.rows[0].id;

        await client.query(
            `
            INSERT INTO project_members
                (project_id, user_id, role_in_project)
            VALUES
                ($1, $2, 'admin'),
                ($1, $3, 'member')
            ON CONFLICT DO NOTHING;
            `,
            [projectId, adminId, memberId]
        );

        await client.query(
            `
            INSERT INTO tasks
            (
                project_id,
                title,
                description,
                status,
                priority,
                due_date,
                creator_id,
                assignee_id
            )
            VALUES
            (
                $1,
                'Set up repo',
                'Initialize backend and frontend scaffolding',
                'done',
                'high',
                NOW() + INTERVAL '2 days',
                $2,
                $2
            ),
            (
                $1,
                'Design DB schema',
                'Model users, projects, tasks',
                'in_progress',
                'high',
                NOW() + INTERVAL '3 days',
                $2,
                $3
            ),
            (
                $1,
                'Build task board UI',
                'Columns for To Do / In Progress / Done',
                'todo',
                'medium',
                NOW() + INTERVAL '5 days',
                $2,
                $3
            );
            `,
            [projectId, adminId, memberId]
        );

        await client.query("COMMIT");

        console.log("✅ Seed complete.");
        console.log("Admin: admin@example.com / admin123");
        console.log("Member: member@example.com / member123");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(() => process.exit(1));