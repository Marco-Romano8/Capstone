const mongoose = require('mongoose');

const workoutScheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        unique: true
    },
    workoutPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkoutPlan',
        required: true
    },
    workoutPlanName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

workoutScheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutSchedule', workoutScheduleSchema);