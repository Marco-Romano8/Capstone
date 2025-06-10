import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Button, Card, ListGroup, Form, FormControl, Row, Col } from 'react-bootstrap';
import AddExerciseToPlanModal from '../components/AddExerciseToPlanModal';
import '../assets/styles/EditWorkoutPlanPage.css';

export default function EditWorkoutPlanPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddExerciseToPlanModal, setShowAddExerciseToPlanModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const currentPlanExerciseIds = useMemo(() => {
        if (!workoutPlan || !workoutPlan.exercises) return [];
        return workoutPlan.exercises.map(item => item.exercise._id);
    }, [workoutPlan]);

    useEffect(() => {
        const fetchWorkoutPlan = async () => {
            const userLogin = localStorage.getItem("userLogin");
            if (!userLogin) {
                navigate("/login");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`https://capstone-skmb.onrender.com/api/workoutplans/${id}`, {
                    headers: { Authorization: `Bearer ${userLogin}` },
                });
                const fetchedPlan = {
                    ...response.data,
                    exercises: response.data.exercises.map(item => ({
                        ...item,
                        kg: item.kg !== undefined ? item.kg : 0,
                        restTimeSeconds: item.restTimeSeconds !== undefined ? item.restTimeSeconds : 60
                    }))
                };
                setWorkoutPlan(fetchedPlan);
                setLoading(false);
            } catch (err) {
                console.error('Errore nel recupero della scheda di allenamento:', err);
                if (err.response && err.response.status === 404) {
                    setError('Scheda di allenamento non trovata.');
                } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
                    localStorage.removeItem('userLogin');
                    navigate('/login');
                } else {
                    setError('Errore del server nel recupero della scheda.');
                }
                setLoading(false);
            }
        };

        if (id) {
            fetchWorkoutPlan();
        } else {
            setError("ID della scheda di allenamento non fornito nell'URL.");
            setLoading(false);
        }
    }, [id, navigate]);

    const handleAddExercise = (newExerciseData) => {
        setWorkoutPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const isAlreadyAdded = prevPlan.exercises.some(item => item.exercise._id === newExerciseData.exercise._id);
            if (isAlreadyAdded) {
                alert('Questo esercizio è già stato aggiunto alla scheda.');
                return prevPlan;
            }
            const exerciseToAdd = {
                ...newExerciseData,
                restTimeSeconds: newExerciseData.restTimeSeconds !== undefined ? newExerciseData.restTimeSeconds : 60
            };
            return {
                ...prevPlan,
                exercises: [...prevPlan.exercises, { ...exerciseToAdd }]
            };
        });
    };

    const handleRemoveExercise = (exerciseToRemoveId) => {
        setWorkoutPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            return {
                ...prevPlan,
                exercises: prevPlan.exercises.filter(item => item.exercise._id !== exerciseToRemoveId)
            };
        });
    };

    const handleUpdateExerciseDetail = (exerciseId, field, value) => {
        setWorkoutPlan(prevPlan => {
            if (!prevPlan) return prevPlan;
            const updatedExercises = prevPlan.exercises.map(item =>
                item.exercise._id === exerciseId
                    ? { ...item, [field]: value }
                    : item
            );
            return { ...prevPlan, exercises: updatedExercises };
        });
    };

    const handleSaveWorkoutPlan = async () => {
        setIsSaving(true);
        const userLogin = localStorage.getItem("userLogin");
        if (!userLogin || !workoutPlan) {
            setIsSaving(false);
            setError('Impossibile salvare: utente non loggato o scheda non caricata.');
            return;
        }

        if (!workoutPlan.name || workoutPlan.name.trim() === '') {
            setError('Il nome della scheda non può essere vuoto.');
            setIsSaving(false);
            return;
        }

        try {
            const exercisesToSend = workoutPlan.exercises.map(item => ({
                exercise: item.exercise._id,
                sets: parseInt(item.sets) || 0,
                reps: parseInt(item.reps) || 0,
                kg: parseFloat(item.kg) || 0,
                restTimeSeconds: parseInt(item.restTimeSeconds) || 0
            }));

            await axios.put(`https://capstone-skmb.onrender.com/api/workoutplans/${workoutPlan._id}`, {
                name: workoutPlan.name,
                exercises: exercisesToSend
            }, {
                headers: { Authorization: `Bearer ${userLogin}` },
            });
            navigate('/profile');
        } catch (err) {
            console.error('Errore nel salvataggio della scheda di allenamento:', err);
            setError(err.response?.data?.message || 'Errore durante il salvataggio della scheda.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status" className="spinner-border">
                    <span className="visually-hidden">Caricamento scheda...</span>
                </Spinner>
                <p className="mt-3 text-color-dark">Caricamento scheda di allenamento...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 edit-plan-container"> 
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Errore!</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => navigate('/profile')} className="mt-3">
                        Torna al Profilo
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!workoutPlan) {
        return (
            <Container className="mt-5 edit-plan-container"> 
                <Alert variant="warning" className="text-center">
                    Scheda di allenamento non trovata.
                    <Button variant="outline-warning" onClick={() => navigate('/profile')} className="mt-3">
                        Torna al Profilo
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5 edit-plan-container">
            <h1 className="text-center mb-4 edit-plan-title">Modifica Scheda: {workoutPlan.name}</h1>

            <div className="d-flex justify-content-between mb-4 edit-plan-buttons-top">
                <Button variant="outline-secondary" onClick={() => navigate('/profile')} className="btn-back-to-profile">
                    {'<'} Torna al Profilo
                </Button>
                <Button variant="success" onClick={handleSaveWorkoutPlan} disabled={isSaving} className="btn-save-plan">
                    {isSaving ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Salvataggio...
                        </>
                    ) : (
                        'Salva Scheda'
                    )}
                </Button>
            </div>

            <Card className="exercises-card">
                <Card.Header className="text-center h4">Esercizi nella Scheda</Card.Header>
                <Card.Body>
                    {workoutPlan.exercises.length === 0 ? (
                        <Alert variant="info" className="text-center">
                            Nessun esercizio aggiunto a questa scheda. Clicca "Aggiungi Esercizio" per iniziare!
                        </Alert>
                    ) : (
                        <ListGroup variant="flush">
                            {workoutPlan.exercises.map((item) => (
                                <ListGroup.Item key={item.exercise._id} className="exercise-list-item d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <h5>{item.exercise.name}</h5>
                                        <p className="mb-1"><small>Muscolo: {item.exercise.targetMuscle}</small></p>
                                        <Row className="align-items-center g-2 mt-2">
                                            <Col xs={4}>
                                                <Form.Group controlId={`sets-${item.exercise._id}`} className="mb-0 form-group">
                                                    <Form.Label className="me-2">Serie:</Form.Label>
                                                    <FormControl
                                                        type="number"
                                                        min="1"
                                                        value={item.sets}
                                                        onChange={(e) => handleUpdateExerciseDetail(item.exercise._id, 'sets', parseInt(e.target.value))}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={4}>
                                                <Form.Group controlId={`reps-${item.exercise._id}`} className="mb-0 form-group">
                                                    <Form.Label className="me-2">Rip.:</Form.Label>
                                                    <FormControl
                                                        type="number"
                                                        min="1"
                                                        value={item.reps}
                                                        onChange={(e) => handleUpdateExerciseDetail(item.exercise._id, 'reps', parseInt(e.target.value))}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={4}>
                                                <Form.Group controlId={`kg-${item.exercise._id}`} className="mb-0 form-group">
                                                    <Form.Label className="me-2">Kg:</Form.Label> 
                                                    <FormControl
                                                        type="number"
                                                        min="0"
                                                        step="0.5"
                                                        value={item.kg}
                                                        onChange={(e) => handleUpdateExerciseDetail(item.exercise._id, 'kg', parseFloat(e.target.value))}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={4} className="mt-2">
                                                <Form.Group controlId={`rest-${item.exercise._id}`} className="mb-0 form-group">
                                                    <Form.Label className="me-2">Recupero (sec):</Form.Label>
                                                    <FormControl
                                                        type="number"
                                                        min="0"
                                                        value={item.restTimeSeconds}
                                                        onChange={(e) => handleUpdateExerciseDetail(item.exercise._id, 'restTimeSeconds', parseInt(e.target.value) || 0)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xs={12} className="text-end mt-2">
                                                <Button variant="outline-danger" size="sm" onClick={() => handleRemoveExercise(item.exercise._id)} className="btn-remove-exercise"> 
                                                    <i className="bi bi-trash"></i> Rimuovi
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                    <div className="text-center mt-3">
                        <Button variant="info" onClick={() => setShowAddExerciseToPlanModal(true)} className="btn-add-exercise">
                            Aggiungi Esercizio
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <AddExerciseToPlanModal
                show={showAddExerciseToPlanModal}
                handleClose={() => setShowAddExerciseToPlanModal(false)}
                onAddExercise={handleAddExercise}
                currentPlanExercises={currentPlanExerciseIds}
            />
        </Container>
    );
}