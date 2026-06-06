const Task = require('../models/Task');

// @desc    Get tasks grouped by date for calendar
// @route   GET /api/calendar
// @access  Private
const getCalendarTasks = async (req, res, next) => {
  try {
    const { start, end } = req.query; // Expecting ISO date strings
    
    let query = { userId: req.user._id };
    
    if (start && end) {
      query.dueDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const tasks = await Task.find(query).sort('dueDate dueTime');

    // Group tasks by date string (YYYY-MM-DD)
    const groupedTasks = tasks.reduce((acc, task) => {
      const dateStr = task.dueDate.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(task);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedTasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCalendarTasks,
};
