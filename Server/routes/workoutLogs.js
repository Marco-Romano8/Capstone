const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/workoutLogController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, workoutLogController.createWorkoutLog);
router.get('/', authMiddleware, workoutLogController.getUserWorkoutLogs);
router.get('/:id', authMiddleware, workoutLogController.getWorkoutLogById);
router.put('/:id', authMiddleware, workoutLogController.updateWorkoutLog);
router.delete('/:id', authMiddleware, workoutLogController.deleteWorkoutLog);

module.exports = router;