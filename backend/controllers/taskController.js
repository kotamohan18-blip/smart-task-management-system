const Task = require('../models/Task');
const User = require('../models/User');
const { checkAchievements } = require('./achievementController');

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const queryObj = { userId: req.user._id };

    // Search by title or description
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) queryObj.status = req.query.status;
    if (req.query.priority) queryObj.priority = req.query.priority;
    if (req.query.category) queryObj.category = req.query.category;

    let query = Task.find(queryObj);

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort
    }

    const tasks = await query;

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this task');
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    req.body.userId = req.user._id;

    if (!req.body.title || !req.body.dueDate) {
      res.status(400);
      throw new Error('Please provide title and due date');
    }

    const task = await Task.create(req.body);

    // Achievement Check
    const totalTasks = await Task.countDocuments({ userId: req.user._id });
    await checkAchievements(req.user._id, 'CREATE_TASK', { totalTasks });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this task');
    }

    // Check if status is changing to Completed
    const wasCompleted = task.status === 'Completed';
    
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    const isNowCompleted = task.status === 'Completed';

    if (!wasCompleted && isNowCompleted) {
      // Award productivity points
      const user = await User.findById(req.user._id);
      let points = 10;
      if (task.priority === 'High') points = 20;
      if (task.priority === 'Low') points = 5;
      user.productivityScore += points;
      await user.save();

      // Achievement Check
      const completedTasks = await Task.countDocuments({ userId: req.user._id, status: 'Completed' });
      await checkAchievements(req.user._id, 'COMPLETE_TASK', { completedTasks });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this task');
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate task
// @route   POST /api/tasks/:id/duplicate
// @access  Private
const duplicateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to duplicate this task');
    }

    const newTaskData = task.toObject();
    delete newTaskData._id;
    delete newTaskData.createdAt;
    delete newTaskData.updatedAt;
    newTaskData.title = `${newTaskData.title} (Copy)`;
    newTaskData.status = 'Pending';

    const newTask = await Task.create(newTaskData);

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask
};
