const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');

// Rotta per ottenere tutti gli esercizi
router.get('/', exerciseController.getAllExercises);

// Rotta per ottenere un singolo esercizio per ID
router.get('/:id', exerciseController.getExerciseById);

// Rotta per creare un nuovo esercizio
router.post('/', exerciseController.createExercise);

module.exports = router;