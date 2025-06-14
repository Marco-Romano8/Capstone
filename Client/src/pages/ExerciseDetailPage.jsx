import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import '../assets/styles/ExerciseDetailPage.css';

export default function ExerciseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const response = await axios.get(`https://capstone-skmb.onrender.com/api/exercises/${id}`);
                setExercise(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Errore nel recupero dell\'esercizio:', err);
                if (err.response) {
                    setError(`Errore del server: ${err.response.status} - ${err.response.data.message || 'Esercizio non trovato o ID non valido.'}`);
                } else if (err.request) {
                    setError('Nessuna risposta dal server. Assicurati che il backend sia attivo e raggiungibile.');
                } else {
                    setError(`Errore: ${err.message}`);
                }
                setLoading(false);
            }
        };
        if (id) {
            fetchExercise();
        } else {
            setError("ID esercizio non fornito nell'URL.");
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <Container className="text-center mt-5 exercise-detail-page-container">
                <Spinner animation="border" role="status"><span className="visually-hidden">Caricamento dettagli esercizio...</span></Spinner>
                <p className="mt-3">Caricamento dettagli esercizio...</p>
            </Container>
        );
    }
    if (error) {
        return (
            <Container className="mt-5 exercise-detail-page-container">
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Errore nel caricamento!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => navigate('/workouts')} className="mt-3">Torna alla Libreria Esercizi</Button>
                </Alert>
            </Container>
        );
    }
    if (!exercise) {
        return (
            <Container className="mt-5 exercise-detail-page-container">
                <Alert variant="warning" className="text-center">
                    Esercizio non trovato.
                    <Button variant="outline-warning" onClick={() => navigate('/workouts')} className="mt-3">Torna alla Libreria Esercizi</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5 exercise-detail-page-container">
            <h1 className="text-center mb-5 exercise-detail-title">{exercise.name}</h1>
            <Card className="shadow-lg p-3 mb-5 bg-white rounded exercise-detail-card">
                <Card.Body>
                    <div className="d-flex flex-column flex-md-row align-items-center">
                        <div className="flex-shrink-0 me-md-4 mb-4 mb-md-0" style={{ maxWidth: '400px', width: '100%' }}>
                            <img
                                src={exercise.imageUrl || 'https://via.placeholder.com/400x300?text=Immagine+non+disponibile'}
                                alt={exercise.name}
                                className="img-fluid rounded shadow-sm exercise-detail-img"
                                style={{ maxHeight: '400px', objectFit: 'contain', width: '100%' }}
                            />
                        </div>
                        <div className="flex-grow-1 text-center text-md-start">
                            <h5 className="description-title">Muscolo Target: <span className="normal-text">{exercise.targetMuscle}</span></h5>
                            <h5 className="description-title">Equipaggiamento: <span className="normal-text">{exercise.equipment}</span></h5>
                            <h5 className="description-title">Difficoltà: <span className="normal-text">{exercise.difficulty}</span></h5>
                            <h5 className="description-title">Descrizione:</h5>
                            <Card.Text className="mb-4 exercise-description normal-text">
                                {exercise.description}
                            </Card.Text>
                            <Button variant="secondary" onClick={() => navigate(-1)} className="back-button">
                                Torna alla Libreria Esercizi
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}