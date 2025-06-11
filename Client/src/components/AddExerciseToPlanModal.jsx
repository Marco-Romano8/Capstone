import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, FormControl, ListGroup, Spinner, Alert, Row, Col, Card, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import '../assets/styles/AddExerciseToPlanModal.css';

export default function AddExerciseToPlanModal({ show, handleClose, onAddExercise, currentPlanExercises = [] }) {
    const [allExercises, setAllExercises] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('');
    const [uniqueMuscles, setUniqueMuscles] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [kg, setKg] = useState('');
    const [restTimeSeconds, setRestTimeSeconds] = useState('');

    useEffect(() => {
        const fetchAllExercises = async () => {
            setLoading(true);
            setError(null);
            const userLogin = localStorage.getItem("userLogin");
            try {
                const response = await axios.get('https://capstone-skmb.onrender.com/api/exercises', {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setAllExercises(response.data);
                setUniqueMuscles(['Tutti', ...new Set(response.data.map(ex => ex.targetMuscle))].sort());
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
            setSets(''); setReps(''); setKg(''); setRestTimeSeconds('');
            setSearchTerm(''); setFilterMuscle('');
        }
    }, [show]);

    useEffect(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        setFilteredExercises(allExercises.filter(exercise => {
            const matchesSearchTerm = exercise.name.toLowerCase().includes(lowercasedSearchTerm);
            const matchesMuscleFilter = filterMuscle === '' || filterMuscle === 'Tutti' || exercise.targetMuscle === filterMuscle;
            const notInCurrentPlan = !currentPlanExercises.some(planExercise => planExercise?.exercise?._id === exercise._id);
            return matchesSearchTerm && matchesMuscleFilter && notInCurrentPlan;
        }));
    }, [searchTerm, filterMuscle, allExercises, currentPlanExercises]);

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setSets(3); setReps(10); setKg(0); setRestTimeSeconds(60);
    };

    const handleAddSelectedExercise = () => {
        const parsedSets = parseInt(sets);
        const parsedReps = parseInt(reps);
        const parsedKg = parseFloat(kg);
        const parsedRestTime = parseInt(restTimeSeconds);

        if (selectedExercise && parsedSets > 0 && parsedReps > 0 && !isNaN(parsedKg) && parsedRestTime >= 0) {
            onAddExercise({
                exercise: selectedExercise,
                sets: parsedSets,
                reps: parsedReps,
                kg: parsedKg,
                restTimeSeconds: parsedRestTime
            });
            handleClose();
        } else {
            alert('Seleziona un esercizio e inserisci valori validi per serie, ripetizioni (devono essere numeri interi positivi), kg (numero) e tempo di recupero (numero non negativo).');
        }
    };

    const isAddButtonDisabled = !selectedExercise ||
        isNaN(parseInt(sets)) || parseInt(sets) <= 0 ||
        isNaN(parseInt(reps)) || parseInt(reps) <= 0 ||
        isNaN(parseFloat(kg)) ||
        isNaN(parseInt(restTimeSeconds)) || parseInt(restTimeSeconds) < 0;

    const renderExerciseList = () => {
        if (loading) {
            return (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Caricamento esercizi...</p>
                </div>
            );
        }
        if (filteredExercises.length === 0) {
            return (
                <Alert variant="info" className="text-center">
                    Nessun esercizio trovato o tutti gli esercizi disponibili sono già stati aggiunti.
                </Alert>
            );
        }
        return (
            <div className="exercise-list-container">
                <ListGroup variant="flush">
                    {filteredExercises.map(exercise => (
                        <ListGroup.Item
                            key={exercise._id}
                            action
                            onClick={() => handleSelectExercise(exercise)}
                            className={selectedExercise?._id === exercise._id ? 'active' : ''}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="exercise-name-text">
                                    {exercise.name} <small className="text-muted">({exercise.targetMuscle})</small>
                                </span>
                                {selectedExercise?._id === exercise._id && (
                                    <i className="bi bi-check-circle-fill"></i>
                                )}
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="add-exercise-modal">
            <Modal.Header closeButton>
                <Modal.Title>Aggiungi Esercizio alla Scheda</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Row className="mb-3">
                    <Col xs={12} md={8}>
                        <Form.Group>
                            <FormControl
                                type="text"
                                placeholder="Cerca esercizio per nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        <Dropdown className="w-100">
                            <Dropdown.Toggle
                                variant="outline-secondary"
                                id="dropdown-filter-muscle"
                                className="w-100 dropdown-muscle-filter-toggle"
                            >
                                <span className="dropdown-toggle-text">
                                    {filterMuscle === '' || filterMuscle === 'Tutti' ? "Filtra per Muscolo" : `Muscolo: ${filterMuscle}`}
                                </span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="w-100">
                                {uniqueMuscles.map((muscle) => (
                                    <Dropdown.Item
                                        key={muscle}
                                        onClick={() => setFilterMuscle(muscle)}
                                        active={filterMuscle === muscle}
                                    >
                                        {muscle}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                {renderExerciseList()}

                {selectedExercise && (
                    <Card className="mt-4 p-3 selected-exercise-card">
                        <Card.Body>
                            <Card.Title>{selectedExercise.name}</Card.Title>
                            <Card.Text>Muscolo: {selectedExercise.targetMuscle}</Card.Text>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Label>Serie:</Form.Label>
                                    <FormControl type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} required />
                                </Col>
                                <Col>
                                    <Form.Label>Ripetizioni:</Form.Label>
                                    <FormControl type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} required />
                                </Col>
                                <Col>
                                    <Form.Label>Kg:</Form.Label>
                                    <FormControl type="number" min="0" step="0.5" value={kg} onChange={(e) => setKg(e.target.value)} required />
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label>Tempo di Recupero (secondi):</Form.Label>
                                <FormControl type="number" min="0" value={restTimeSeconds} onChange={(e) => setRestTimeSeconds(e.target.value)} required />
                            </Form.Group>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Annulla
                </Button>
                <Button variant="primary" onClick={handleAddSelectedExercise} disabled={isAddButtonDisabled}>
                    Aggiungi Esercizio alla Scheda
                </Button>
            </Modal.Footer>
        </Modal>
    );
}