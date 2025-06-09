const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema(
    {
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
        sets: { type: Number, required: true, min: 1 },
        reps: { type: Number, required: true, min: 1 },
        kg: { type: Number, required: false, min: 0, default: 0 },
        restTimeSeconds: { type: Number, required: false, min: 0, default: 60 }
    }
);

const workoutPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        exercises: [workoutExerciseSchema]
    }, { timestamps: true });


module.exports = mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema);