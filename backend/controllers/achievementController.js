const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get user achievements
// @route   GET /api/achievements
// @access  Private
const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    next(error);
  }
};

// Check and award achievements (Internal helper)
const checkAchievements = async (userId, action, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let newAchievement = null;

    if (action === 'CREATE_TASK') {
      const taskCount = data.totalTasks;
      if (taskCount === 1) {
        newAchievement = { name: 'First Step', description: 'Created your first task', badgeIcon: '🏆' };
      } else if (taskCount === 50) {
        newAchievement = { name: 'Task Master', description: 'Created 50 tasks', badgeIcon: '📝' };
      }
    } else if (action === 'COMPLETE_TASK') {
      const completedCount = data.completedTasks;
      if (completedCount === 1) {
        newAchievement = { name: 'Getting Things Done', description: 'Completed your first task', badgeIcon: '✅' };
      } else if (completedCount === 50) {
        newAchievement = { name: 'Half Century', description: 'Completed 50 tasks', badgeIcon: '⚡' };
      }
    } else if (action === 'STREAK') {
      const streak = user.streak;
      if (streak === 7) {
        newAchievement = { name: 'On Fire', description: '7 Day Productivity Streak', badgeIcon: '🔥' };
      } else if (streak === 30) {
        newAchievement = { name: 'Unstoppable', description: '30 Day Productivity Streak', badgeIcon: '⭐' };
      }
    }

    if (newAchievement) {
      // Check if already has it
      const exists = await Achievement.findOne({ userId, name: newAchievement.name });
      if (!exists) {
        await Achievement.create({ ...newAchievement, userId });
        // Can add logic to notify user via websockets or just let polling handle it
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

module.exports = {
  getAchievements,
  checkAchievements,
};
