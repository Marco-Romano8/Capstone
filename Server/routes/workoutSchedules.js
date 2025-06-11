const express = require('express');
const router = express.Router();
const workoutScheduleController = require('../controllers/workoutScheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, workoutScheduleController.createWorkoutSchedule);
router.get('/', authMiddleware, workoutScheduleController.getWorkoutSchedules);
router.get('/:id', authMiddleware, workoutScheduleController.getWorkoutScheduleById);
router.put('/:id', authMiddleware, workoutScheduleController.updateWorkoutSchedule);
router.delete('/:id', authMiddleware, workoutScheduleController.deleteWorkoutSchedule);

module.exports = router;