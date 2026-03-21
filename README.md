# QuizPro

A deployed full-stack MERN quiz platform for students, learners, and admins.

QuizPro supports public quiz discovery, secure authentication, timed quiz attempts, instant scoring, leaderboard ranking, progress tracking, and an admin console for managing quizzes and platform activity.

## Live Demo

- Frontend: `https://quiz-platform-rho-drab.vercel.app`
- Backend health check: `https://quiz-platform-gx8d.onrender.com/api/health`

## Highlights

- Guest, student, and admin user flows
- JWT-based authentication with protected routes
- Timed quiz sessions with auto-submit support
- Instant result view with quiz review
- Global and quiz-specific leaderboards
- Student dashboard and progress analytics
- Admin dashboard for quizzes, users, and platform analytics
- Free deployment using Vercel, Render, and MongoDB Atlas

## Tech Stack

### Frontend

- React 18
- React Router DOM 6
- Vite 7
- Chart.js
- react-chartjs-2

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS

## Architecture

```text
client (Vite + React)
  -> calls REST API through /api
  -> handles public pages, auth pages, student dashboard, admin dashboard

server (Express + MongoDB)
  -> auth routes
  -> quiz routes
  -> user analytics routes
  -> role-based access control

MongoDB Atlas
  -> users
  -> quizzes
  -> results
```

## Project Structure

```text
quiz-platform/
  client/
    public/
    src/
      components/
      config/
      constants/
      context/
      hooks/
      layout/
      pages/
      services/
      utils/
  server/
    config/
    middleware/
    models/
    routes/
    scripts/
    services/
```

## Core Features

### Public

- Landing page with public stats
- Quiz library with filtering by category and difficulty
- Global leaderboard
- Quiz-specific leaderboard
- About page

### Student

- Register and log in
- Start timed quizzes
- Submit answers and view results instantly
- Track quiz history and progress
- View profile and settings

### Admin

- Admin bootstrap from environment variables
- Manage quizzes from dashboard
- Manage users
- View analytics and platform metrics

## Route Overview

### Public Routes

- `/`
- `/login`
- `/register`
- `/quizzes`
- `/leaderboard`
- `/leaderboard/:id`
- `/about`
- `/quiz/:id`

### Student Routes

- `/dashboard`
- `/progress`
- `/profile`
- `/settings`
- `/quiz/:id/start`
- `/result/:attemptId`

### Admin Routes

- `/admin/dashboard`
- `/admin/quizzes`
- `/admin/users`
- `/admin/analytics`
- `/admin/profile`
- `/admin/settings`
- `/admin/about`

## Quiz Flow

```text
/quizzes
  -> /quiz/:id
  -> /quiz/:id/start
  -> /result/:attemptId
  -> /leaderboard/:id
```

Built-in attempt handling includes:

- timer-based submission flow
- tab-switch tracking
- protected exam route
- result review after submission

## API Summary

### Auth API

Base: `/api/auth`

- `POST /register`
- `POST /login`
- `POST /admin/login`
- `GET /me`
- `PUT /profile`
- `PUT /password`
- `GET /admin/users`
- `PUT /admin/users/:id/block`

### Quiz API

Base: `/api/quizzes`

- `GET /`
- `GET /categories`
- `GET /leaderboard`
- `GET /leaderboard/:id`
- `GET /:id`
- `GET /:id/exam`
- `POST /submit`
- `GET /results/:id`
- `GET /admin/all`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### User API

Base: `/api/user`

- `GET /public-stats`
- `GET /progress`
- `GET /history`
- `GET /admin/analytics`
- `GET /admin/users`

## Local Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB local instance or MongoDB Atlas connection string

### 1. Clone and install

```bash
git clone https://github.com/NitinGupta05/quiz-platform.git
cd quiz-platform

cd client
npm install

cd ../server
npm install
```

### 2. Backend environment

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/quizpro
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Quiz Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

### 3. Frontend environment

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run locally

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

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment Files

Tracked safe templates:

- `server/.env.example`
- `client/.env.example`

Ignored secret files:

- `server/.env`
- `client/.env`

Use `.env.example` files as setup references. Never commit real secrets.

## Free Deployment Setup

This project is structured to work well on a free student-friendly stack:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas Free Tier

### Deploy frontend on Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`

Set:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

### Deploy backend on Render

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Set:

```env
PORT=5000
MONGODB_URI=your_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=https://your-vercel-app.vercel.app
ADMIN_NAME=Quiz Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_strong_password
```

### Admin bootstrap

On backend startup, if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are present, the app can create or promote that account to admin.

That allows quiz creation from the deployed admin dashboard without manual database edits.

## Available Scripts

### Root

- `npm run install:all` - install both frontend and backend dependencies
- `npm run client` - run frontend dev server from root
- `npm run server` - run backend from root

### Client

- `npm run dev`
- `npm run build`
- `npm run preview`

### Server

- `npm start`
- `npm run dev`
- `npm run seed:subjects`
- `npm run verify:answers`

## Security Notes

- `.env` files are ignored from Git
- JWT secret is required from environment variables
- backend uses role checks for protected admin routes
- quiz exam flow is separated from public quiz listing
- use a strong `JWT_SECRET` in production
- rotate credentials immediately if they are ever exposed

## Current Status

This repository includes:

- deployed frontend and backend
- responsive UI
- role-based dashboards
- quiz management and analytics
- public-safe Git setup with environment templates

## Author

- GitHub: [NitinGupta05](https://github.com/NitinGupta05)
- LinkedIn: [nitin-kumar-gupta-0a5567373](https://www.linkedin.com/in/nitin-kumar-gupta-0a5567373/)
- Email: [nitinkumargupta515@gmail.com](mailto:nitinkumargupta515@gmail.com)
