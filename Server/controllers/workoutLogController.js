const WorkoutLog = require('../models/workoutLog');
const mongoose = require('mongoose');

const createWorkoutLog = async (req, res) => {
    try {
        const userId = req.user._id;
        const { workoutPlanId, exercisesPerformed } = req.body;

        if (!workoutPlanId || !mongoose.Types.ObjectId.isValid(workoutPlanId)) {
            return res.status(400).json({ message: 'ID della scheda di allenamento non valido o mancante.' });
        }
        if (!exercisesPerformed || !Array.isArray(exercisesPerformed) || exercisesPerformed.length === 0) {
            return res.status(400).json({ message: 'Esercizi registrati mancanti o in formato non valido.' });
        }

        for (const ex of exercisesPerformed) {
            if (!ex.exerciseId || !mongoose.Types.ObjectId.isValid(ex.exerciseId)) {
                return res.status(400).json({ message: 'ID esercizio non valido o mancante in un esercizio registrato.' });
            }
            if (!ex.exerciseName || typeof ex.exerciseName !== 'string') {
                return res.status(400).json({ message: 'Nome esercizio non valido o mancante in un esercizio registrato.' });
            }
            if (!ex.sets || !Array.isArray(ex.sets) || ex.sets.length === 0) {
                return res.status(400).json({ message: `Set mancanti o in formato non valido per l'esercizio ${ex.exerciseName}.` });
            }
            for (const set of ex.sets) {
                if (typeof set.setNumber !== 'number' || set.setNumber <= 0) {
                    return res.status(400).json({ message: `Numero set non valido per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
                const parsedReps = parseInt(set.reps);
                const parsedWeight = parseFloat(set.weight);

                if (isNaN(parsedReps) || parsedReps < 0) {
                    return res.status(400).json({ message: `Ripetizioni non valide per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
                if (isNaN(parsedWeight) || parsedWeight < 0) {
                    return res.status(400).json({ message: `Peso non valido per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
            }
        }

        const newWorkoutLog = new WorkoutLog({
            userId: userId,
            workoutPlanId: workoutPlanId,
            exercisesPerformed: exercisesPerformed
        });

        const savedWorkoutLog = await newWorkoutLog.save();

        res.status(201).json(savedWorkoutLog);

    } catch (err) {
        console.error('Errore nella creazione del log di allenamento:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Errore di validazione nel log di allenamento', errors: messages });
        }
        res.status(500).json({ message: 'Errore interno del server durante la creazione del log di allenamento.', error: err.message });
    }
};

const getUserWorkoutLogs = async (req, res) => {
    try {
        const userId = req.user._id;
        const workoutLogs = await WorkoutLog.find({ userId: userId })
            .populate('workoutPlanId', 'name')
            .sort({ date: -1 });

        res.status(200).json(workoutLogs);
    } catch (error) {
        console.error('Errore nel recupero dei log di allenamento dell\'utente:', error);
        res.status(500).json({ message: 'Errore interno del server durante il recupero dei log.' });
    }
};

const getWorkoutLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const workoutLog = await WorkoutLog.findOne({ _id: id, userId: userId })
            .populate('workoutPlanId', 'name')
            .populate('exercisesPerformed.exerciseId', 'name group'); 

        if (!workoutLog) {
            return res.status(404).json({ message: 'Log di allenamento non trovato o non autorizzato.' });
        }

        res.status(200).json(workoutLog);
    } catch (error) {
        console.error('Errore nel recupero del singolo log di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

const updateWorkoutLog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { workoutPlanId, exercisesPerformed } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID del log di allenamento non valido.' });
        }

        const workoutLog = await WorkoutLog.findOne({ _id: id, userId: userId });

        if (!workoutLog) {
            return res.status(404).json({ message: 'Log di allenamento non trovato o non autorizzato.' });
        }

        if (!workoutPlanId || !mongoose.Types.ObjectId.isValid(workoutPlanId)) {
            return res.status(400).json({ message: 'ID della scheda di allenamento non valido o mancante.' });
        }
        if (!exercisesPerformed || !Array.isArray(exercisesPerformed) || exercisesPerformed.length === 0) {
            return res.status(400).json({ message: 'Esercizi registrati mancanti o in formato non valido.' });
        }

        for (const ex of exercisesPerformed) {
            if (!ex.exerciseId || !mongoose.Types.ObjectId.isValid(ex.exerciseId)) {
                return res.status(400).json({ message: 'ID esercizio non valido o mancante in un esercizio registrato.' });
            }
            if (!ex.exerciseName || typeof ex.exerciseName !== 'string') {
                return res.status(400).json({ message: 'Nome esercizio non valido o mancante in un esercizio registrato.' });
            }
            if (!ex.sets || !Array.isArray(ex.sets) || ex.sets.length === 0) {
                return res.status(400).json({ message: `Set mancanti o in formato non valido per l'esercizio ${ex.exerciseName}.` });
            }
            for (const set of ex.sets) {
                if (typeof set.setNumber !== 'number' || set.setNumber <= 0) {
                    return res.status(400).json({ message: `Numero set non valido per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
                const parsedReps = parseInt(set.reps);
                const parsedWeight = parseFloat(set.weight);

                if (isNaN(parsedReps) || parsedReps < 0) {
                    return res.status(400).json({ message: `Ripetizioni non valide per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
                if (isNaN(parsedWeight) || parsedWeight < 0) {
                    return res.status(400).json({ message: `Peso non valido per l'esercizio ${ex.exerciseName}, set ${set.setNumber}.` });
                }
            }
        }

        workoutLog.workoutPlanId = workoutPlanId;
        workoutLog.exercisesPerformed = exercisesPerformed;

        const updatedWorkoutLog = await workoutLog.save();

        const fullyPopulatedLog = await WorkoutLog.findById(updatedWorkoutLog._id)
            .populate('workoutPlanId', 'name')
            .populate('exercisesPerformed.exerciseId', 'name group');


        res.status(200).json(fullyPopulatedLog);

    } catch (err) {
        console.error('Errore nell\'aggiornamento del log di allenamento:', err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: 'Errore di validazione nell\'aggiornamento del log di allenamento', errors: messages });
        }
        res.status(500).json({ message: 'Errore interno del server durante l\'aggiornamento del log di allenamento.', error: err.message });
    }
};

const deleteWorkoutLog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID del log di allenamento non valido.' });
        }

        const deletedWorkoutLog = await WorkoutLog.findOneAndDelete({ _id: id, userId: userId });

        if (!deletedWorkoutLog) {
            return res.status(404).json({ message: 'Log di allenamento non trovato o non autorizzato.' });
        }

        res.status(200).json({ message: 'Log di allenamento eliminato con successo.' });

    } catch (error) {
        console.error('Errore nell\'eliminazione del log di allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante l\'eliminazione del log.' });
    }
};


module.exports = {createWorkoutLog, getUserWorkoutLogs, getWorkoutLogById, updateWorkoutLog, deleteWorkoutLog};