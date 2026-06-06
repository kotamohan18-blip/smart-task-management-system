const Task = require('../models/Task');
const User = require('../models/User');

// Helper for start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayBounds = getDayBounds(now);
    
    // Get total tasks
    const totalTasks = await Task.countDocuments({ userId });

    // Get completed tasks
    const completedTasks = await Task.countDocuments({
      userId,
      status: 'Completed',
    });

    // Get pending tasks (Pending or In Progress)
    const pendingTasks = await Task.countDocuments({
      userId,
      status: { $in: ['Pending', 'In Progress'] },
    });

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      userId,
      status: { $in: ['Pending', 'In Progress'] },
      dueDate: { $lt: todayBounds.start },
    });

    // Today's tasks
    const todaysTasks = await Task.countDocuments({
      userId,
      dueDate: { $gte: todayBounds.start, $lte: todayBounds.end }
    });

    // This Week's tasks
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Saturday
    weekEnd.setHours(23,59,59,999);

    const weeksTasks = await Task.countDocuments({
      userId,
      dueDate: { $gte: weekStart, $lte: weekEnd }
    });

    // Calculate completion percentage
    let completionPercentage = 0;
    if (totalTasks > 0) {
      completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    }

    // Update streak (basic logic, can be improved to run daily via cron job)
    const user = await User.findById(userId);
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const diffTime = Math.abs(now - lastLogin);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.streak += 1;
        if (user.streak > user.bestStreak) user.bestStreak = user.streak;
      } else if (diffDays > 1) {
        user.streak = 1; // Reset streak if missed a day
      }
    } else {
      user.streak = 1;
    }
    user.lastLoginDate = now;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        todaysTasks,
        weeksTasks,
        completionPercentage,
        streak: user.streak,
        bestStreak: user.bestStreak,
        productivityScore: user.productivityScore
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart statistics
// @route   GET /api/dashboard/charts
// @access  Private
const getChartStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Completion Status (Pie Chart)
    const statusCounts = await Task.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Tasks by Category (Bar Chart)
    const categoryCounts = await Task.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // 3. Weekly Productivity (Line Chart - Last 7 days completion)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyCompletion = await Task.aggregate([
      { 
        $match: { 
          userId: userId, 
          status: 'Completed',
          updatedAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusCounts,
        categoryCounts,
        weeklyCompletion
      }
    });
  } catch(error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getChartStats
};
