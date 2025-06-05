const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        targetMuscle: { type: String, required: true, enum: ['Petto', 'Schiena', 'Gambe', 'Spalle', 'Braccia (Bicipiti)', 'Braccia (Tricipiti)', 'Core', 'Glutei', 'Addominali', 'Polpacci', 'Avambracci', 'Corpo Intero', 'Cardio', 'Gambe (Quadricipiti, Glutei)', 'Corpo Intero (Schiena, Gambe, Glutei, Avambracci)', 'Schiena (Dorsali)', 'Petto (Superiore)', 'Petto (Inferiore)', 'Spalle (Trapezio)', 'Spalle (Deltoidi Posteriori)', 'Schiena (Lombari)', 'Femorali', 'Femorali, Glutei', 'Gambe (Unilaterale)', 'Core (Obliqui)', 'Corpo Intero, Presa', 'Gambe, Glutei, Core', 'Corpo Intero, Cardio', 'Gambe, Glutei', 'Femorali, Glutei, Schiena Bassa', 'Schiena (parte superiore)', 'Petto, Tricipiti', 'Schiena (Dorsali), Bicipiti', 'Spalle (Deltoidi Posteriori), Parte Alta Schiena', 'Braccia (Bicipiti, Brachiali)', 'Gambe (Quadricipiti, Glutei, Femorali)', 'Gambe (Femorali)', 'Gambe (Quadricipiti)'], trim: true },
        equipment: { type: String, required: true, enum: ['Nessuno', 'Manubri', 'Bilanciere', 'Kettlebell', 'Macchine', 'Banda Elastica', 'Sbarra', 'Panca', 'Cavo', 'Corda', 'Box', 'Bilanciere, Panca', 'Sbarra per trazioni', 'Leg Press Machine', 'Leg Curl Machine', 'Leg Extension Machine', 'Macchina Cavi', 'Manubri, Panca', 'Manubri, Panca Inclinata', 'Bilanciere, Panca Declinata', 'Bilanciere, Panca Scott', 'Bilanciere EZ, Panca', 'Pec Deck Machine', 'Hyperextension Bench', 'GHR Machine', 'Ruota per addominali', 'Manubri o Kettlebell pesanti', 'Slitta da spinta', 'Corde da battaglia', 'Bilanciere, Box', 'Bilanciere, Rack', 'Parallele', 'Sbarra per trazioni, Pesi', 'Manubrio, Panca', 'T-Bar Machine', 'Shoulder Press Machine', 'Macchina Cavi (Corda)', 'Abdominal Machine', 'Kettlebell o Manubrio', 'Seated Calf Machine', 'Calf Machine'], trim: true },
        imageUrl: { type: String, required: true },
        description: { type: String, trim: true, default: '' },
        difficulty: { type: String, enum: ['Principiante', 'Intermedio', 'Avanzato'], default: 'Intermedio' },
    }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;