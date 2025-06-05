const WorkoutPlan = require('../models/workoutPlan');
const mongoose = require('mongoose');

const getUserWorkoutPlans = async (req, res) => {
    try {
        const userId = req.user._id;
        const workoutPlans = await WorkoutPlan.find({ user: userId }).populate('exercises.exercise');
        res.status(200).json(workoutPlans);
    } catch (err) {
        console.error('Errore nel recupero delle schede di allenamento:', err);
        res.status(500).json({ message: 'Errore del server nel recupero delle schede di allenamento', error: err.message });
    }
};

const createWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, exercises } = req.body;

        if (!name || !userId) {
            return res.status(400).json({ message: 'Nome della scheda e ID utente sono obbligatori.' });
        }

        if (exercises && exercises.length > 0) {
            for (let item of exercises) {
                if (!item.exercise || !mongoose.Types.ObjectId.isValid(item.exercise) || !item.sets || !item.reps) {
                    return res.status(400).json({ message: 'Ogni esercizio nella scheda deve avere un ID valido, serie e ripetizioni.' });
                }
                if (item.kg !== undefined && typeof item.kg !== 'number') {
                     return res.status(400).json({ message: 'Il campo "kg" deve essere un numero valido per ogni esercizio.' });
                }
            }
        }

        const newWorkoutPlan = new WorkoutPlan({
            name,
            user: userId,
            exercises: exercises || []
        });

        const savedWorkoutPlan = await newWorkoutPlan.save();
        const populatedWorkoutPlan = await WorkoutPlan.findById(savedWorkoutPlan._id).populate('exercises.exercise');

        res.status(201).json(populatedWorkoutPlan);
    } catch (err) {
        console.error('Errore nella creazione della scheda di allenamento:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Errore di validazione', errors: messages });
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Una scheda di allenamento con questo nome esiste già.' });
        }
        res.status(500).json({ message: 'Errore del server nella creazione della scheda di allenamento', error: err.message });
    }
};

const getWorkoutPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID scheda di allenamento non valido.' });
        }

        const workoutPlan = await WorkoutPlan.findOne({ _id: id, user: userId }).populate('exercises.exercise');

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(workoutPlan);
    } catch (err) {
        console.error('Errore nel recupero della scheda di allenamento per ID:', err);
        res.status(500).json({ message: 'Errore del server nel recupero della scheda di allenamento', error: err.message });
    }
};

const updateWorkoutPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { name, exercises } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID scheda di allenamento non valido.' });
        }

        if (exercises && exercises.length > 0) {
            for (let item of exercises) {
                if (!item.exercise || !mongoose.Types.ObjectId.isValid(item.exercise) || !item.sets || !item.reps) {
                    return res.status(400).json({ message: 'Ogni esercizio nella scheda deve avere un ID valido, serie e ripetizioni.' });
                }
                if (item.kg !== undefined && typeof item.kg !== 'number') {
                     return res.status(400).json({ message: 'Il campo "kg" deve essere un numero valido per ogni esercizio.' });
                }
            }
        }
        const updatedWorkoutPlan = await WorkoutPlan.findOneAndUpdate(
            { _id: id, user: userId },
            { name, exercises },
            { new: true, runValidators: true }
        ).populate('exercises.exercise');

        if (!updatedWorkoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(updatedWorkoutPlan);
    } catch (err) {
        console.error('Errore nell\'aggiornamento della scheda di allenamento:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Errore di validazione', errors: messages });
        }
        res.status(500).json({ message: 'Errore del server nell\'aggiornamento della scheda di allenamento', error: err.message });
    }
};

const deleteWorkoutPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID scheda di allenamento non valido.' });
        }

        const deletedWorkoutPlan = await WorkoutPlan.findOneAndDelete({ _id: id, user: userId });

        if (!deletedWorkoutPlan) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato a eliminarla.' });
        }

        res.status(200).json({ message: 'Scheda di allenamento eliminata con successo.', id: deletedWorkoutPlan._id });
    } catch (err) {
        console.error('Errore nell\'eliminazione della scheda di allenamento:', err);
        res.status(500).json({ message: 'Errore del server nell\'eliminazione della scheda di allenamento', error: err.message });
    }
};

module.exports = { getUserWorkoutPlans, createWorkoutPlan, getWorkoutPlanById, updateWorkoutPlan, deleteWorkoutPlan, };