const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom Middleware
const requestLogger = require('./middleware/loggerMiddleware');
const responseTime = require('./middleware/responseTimeMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

app.use(requestLogger);
app.use(responseTime);

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/achievements', achievementRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Invalid Route Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
