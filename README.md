# Expense Management System

A full-stack expense management app with role-based access for admins, managers, and employees. Employees can submit expenses, managers/admins can approve or reject them, and admins can manage company users.

## Features

- JWT authentication with signup and login
- Company creation during signup
- Admin, Manager, and Employee roles
- User management for admins
- Expense submission with optional receipt attachment
- Expense list, filtering, deletion, and status tracking
- Approval workflow for managers and admins
- Profile password update
- Sample data seeding for local development

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios

## Project Structure

```text
.
+-- backend/
|   +-- middleware/
|   +-- models/
|   +-- routes/
|   +-- utils/
|   +-- .env.example
|   +-- server.js
+-- frontend/
|   +-- src/
|   +-- .env.example
|   +-- package.json
+-- .gitignore
+-- README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Environment Setup

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/expense-management
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
SEED_SAMPLE_DATA=true
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Important: real `.env` files are ignored by Git. Commit only `.env.example` files.

## Installation

Install backend dependencies:

```powershell
cd backend
npm.cmd install
```

Install frontend dependencies:

```powershell
cd frontend
npm.cmd install
```

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

## Run Locally

Start MongoDB first. Then start the backend:

```powershell
cd backend
npm.cmd run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

The health check should show:

```json
{
  "status": "ok",
  "database": "connected"
}
```

Start the frontend in a second terminal:

```powershell
cd frontend
npm.cmd run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Sample Accounts

When `SEED_SAMPLE_DATA=true`, the backend creates these accounts if they do not already exist:

```text
admin@expense.com / password123
manager@expense.com / password123
employee@expense.com / password123
```

Set `SEED_SAMPLE_DATA=false` when you do not want automatic sample data.

## Useful Scripts

Backend:

```powershell
npm.cmd run dev
npm.cmd run start
npm.cmd run check
```

Frontend:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

## Git Notes

Before pushing, make sure these are not committed:

- `node_modules/`
- `.env`
- `frontend/dist/`
- log files
- temporary smoke-test files

The included `.gitignore` already excludes these.

## Troubleshooting

If login/signup returns server errors, check:

- MongoDB is running.
- `backend/.env` has the correct `MONGO_URI`.
- `http://localhost:5000/api/health` says `database: "connected"`.

If Vite or npm fails on Windows PowerShell, try `npm.cmd` instead of `npm`.
