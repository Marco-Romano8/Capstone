const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/workoutPlan');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, exercises } = req.body;
        const userId = req.user._id;

        if (!name || !exercises) {
            return res.status(400).json({ message: 'Nome e esercizi sono richiesti per la scheda di allenamento.' });
        }

        const newWorkoutPlan = new WorkoutPlan({
            name,
            userId,
            exercises
        });

        const savedWorkoutPlan = await newWorkoutPlan.save();
        res.status(201).json(savedWorkoutPlan);
    } catch (error) {
        console.error('Errore nella creazione della scheda di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante la creazione della scheda.' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const workoutPlans = await WorkoutPlan.find({ userId: userId })
            .populate('exercises.exercise', 'name group') 
            .sort({ createdAt: -1 });
        res.status(200).json(workoutPlans);
    } catch (error) {
        console.error('Errore nel recupero delle schede di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});


router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const workoutPlan = await WorkoutPlan.findOne({ _id: id, userId: userId })
            .populate('exercises.exercise'); 

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(workoutPlan);
    } catch (error) {
        console.error('Errore nel recupero della scheda di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { name, exercises } = req.body;

        const updatedWorkoutPlan = await WorkoutPlan.findOneAndUpdate(
            { _id: id, userId: userId },
            { name, exercises },
            { new: true }
        )
        .populate('exercises.exercise');

        if (!updatedWorkoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(updatedWorkoutPlan);
    } catch (error) {
        console.error('Errore nell\'aggiornamento della scheda di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante l\'aggiornamento.' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deletedWorkoutPlan = await WorkoutPlan.findOneAndDelete({ _id: id, userId: userId });

        if (!deletedWorkoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json({ message: 'Scheda di allenamento eliminata con successo.' });
    } catch (error) {
        console.error('Errore nell\'eliminazione della scheda di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante l\'eliminazione.' });
    }
});

module.exports = router;