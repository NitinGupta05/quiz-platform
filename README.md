# QuizPro

QuizPro is a full-stack MERN quiz platform with role-based access for guests, students, and admins.  
It includes timed quiz attempts, leaderboard ranking, progress analytics, and an admin management dashboard.

## Features

- Role-based authentication (Guest, User, Admin)
- Timed quiz flow with auto-submit
- Global and quiz-specific leaderboards
- User progress dashboard with analytics
- Admin tools for managing quizzes, users, and platform stats
- Responsive dashboard-style UI

## Tech Stack

### Frontend
- React 18
- React Router DOM v6
- Vite
- Chart.js + react-chartjs-2

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs

## Project Structure

```text
quiz-platform/
  client/                  # React frontend
    src/
      components/
      context/
      layout/
      pages/
      services/
      utils/
  server/                  # Express backend
    config/
    middleware/
    models/
    routes/
    scripts/
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)

### 1. Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Setup Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/quizdb
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Quiz Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_admin_password
```

### 3. Run the Application

Terminal 1:

```bash
cd server
npm start
```

Terminal 2:

```bash
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Free Deployment

Use this setup for a free student-friendly deployment:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas Free

### Frontend on Vercel

Deploy the `client` folder and add:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### Backend on Render

Deploy the `server` folder and add:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_jwt_secret
CLIENT_URL=https://your-vercel-frontend.vercel.app
ADMIN_NAME=Quiz Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_admin_password
```

Your public website link will be the Vercel URL.

### Admin Dashboard Setup

If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, the backend will create or promote that account to admin on startup.

After the backend deploys, log in with that admin account and use `/admin/quizzes` to add quizzes from the dashboard.

## Scripts

### Client

- `npm run dev` - Start Vite dev server
- `npm run build` - Create production build
- `npm run preview` - Preview production build

### Server

- `npm start` - Start API server
- `npm run dev` - Start API server (current config)
- `npm run seed:subjects` - Seed subject quizzes
- `npm run verify:answers` - Verify quiz answer data

## Route Overview

### Public

- `/`
- `/login`
- `/register`
- `/quizzes`
- `/leaderboard`
- `/leaderboard/:id`
- `/about`
- `/quiz/:id`

### Protected User

- `/dashboard`
- `/progress`
- `/profile`
- `/settings`
- `/quiz/:id/start`
- `/result/:attemptId`

### Admin

- `/admin/dashboard`
- `/admin/quizzes`
- `/admin/quizzes/create`
- `/admin/quizzes/edit/:id`
- `/admin/users`
- `/admin/analytics`
- `/admin/profile`
- `/admin/settings`
- `/admin/about`

## Quiz Flow

```text
/quizzes -> /quiz/:id -> /quiz/:id/start -> /result/:attemptId
```

Quiz attempt protections:
- Timer-based attempt handling
- Auto-submit on time expiry
- Back navigation restrictions during active attempt
- Tab-switch tracking

## API Summary

### Auth (`/api/auth`)

- `POST /register`
- `POST /login`
- `POST /admin/login`
- `GET /me`
- `PUT /profile`
- `PUT /password`
- `GET /admin/users`
- `PUT /admin/users/:id/block`

### Quizzes (`/api/quizzes`)

- `GET /`
- `GET /:id`
- `GET /:id/exam`
- `POST /`
- `PUT /:id`
- `DELETE /:id`
- `GET /admin/all`
- `POST /submit`
- `GET /results/:id`
- `GET /leaderboard`
- `GET /leaderboard/:id`
- `GET /categories`

### User (`/api/user`)

- `GET /public-stats`
- `GET /progress`
- `GET /history`
- `GET /admin/analytics`
- `GET /admin/users`

## Author

- Email: [nitinkumargupta515@gmail.com](mailto:nitinkumargupta515@gmail.com)
- LinkedIn: [nitin-kumar-gupta-0a5567373](https://www.linkedin.com/in/nitin-kumar-gupta-0a5567373/)
- GitHub: [NitinGupta05](https://github.com/NitinGupta05)
