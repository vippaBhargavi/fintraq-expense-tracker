# 💰 Fintraq — Personal Expense Tracker

A full-stack MERN expense tracker with authentication, transaction management, budgeting, and visual analytics.

## Stack

- **MongoDB** — database (transactions, users, budgets)
- **Express.js** — REST API backend
- **React** — frontend SPA with Recharts
- **Node.js** — runtime

## Features

- 🔐 JWT authentication (register/login)
- ➕ Add income & expense transactions with categories
- 🗂 Filter by type, category, date range
- 📊 Dashboard with bar chart (6-month trend) & donut chart (category breakdown)
- 🎯 Monthly budgets per category with progress bars + over-budget alerts
- 💱 Multi-currency support (USD, EUR, GBP, INR, JPY, CAD, AUD)
- 📄 Pagination for large transaction lists

## Quick Start (Docker)

The easiest way to run everything:

```bash
# Start MongoDB, backend, and frontend
docker-compose up --build

# App will be at:
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
```

## Manual Setup

### 1. MongoDB

Make sure MongoDB is running locally:
```bash
mongod --dbpath /data/db
# or use MongoDB Atlas (cloud)
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit with your MongoDB URI and JWT secret
npm run dev                  # Starts on http://localhost:5000
```

`.env` variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 3. Frontend

```bash
cd frontend
npm install
npm start                    # Starts on http://localhost:3000
```

The frontend proxies API calls to `localhost:5000` via the `proxy` field in `package.json`.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update` | Update name/currency |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (filter: type, category, startDate, endDate) |
| GET | `/api/expenses/summary` | Monthly totals + 6-month trend |
| POST | `/api/expenses` | Create transaction |
| PUT | `/api/expenses/:id` | Update transaction |
| DELETE | `/api/expenses/:id` | Delete transaction |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets?month=&year=` | Get budgets with actual spending |
| POST | `/api/budgets` | Set/update budget for category |
| DELETE | `/api/budgets/:id` | Remove budget |

## Project Structure

```
expense-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── budgets.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.js
│   │   ├── components/Sidebar.js
│   │   ├── pages/
│   │   │   ├── AuthPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ExpensesPage.js
│   │   │   └── BudgetsPage.js
│   │   ├── App.js
│   │   └── App.css
│   └── Dockerfile
└── docker-compose.yml
```

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- All expense/budget routes are protected by JWT middleware
- Users can only access their own data
- Change `JWT_SECRET` to a long random string in production
- Use MongoDB Atlas or set authentication on your MongoDB instance for production
