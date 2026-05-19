# Expense Management Frontend

A modern React/Vite frontend for the Expense Management System. This SPA (Single Page Application) provides role-based interfaces for admins, managers, and employees to manage company expenses with JWT-based authentication.

**For complete setup, environment variables, sample accounts, and backend instructions, see the root [README.md](../README.md).**

## Project Overview

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: JWT tokens stored in localStorage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx       # Main layout wrapper with navigation
│   └── ProtectedRoute.jsx # Route guard for authenticated pages
├── contexts/            # React Context for global state
│   ├── AuthContext.jsx  # User authentication state
│   └── ExpenseContext.jsx # Expense data management
├── pages/               # Page components (one per route)
│   ├── Login.jsx        # Login page
│   ├── Signup.jsx       # User registration page
│   ├── Dashboard.jsx    # Main dashboard (role-specific)
│   ├── Expenses.jsx     # View all expenses
│   ├── SubmitExpense.jsx # Submit new expense form
│   ├── Approvals.jsx    # Approval workflow (managers/admins)
│   ├── Admin.jsx        # Admin user management
│   └── Profile.jsx      # User profile & password change
├── services/
│   └── api.js          # Axios instance & API endpoints
├── utils/
│   └── countries.js    # Country list for forms
├── App.jsx             # Main app component with routes
├── App.css             # App-level styles
├── index.css           # Global styles
└── main.jsx            # React app entry point
```

## Key Features

- **Authentication**: JWT-based login/signup with automatic token management
- **Role-Based UI**: Different dashboards and features for Admin, Manager, and Employee roles
- **Expense Management**: Submit, view, filter, and delete expenses
- **Approval Workflow**: Managers and admins can approve/reject pending expenses
- **User Management**: Admins can create and manage company users
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## Setup & Installation

### Prerequisites

- Node.js 18 or newer
- npm or npm.cmd (on Windows)
- Backend running on `http://localhost:5000`

### Install Dependencies

```powershell
npm.cmd install
```

### Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

If working with a different backend URL, update `VITE_API_URL` accordingly.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm.cmd run dev` | Start development server (http://localhost:5173) |
| `npm.cmd run build` | Build for production (outputs to `dist/`) |
| `npm.cmd run lint` | Check code quality with ESLint |
| `npm.cmd run preview` | Preview production build locally |

### Development Server

```powershell
npm.cmd run dev
```

The app will be available at:

```text
http://localhost:5173
```

## Authentication & Context

### AuthContext (`src/contexts/AuthContext.jsx`)

Manages user authentication state globally:
- Current user info (email, role, company)
- JWT token persistence
- Login/logout/signup handlers
- Automatic token validation on app load

**Usage in components**:
```javascript
const { user, login, logout, isAuthenticated } = useContext(AuthContext);
```

### ExpenseContext (`src/contexts/ExpenseContext.jsx`)

Manages expense data:
- Fetching and caching expenses
- Creating/updating/deleting expenses
- Filtering by status or date

**Usage in components**:
```javascript
const { expenses, fetchExpenses, submitExpense } = useContext(ExpenseContext);
```

## Protected Routes

The `ProtectedRoute` component wraps pages that require authentication. If a user is not logged in, they are redirected to the login page.

## API Integration

All API calls go through `src/services/api.js`, which:
- Configures Axios with the backend URL
- Automatically includes JWT token in request headers
- Handles authentication errors (e.g., token expiration)

## Sample Credentials

When the backend has `SEED_SAMPLE_DATA=true`, use these accounts to test different roles:

```
Admin:     admin@expense.com / password123
Manager:   manager@expense.com / password123
Employee:  employee@expense.com / password123
```

## Troubleshooting

### "Cannot connect to server" or API errors

- Ensure backend is running: `http://localhost:5000/api/health`
- Check `VITE_API_URL` in `.env` matches your backend URL
- Clear browser cache and localStorage if token issues persist

### Vite fails to start

- Delete `node_modules/` and `.vite/`, then reinstall: `npm.cmd install`
- On Windows, use `npm.cmd` instead of `npm` if PowerShell execution policy blocks npm

### Login/Signup not working

- Check if backend database is connected: `http://localhost:5000/api/health`
- Verify backend `.env` has correct `MONGO_URI`
- Check browser console for detailed error messages

### Tailwind CSS not applying

- Restart the dev server after any new changes to HTML structure
- Ensure `tailwind.config.js` includes all template paths

## Related Documentation

- [Root README](../README.md) - Full project setup
- [Backend README](../backend/package.json) - Backend API documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/en/main)
- [Vite Docs](https://vitejs.dev/)
