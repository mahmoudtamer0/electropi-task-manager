# ElectroPi Task Manager

A simple full-stack task management app (projects, tasks, members) built with Node.js, Express, PostgreSQL, and React.

## Live Demo : [https://electropi-task-manager.vercel.app]


## Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL, JWT auth, Socket.IO
- **Frontend:** React (Vite), TypeScript

## Architecture

The backend follows a feature-based module structure (`src/modules/auth`, `src/modules/project`, `src/modules/task`), each with its own router, controller, service, and Joi validation files. Database access uses raw parameterized SQL via `pg` (no ORM). Auth is JWT-based with email OTP verification. The frontend is a React SPA (Vite) with route protection, a shared API client, and Context-based state for auth/toasts/notifications.

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your values (database connection string, JWT secret, etc).

Create the database tables:
```bash
npm run migrate
```

Add sample data (creates an Admin and a Member test account):
```bash
npm run seed
```

Run the server:
```bash
npm run dev
```

Backend runs on `http://localhost:4000`.

### Backend Environment Variables

| Variable         | Description                                      |
|-------------------|---------------------------------------------------|
| `PORT`            | Port the server runs on                           |
| `DATABASE_URL`     | PostgreSQL connection string                      |
| `JWT_SECRET`       | Secret used to sign auth tokens                   |
| `JWT_EXPIRES_IN`   | Token lifetime (e.g. `7d`)                        |
| `CLIENT_URL`       | Frontend URL, used for CORS and socket connections|
| `BREVO_API`        | Brevo API key for sending emails (optional — see Notes below) |

### 2. Frontend

```bash
cd frontend
npm install
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend URL (e.g. `http://localhost:4000/api/v1`).

Run it:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Test Accounts (from seed)

| Role   | Email                  | Password       |
|--------|-------------------------|-----------------|
| Admin  | admin@example.com       | admin123       |
| Member | member@example.com      | member123      |

## Running Tests

```bash
cd backend
npm test
```

Runs 5 automated tests covering registration, login, and project access control.

## API Documentation

Postman collection: [link](https://www.postman.com/mahmoudtamer0-8816438/workspace/default-workspace/collection/50295562-84da4f96-bf78-4441-91c1-fb7473010238?action=share&source=copy-link&creator=50295562)

Or import `postman_collection.json` from this repo directly into Postman.

## Notes

- Email sending uses Brevo (`sib-api-v3-sdk`). If `BREVO_API` is not set in `.env`, OTP codes are logged to the console instead — useful for testing without setting up an email provider.
- Real-time notifications (task assigned, added to project) use Socket.IO.

## Author

**Mahmoud Tamer**
- Portfolio: [mahmoud-tamer-portfolio.vercel.app](https://mahmoud-tamer-portfolio.vercel.app)
- GitHub: [github.com/mahmoudtamer0](https://github.com/mahmoudtamer0)
- LinkedIn: [linkedin.com/in/mahmoudtamer0](https://www.linkedin.com/in/mahmoudtamer0/)
- Email: mahmoud.tamer.developer@gmail.com
- phone/whatsapp: 01123511914
