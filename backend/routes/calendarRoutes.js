const express = require('express');
const { getCalendarTasks } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCalendarTasks);

module.exports = router;
