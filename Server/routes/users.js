// Importo le dipendenze necessarie per il progetto
const express = require('express');
const router = express.Router();

// Import Model
const userModel = require('../models/users');
const WorkoutPlan = require('../models/WorkoutPlan'); // Importa il modello WorkoutPlan
const WorkoutLog = require('../models/WorkoutLog');   // Importa il modello WorkoutLog

// Import Middleware
const authMiddleware = require('../middlewares/authMiddleware');

// Users Routes
router.get('/', (req, res) => {
    return res.status(200).json({ message: "Hello World!!" });
});

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const allUsers = await userModel.find();
        return res.status(200).json(allUsers);
    } catch (error) {
        console.error("Errore nel recupero di tutti gli utenti:", error);
        res.status(500).json({ message: 'Errore interno del server durante il recupero degli utenti.' });
    }
});

router.get('/dashboard-summary', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const username = req.user.username;
        const totalPlans = await WorkoutPlan.countDocuments({ userId: userId });
        const totalWorkouts = await WorkoutLog.countDocuments({ userId: userId });
        const lastWorkout = await WorkoutLog.findOne({ userId: userId }).sort({ date: -1 }).populate('workoutPlanId', 'name').exec();

        const summaryData = {
            username: username,
            totalPlans: totalPlans,
            totalWorkouts: totalWorkouts,
            lastWorkoutDate: lastWorkout ? lastWorkout.date : null,
            lastWorkoutName: lastWorkout && lastWorkout.workoutPlanId ? lastWorkout.workoutPlanId.name : null,
            lastWorkoutId: lastWorkout ? lastWorkout._id : null
        };

        res.status(200).json(summaryData);

    } catch (error) {
        console.error('Errore nel recupero del sommario della dashboard:', error);
        res.status(500).json({ message: 'Errore interno del server durante il recupero dei dati della dashboard.' });
    }
});

// Export Router
module.exports = router;