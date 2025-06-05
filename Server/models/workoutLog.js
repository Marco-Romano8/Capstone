const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
    date: { type: Date, default: Date.now },
    exercisesPerformed: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
        exerciseName: { type: String, required: true },
        sets: [{
            setNumber: { type: Number, required: true }, reps: { type: Number, required: true }, weight: { type: Number, default: 0 }, notes: { type: String }
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.models.WorkoutLog || mongoose.model('WorkoutLog', workoutLogSchema);