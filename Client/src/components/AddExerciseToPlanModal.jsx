import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FormControl, ListGroup, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import '../assets/styles/AddExerciseToPlanModal.css';

export default function AddExerciseToPlanModal({ show, handleClose, onAddExercise, currentPlanExercises = [] }) {
    const [allExercises, setAllExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);
    const [kg, setKg] = useState(0);

    useEffect(() => {
        const fetchAllExercises = async () => {
            setLoading(true);
            setError(null);
            const userLogin = localStorage.getItem("userLogin");
            try {
                const response = await axios.get('http://localhost:3001/api/exercises', {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setAllExercises(response.data);
                setFilteredExercises(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Errore nel recupero di tutti gli esercizi:', err);
                setError('Impossibile caricare gli esercizi. Riprova più tardi.');
                setLoading(false);
            }
        };

        if (show) {
            fetchAllExercises();
            setSelectedExercise(null);
            setSets(3);
            setReps(10);
            setKg(0);
            setSearchTerm('');
        }
    }, [show]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const newFiltered = allExercises.filter(exercise =>
            exercise.name.toLowerCase().includes(lowercasedSearchTerm) &&
            !currentPlanExercises.some(planExercise => planExercise && planExercise.exercise && planExercise.exercise._id === exercise._id)
        );
        setFilteredExercises(newFiltered);
    }, [searchTerm, allExercises, currentPlanExercises]);

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setSets(3);
        setReps(10);
        setKg(0);
    };

    const handleAddSelectedExercise = () => {
        const parsedSets = parseInt(sets);
        const parsedReps = parseInt(reps);
        const parsedKg = parseFloat(kg);

        if (selectedExercise && parsedSets > 0 && parsedReps > 0 && !isNaN(parsedKg)) {
            onAddExercise({
                exercise: selectedExercise,
                sets: parsedSets,
                reps: parsedReps,
                kg: parsedKg
            });
            setSelectedExercise(null);
            setSets(3);
            setReps(10);
            setKg(0);
            setSearchTerm('');
            handleClose();
        } else {
            alert('Seleziona un esercizio e inserisci valori validi per serie, ripetizioni (devono essere maggiori di 0) e kg.');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="add-exercise-modal">
            <Modal.Header closeButton>
                <Modal.Title>Aggiungi Esercizio alla Scheda</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3">
                    <FormControl
                        type="text"
                        placeholder="Cerca esercizio per nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>

                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" />
                        <p>Caricamento esercizi...</p>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Nessun esercizio trovato o tutti gli esercizi disponibili sono già stati aggiunti.
                    </Alert>
                ) : (
                    <div className="exercise-list-container">
                        <ListGroup variant="flush">
                            {filteredExercises.map(exercise => (
                                <ListGroup.Item
                                    key={exercise._id}
                                    action
                                    onClick={() => handleSelectExercise(exercise)}
                                    className={selectedExercise && selectedExercise._id === exercise._id ? 'active' : ''}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{exercise.name} <small className="text-muted">({exercise.targetMuscle})</small></span>
                                        {selectedExercise && selectedExercise._id === exercise._id && (
                                            <i className="bi bi-check-circle-fill"></i>
                                        )}
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                )}

                {selectedExercise && (
                    <Card className="mt-4 p-3 selected-exercise-card">
                        <Card.Body>
                            <Card.Title>{selectedExercise.name}</Card.Title>
                            <Card.Text>Muscolo: {selectedExercise.targetMuscle}</Card.Text>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Label>Serie:</Form.Label>
                                    <FormControl
                                        type="number"
                                        min="1"
                                        value={sets}
                                        onChange={(e) => setSets(parseInt(e.target.value) || 1)}
                                        required
                                    />
                                </Col>
                                <Col>
                                    <Form.Label>Ripetizioni:</Form.Label>
                                    <FormControl
                                        type="number"
                                        min="1"
                                        value={reps}
                                        onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                                        required
                                    />
                                </Col>
                                <Col>
                                    <Form.Label>Kg:</Form.Label>
                                    <FormControl
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={kg}
                                        onChange={(e) => setKg(parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Annulla
                </Button>
                <Button variant="primary" onClick={handleAddSelectedExercise} disabled={!selectedExercise || sets <= 0 || reps <= 0}>
                    Aggiungi Esercizio alla Scheda
                </Button>
            </Modal.Footer>
        </Modal>
    );
}