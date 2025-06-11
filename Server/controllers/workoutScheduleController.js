const WorkoutSchedule = require('../models/workoutSchedule');
const WorkoutPlan = require('../models/workoutPlan');

exports.createWorkoutSchedule = async (req, res) => {
    try {
        const { date, endDate, workoutPlanId } = req.body;
        const userId = req.user._id;

        if (!date || !workoutPlanId) {
            return res.status(400).json({ message: 'Data di inizio e ID della scheda di allenamento sono richiesti.' });
        }

        const existingSchedule = await WorkoutSchedule.findOne({ userId, date: new Date(date) });
        if (existingSchedule) {
            return res.status(409).json({ message: 'Un allenamento è già programmato per questa data di inizio.' });
        }

        const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
        if (!workoutPlan || workoutPlan.userId.toString() !== userId.toString()) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        const newWorkoutSchedule = new WorkoutSchedule({
            userId,
            date: new Date(date),
            endDate: endDate ? new Date(endDate) : undefined,
            workoutPlanId,
            workoutPlanName: workoutPlan.name
        });

        const savedSchedule = await newWorkoutSchedule.save();
        res.status(201).json(savedSchedule);
    } catch (error) {
        console.error('Errore nella creazione della programmazione allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante la creazione della programmazione.' });
    }
};

exports.getWorkoutSchedules = async (req, res) => {
    try {
        const userId = req.user._id;
        const workoutSchedules = await WorkoutSchedule.find({ userId })
            .populate('workoutPlanId', 'name color');

        res.status(200).json(workoutSchedules);
    } catch (error) {
        console.error('Errore nel recupero delle programmazioni allenamenti:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

exports.getWorkoutScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const workoutSchedule = await WorkoutSchedule.findOne({ _id: id, userId })
            .populate('workoutPlanId');

        if (!workoutSchedule) {
            return res.status(404).json({ message: 'Programmazione allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(workoutSchedule);
    } catch (error) {
        console.error('Errore nel recupero della programmazione allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server.' });
    }
};

exports.updateWorkoutSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { date, endDate, workoutPlanId } = req.body;

        if (!date || !workoutPlanId) {
            return res.status(400).json({ message: 'Data di inizio e ID della scheda di allenamento sono richiesti.' });
        }

        const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
        if (!workoutPlan || workoutPlan.userId.toString() !== userId.toString()) {
            return res.status(404).json({ message: 'Scheda di allenamento non trovata o non autorizzato.' });
        }

        const updatedSchedule = await WorkoutSchedule.findOneAndUpdate(
            { _id: id, userId },
            { 
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : undefined,
                workoutPlanId, 
                workoutPlanName: workoutPlan.name 
            },
            { new: true, runValidators: true }
        );

        if (!updatedSchedule) {
            return res.status(404).json({ message: 'Programmazione allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json(updatedSchedule);
    } catch (error) {
        console.error('Errore nell\'aggiornamento della programmazione allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante l\'aggiornamento.' });
    }
};

exports.deleteWorkoutSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const deletedWorkoutSchedule = await WorkoutSchedule.findOneAndDelete({ _id: id, userId });

        if (!deletedWorkoutSchedule) {
            return res.status(404).json({ message: 'Programmazione allenamento non trovata o non autorizzato.' });
        }

        res.status(200).json({ message: 'Programmazione allenamento eliminata con successo.' });
    } catch (error) {
        console.error('Errore nell\'eliminazione della programmazione allenamento:', error);
        res.status(500).json({ message: 'Errore interno del server durante l\'eliminazione.' });
    }
};