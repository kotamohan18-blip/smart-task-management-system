# Task Management (To-Do List) Web Application

## Project Overview
A complete, production-ready Task Management Web Application built with the MERN stack (without React, using Vanilla JS for frontend). It includes robust user authentication, authorization, and comprehensive task management features with filtering, sorting, and dashboard statistics.

## Features
- **User Authentication**: Secure registration, login, and logout using JWT and bcrypt.
- **Authorization**: Role-based access control (User/Admin) and protected routes.
- **Task Management**: Create, read, update, and delete tasks.
- **Task Organization**: Categorize tasks, set priorities, and track due dates.
- **Dashboard**: View statistics including total, completed, pending, and overdue tasks.
- **Search & Filters**: Search by title, and filter by status and priority.
- **Security**: Password hashing, secure JWT cookies/headers, input validation.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **Authentication**: JWT, bcrypt

## Folder Structure
```
todo-app/
├── frontend/             # Frontend UI and logic
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Custom Express middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   └── server.js         # Entry point
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Installation Guide
1. Clone the repository or download the source code.
2. Navigate to the project directory: `cd todo-app`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure your environment variables.
5. Start the development server: `npm run dev`
6. Open your browser and navigate to the `frontend/login.html` file (or serve using a static server like Live Server).

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
- `PORT`: The port the backend server runs on (e.g., 5000).
- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secret string used for signing JSON Web Tokens.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get logged-in user profile
- `PUT /api/users/profile` - Update logged-in user profile

### Tasks
- `GET /api/tasks` - Get all tasks (supports query params for filtering/sorting)
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/complete` - Toggle task completion status

### Dashboard
- `GET /api/dashboard/stats` - Get user task statistics
