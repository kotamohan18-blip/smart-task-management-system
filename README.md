# Smart Task Management System

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/) [![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas) [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://todolist1-t3bp.onrender.com/tasks.html) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/kotamohan18-blip/todolist1)

A full-stack task management application built with Node.js, Express.js, MongoDB Atlas, HTML, CSS, and JavaScript.

---

## ⚡ Quick Access

*   **Live Demo Website**: [https://todolist1-t3bp.onrender.com/tasks.html](https://todolist1-t3bp.onrender.com/tasks.html)
*   **GitHub Repository**: [https://github.com/kotamohan18-blip/todolist1](https://github.com/kotamohan18-blip/todolist1)

---

## 📋 Project Summary

*   **Backend**: Node.js and Express.js REST API with JWT authentication, custom middleware (logging, response timing, role check), and dashboard analytical utilities.
*   **Frontend**: Multi-page responsive user interface built with HTML5, CSS3 variables, and Vanilla JavaScript.
*   **Database**: MongoDB Atlas for storing users, tasks, and achievements data.
*   **Deployment**: Render.

---

## 1. Project Overview

The Smart Task Management System is a full-stack project built using Node.js, Express, MongoDB Atlas, HTML, CSS, and Vanilla JavaScript.

The application includes:
*   **User Authentication**: JWT-based session management, cookies, and endpoint route guards.
*   **Task Management**: Comprehensive CRUD operations for categorizing, prioritizing, scheduling, and duplicating tasks.
*   **Dashboard Analytics**: Visualized task statistics including pending, completed, and priority metrics.
*   **Calendar Integration**: Direct calendar mappings to visualize tasks on their respective due dates.
*   **Productivity Tracking & Achievement System**: A scoring system that awards points upon task completion, tracking achievements (e.g. milestones for tasks completed).

---

## 2. Key Features

*   **JWT Authentication**: Secure user registration, login, and token validation.
*   **User Profile Management**: Retrieve and update logged-in user profile details.
*   **Task CRUD Operations**: Complete creation, reading, updating, and deletion of tasks.
*   **Task Duplication**: Quickly clone existing tasks with preset details.
*   **Categories & Priorities**: Categorize tasks and define priority levels (High, Medium, Low) that affect productivity point weights.
*   **Due Dates**: Set completion deadlines to filter tasks and trace calendar schedules.
*   **Dashboard Statistics**: Computes counts for total, completed, pending, and overdue tasks.
*   **Charts & Analytics**: Graphical visualization of task progress metrics.
*   **Calendar Features**: Grid layout of tasks sorted by due dates.
*   **Achievements System**: Automatic calculation of unlocked badges based on total task interactions.
*   **Productivity Tracking**: Accumulate points when completing tasks, with high-priority tasks granting extra points.
*   **Protected Routes**: Route protection middleware prevents unauthorized access to user tasks and profile settings.

---

## 3. Technology Stack

| Layer | Technologies | Use Case |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) | User Interface, layouts, network Fetch API requests |
| **Visualizations**| Chart.js, FontAwesome | Analytical charts, icon assets |
| **Backend** | Node.js, Express.js | API routing, custom middleware (logging, response time, roles) |
| **Database** | MongoDB Atlas, Mongoose ODM | Data models validation and collection persistence |
| **Security** | JWT, `bcrypt`, CORS | Encryption, session validation, cross-origin security |
| **Deployment** | Render | Cloud application hosting |

---

## 4. Installation & Local Setup

### Prerequisites
*   Node.js (v18.0.0 or higher recommended)
*   A MongoDB Atlas Account

### Setup Steps
1.  **Clone the Repository & Install Dependencies**:
    ```bash
    git clone https://github.com/kotamohan18-blip/todolist1.git
    cd todolist1
    npm install
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the project root:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_signing_secret_key
    NODE_ENV=development
    ```

3.  **Start the Server**:
    *   **Development Mode** (auto-restart):
        ```bash
        npm run dev
        ```
    *   **Production Mode**:
        ```bash
        npm start
        ```

4.  **Access App**:
    Open [http://localhost:5000/tasks.html](http://localhost:5000/tasks.html) in your browser.

---

## 5. Project Structure

```
todo-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose database connection setup
│   ├── controllers/
│   │   ├── achievementController.js # Achievement unlock and score tracking handlers
│   │   ├── authController.js     # User register, login, and logout handlers
│   │   ├── calendarController.js  # Retrieves user tasks for calendar display
│   │   ├── dashboardController.js # Computes dashboard progress and stats metrics
│   │   ├── taskController.js      # CRUD and duplication controllers for tasks
│   │   └── userController.js      # Profile retrieval and modification controller
│   ├── middleware/
│   │   ├── authMiddleware.js     # Decodes JWT tokens and verifies user identities
│   │   ├── errorMiddleware.js    # Formats API exceptions and stack traces
│   │   ├── loggerMiddleware.js   # Logs incoming requests to standard output
│   │   ├── responseTimeMiddleware.js # Computes API response elapsed time headers
│   │   └── roleMiddleware.js     # Validates user authorization levels
│   ├── models/
│   │   ├── Achievement.js        # Mongoose schema for productivity milestones
│   │   ├── Task.js               # Mongoose schema for user task entries
│   │   └── User.js               # Mongoose schema for user profiles and scores
│   ├── routes/
│   │   ├── achievementRoutes.js  # Maps endpoints to achievements retrieval
│   │   ├── authRoutes.js         # Maps endpoints to register/login handlers
│   │   ├── calendarRoutes.js     # Maps endpoints to calendar tasks
│   │   ├── dashboardRoutes.js    # Maps endpoints to statistics and charts APIs
│   │   ├── taskRoutes.js         # Maps endpoints to task CRUD and duplication
│   │   └── userRoutes.js         # Maps endpoints to profile management
│   └── server.js                 # Server entry setup and static file server
├── frontend/
│   ├── css/
│   │   └── style.css             # Main styling, themes, and animations
│   ├── js/
│   │   ├── achievements.js       # Unlocks panels and formats score indicators
│   │   ├── app.js                # Core API wrapper client
│   │   ├── auth.js               # User registers and login form validations
│   │   ├── calendar.js           # Renders calendar grid with tasks
│   │   ├── dashboard.js          # Renders statistics and progress charts
│   │   └── tasks.js              # Tasks list renderer and CRUD event handlers
│   ├── index.html                # Public landing page
│   ├── tasks.html                # Task management screen
│   ├── dashboard.html            # Progress statistics view
│   ├── calendar.html             # Date-sorted task calendar
│   ├── achievements.html         # Score milestone tracker screen
│   ├── login.html                # User login form
│   ├── register.html             # User registration form
│   └── profile.html              # Account edit screen
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies list and launch scripts
└── README.md                     # Documentation markdown file
```

---

## 6. Core API Endpoints

All endpoints are prefixed with `/api`. Protected routes require the header: `Authorization: Bearer <your_jwt_token>`.

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Public | Create new user profile |
| `/auth/login` | `POST` | Public | Credentials verify (returns JWT session token) |
| `/auth/logout` | `POST` | Public | Clear user session |
| `/users/profile` | `GET` / `PUT` | Protected | Retrieve / modify profile details |
| `/tasks` | `GET` | Protected | List tasks (supports `search`, `status`, `priority`, `category`, and `sort`) |
| `/tasks` | `POST` | Protected | Create new task |
| `/tasks/:id` | `GET` / `PUT` / `DELETE` | Protected | Retrieve, update, or remove a task |
| `/tasks/:id/duplicate` | `POST` | Protected | Duplicate a specific task |
| `/dashboard/stats` | `GET` | Protected | Retrieve metrics (total, pending, completed, overdue) |
| `/dashboard/charts` | `GET` | Protected | Retrieve metrics optimized for graphical rendering |
| `/calendar` | `GET` | Protected | Retrieve tasks for calendar layout |
| `/achievements` | `GET` | Protected | List user productivity milestones and scores |

---

## 7. Deployment Information

The application is deployed on **Render**, communicating with a cloud database hosted on **MongoDB Atlas**.

### Quick Deployment Steps
1.  Push the project code to your GitHub account (excluding the `.env` file).
2.  Log in to [Render](https://render.com/) and create a new **Web Service**.
3.  Connect your repository: `kotamohan18-blip/todolist1`.
4.  Configure Render environment settings:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Add the environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`) under Render's **Environment** tab.
6.  Whitelist Render's IP addresses (`0.0.0.0/0`) in MongoDB Atlas Network Access configurations.

---

## 8. Future Enhancements

*   **Subtask Support**: Add checklists to individual tasks for granular tracking.
*   **Email Reminders**: Set up automated email notifications when task due dates approach.
*   **Team Collaboration**: Enable sharing tasks and assignment details with multiple users.
*   **Recurring Tasks**: Enable auto-creation of tasks on daily, weekly, or monthly intervals.
*   **Push Notifications**: Add browser-based notifications when task states are updated.

---

## 9. License

This project is licensed under the MIT License. You are free to modify and utilize this project for personal portfolios or educational evaluations.
