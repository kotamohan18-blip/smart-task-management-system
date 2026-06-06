const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/duplicate', duplicateTask);

module.exports = router;
