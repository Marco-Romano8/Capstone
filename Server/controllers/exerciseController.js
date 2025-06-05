const Exercise = require('../models/exercise');

exports.getAllExercises = async (req, res) => {
    try {
        const exercises = await Exercise.find({});
        res.status(200).json(exercises);
    } catch (error) {
        console.error('Errore nel recupero degli esercizi:', error);
        res.status(500).json({ message: 'Errore del server nel recupero degli esercizi', error: error.message });
    }
};


exports.getExerciseById = async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id); // Cerca un esercizio per ID

        if (!exercise) {
            return res.status(404).json({ message: 'Esercizio non trovato' });
        }

        res.status(200).json(exercise); // Invia l'esercizio trovato
    } catch (error) {
        console.error('Errore nel recupero dell\'esercizio:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID esercizio non valido' });
        }
        res.status(500).json({ message: 'Errore del server nel recupero dell\'esercizio', error: error.message });
    }
};

exports.createExercise = async (req, res) => {
    const { name, targetMuscle, equipment, imageUrl, description, difficulty } = req.body;

    if (!name || !targetMuscle || !equipment || !imageUrl) {
        return res.status(400).json({ message: 'Per favore, inserisci tutti i campi obbligatori: nome, muscolo target, equipaggiamento, URL immagine.' });
    }

    try {
        // Crea una nuova istanza del modello Exercise
        const newExercise = new Exercise({
            name,
            targetMuscle,
            equipment,
            imageUrl,
            description,
            difficulty
        });

        // Salva il nuovo esercizio nel database
        const savedExercise = await newExercise.save();
        res.status(201).json(savedExercise);
    } catch (error) {
        console.error('Errore nella creazione dell\'esercizio:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Esercizio con questo nome esiste già. Il nome dell\'esercizio deve essere unico.' });
        }
        res.status(500).json({ message: 'Errore del server nella creazione dell\'esercizio', error: error.message });
    }
};

