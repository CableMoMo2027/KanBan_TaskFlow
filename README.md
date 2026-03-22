# Kanban Workspace

TaskFlow is a Kanban workspace app with a Next.js frontend and a NestJS backend. It supports authentication, boards, columns, tasks, members, invitations, notifications, theming, and per-user board persistence on the frontend.

## Stack

- Frontend: Next.js 16, React 19
- Backend: NestJS 10
- Database/Auth storage: Supabase
- Database engine: PostgreSQL

## Database

This project uses PostgreSQL as the main database, hosted on Supabase.

Main tables include:

- `users`
- `boards`
- `board_members`
- `columns`
- `tasks`
- `notifications`

## Project Structure

```text
Kanban/
|- backend/   # NestJS API
|- frontend/  # Next.js app
```

## Features

- User registration and login
- Board creation and board membership
- Invite members to boards
- Create columns and tasks
- Drag and drop tasks between columns
- My Tasks and Members pages
- Light and dark mode

## Environment Files

Backend example: [backend/.env.example](/c:/src/Kanban/backend/.env.example)  
Frontend example: [frontend/.env.example](/c:/src/Kanban/frontend/.env.example)

Create local env files before starting:

- `backend/.env`
- `frontend/.env.local`

Required backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `DATABASE_URL`
- `PORT`

Required frontend variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

## Install

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Run In Development

Start backend:

```bash
cd backend
npm run start:dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Database Notes

- Base schema: `backend/schema.sql`
- Additional migrations: `backend/migration_v2.sql`, `backend/migration_v3.sql`

Run the SQL files in Supabase SQL Editor if your database is not initialized yet.

## Useful Scripts

Backend:

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run start`

## Notes

- `node_modules` and `.env` files are ignored by git.
- The app uses App Router routes in `frontend/src/app`.
- If Next.js route changes behave strangely, restart the frontend dev server.

## Thai Version

Thai documentation: [README.th.md](/c:/src/Kanban/README.th.md)
