const express = require('express');
const { getDashboardStats, getChartStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/charts', protect, getChartStats);

module.exports = router;
