import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Button, ListGroup, Row, Col, Modal, Form } from 'react-bootstrap';
import HeaderComponent from '../components/HeaderComponent';
import '../assets/styles/WorkoutLogDetailsPage.css';
import jwt_decode from 'jwt-decode';

export default function WorkoutLogDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workoutLog, setWorkoutLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editLogData, setEditLogData] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const showSuccessMessage = (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };

    const handleDeleteClick = () => setShowDeleteConfirm(true);
    const handleDeleteConfirmClose = () => setShowDeleteConfirm(false);

    const handleDeleteLog = async () => {
        const userLogin = localStorage.getItem("userLogin");
        if (!userLogin) {
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/workoutlogs/${id}`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            showSuccessMessage('Log di allenamento eliminato con successo!');
            setTimeout(() => {
                navigate('/workout-logs');
            }, 1000);
        } catch (err) {
            console.error('Errore nell\'eliminazione del log di allenamento:', err);
            setError(err.response?.data?.message || 'Errore durante l\'eliminazione del log.');
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    const handleEditClick = () => {
        setEditLogData(JSON.parse(JSON.stringify(workoutLog)));
        setShowEditModal(true);
    };
    const handleEditModalClose = () => setShowEditModal(false);

    const handleEditChange = (exerciseIndex, setIndex, field, value) => {
        setEditLogData(prevData => {
            const newExercisesPerformed = [...prevData.exercisesPerformed];
            const newSets = [...newExercisesPerformed[exerciseIndex].sets];
            newSets[setIndex] = { ...newSets[setIndex], [field]: value };
            newExercisesPerformed[exerciseIndex] = { ...newExercisesPerformed[exerciseIndex], sets: newSets };
            return { ...prevData, exercisesPerformed: newExercisesPerformed };
        });
    };

    const handleEditSubmit = async () => {
        setIsSaving(true);
        const userLogin = localStorage.getItem("userLogin");
        if (!userLogin) {
            navigate('/login');
            return;
        }

        try {
            const payload = {
                workoutPlanId: editLogData.workoutPlanId._id,
                exercisesPerformed: editLogData.exercisesPerformed.map(ex => ({
                    exerciseId: ex.exerciseId._id,
                    exerciseName: ex.exerciseName,
                    sets: ex.sets.map(set => ({
                        setNumber: set.setNumber,
                        reps: parseInt(set.reps) || 0,
                        weight: parseFloat(set.weight) || 0
                    }))
                }))
            };

            await axios.put(`http://localhost:3001/api/workoutlogs/${id}`, payload, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            setWorkoutLog(editLogData);
            showSuccessMessage('Log di allenamento aggiornato con successo!');
            setShowEditModal(false);
        } catch (err) {
            console.error('Errore nell\'aggiornamento del log di allenamento:', err);
            setError(err.response?.data?.message || 'Errore durante l\'aggiornamento del log.');
        } finally {
            setIsSaving(false);
        }
    };


    useEffect(() => {
        const fetchWorkoutLogDetails = async () => {
            const userLogin = localStorage.getItem("userLogin");
            if (!userLogin) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`http://localhost:3001/api/workoutlogs/${id}`, {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setWorkoutLog(response.data);
            } catch (err) {
                console.error('Errore nel recupero dei dettagli del log di allenamento:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
                    localStorage.removeItem('userLogin');
                    navigate('/login');
                } else if (err.response && err.response.status === 404) {
                    setError('Log di allenamento non trovato.');
                } else {
                    setError(err.response?.data?.message || 'Errore durante il recupero dei dettagli del log.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutLogDetails();
    }, [id, navigate]);

    if (loading) {
        return (
            <Container className="text-center mt-5 workout-log-details-page-container">
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Caricamento dettagli log...</span>
                </Spinner>
                <p className="mt-3 text-white">Caricamento dettagli allenamento...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center mt-5 workout-log-details-page-container">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => navigate('/workout-logs')}>Torna ai Log Allenamenti</Button>
            </Container>
        );
    }

    if (!workoutLog) {
        return (
            <Container className="text-center mt-5 workout-log-details-page-container">
                <Alert variant="info">Nessun log di allenamento disponibile.</Alert>
                <Button onClick={() => navigate('/workout-logs')}>Torna ai Log Allenamenti</Button>
            </Container>
        );
    }

    return (
        <>
            <HeaderComponent />
            <Container className="my-5 workout-log-details-page-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Button variant="outline-primary" onClick={() => navigate('/workout-logs')} className="me-2">
                        &lt; Torna ai Tuoi Allenamenti
                    </Button>
                    <div>
                        <Button variant="warning" className="me-2" onClick={handleEditClick}>Modifica Log</Button>
                        <Button variant="danger" onClick={handleDeleteClick}>Elimina Log</Button>
                    </div>
                </div>

                {successMessage && (
                    <Alert variant="success" className="text-center mb-4">{successMessage}</Alert>
                )}
                {error && (
                    <Alert variant="danger" className="text-center mb-4">{error}</Alert>
                )}

                <h1 className="text-center mb-4">
                    Dettagli Allenamento: {workoutLog.workoutPlanId?.name || 'N/D'}
                </h1>
                <p className="text-center text-muted mb-4">
                    Data: {formatDate(workoutLog.date)}
                </p>

                {workoutLog.exercisesPerformed.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Nessun esercizio registrato per questo allenamento.
                    </Alert>
                ) : (
                    <Card className="bg-dark text-white shadow-sm mb-4 exercise-log-card">
                        <Card.Header>Riepilogo Esercizi</Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {workoutLog.exercisesPerformed.map((exerciseEntry, index) => (
                                    <ListGroup.Item key={index} className="bg-secondary text-white border-bottom border-dark workout-log-exercise-item">
                                        <h5 className="mb-2">{exerciseEntry.exerciseName} <small className="text-muted">({exerciseEntry.exerciseId?.group || 'N/D'})</small></h5>
                                        <ListGroup className="mt-2 workout-log-sets-list">
                                            {exerciseEntry.sets.map((set, setIndex) => (
                                                <ListGroup.Item key={setIndex} className="bg-dark text-white d-flex justify-content-between align-items-center workout-log-set-item">
                                                    <span>Set {set.setNumber}:</span>
                                                    <span>
                                                        {set.reps !== null && set.reps !== undefined && set.reps !== '' ? `${set.reps} reps` : 'Nessun dato registrato'}
                                                        {set.weight !== null && set.weight !== undefined && set.weight !== '' ? ` @ ${set.weight} kg` : ''}
                                                    </span>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                )}
            </Container>
            <Modal show={showDeleteConfirm} onHide={handleDeleteConfirmClose} centered>
                <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
                    <Modal.Title>Conferma Eliminazione</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    Sei sicuro di voler eliminare questo log di allenamento? Questa azione non può essere annullata.
                </Modal.Body>
                <Modal.Footer className="bg-dark text-white border-top border-secondary">
                    <Button variant="secondary" onClick={handleDeleteConfirmClose}>Annulla</Button>
                    <Button variant="danger" onClick={handleDeleteLog}>Elimina</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEditModal} onHide={handleEditModalClose} size="lg" centered>
                <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
                    <Modal.Title>Modifica Allenamento: {editLogData?.workoutPlanId?.name || 'N/D'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    {editLogData && (
                        <Form>
                            {editLogData.exercisesPerformed.map((ex, exIndex) => (
                                <Card key={exIndex} className="mb-3 bg-secondary text-white">
                                    <Card.Header>
                                        <h5>{ex.exerciseName}</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        {ex.sets.map((set, setIndex) => (
                                            <Row key={setIndex} className="mb-2 align-items-center">
                                                <Col xs={2}>
                                                    <Form.Label className="m-0">Set {set.setNumber}</Form.Label>
                                                </Col>
                                                <Col xs={5}>
                                                    <Form.Control
                                                        type="number"
                                                        placeholder="Reps"
                                                        value={set.reps}
                                                        onChange={(e) => handleEditChange(exIndex, setIndex, 'reps', e.target.value)}
                                                        className="bg-dark text-white border-secondary"
                                                    />
                                                </Col>
                                                <Col xs={5}>
                                                    <Form.Control
                                                        type="number"
                                                        step="0.5"
                                                        placeholder="Weight (kg)"
                                                        value={set.weight}
                                                        onChange={(e) => handleEditChange(exIndex, setIndex, 'weight', e.target.value)}
                                                        className="bg-dark text-white border-secondary"
                                                    />
                                                </Col>
                                            </Row>
                                        ))}
                                    </Card.Body>
                                </Card>
                            ))}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-dark text-white border-top border-secondary">
                    <Button variant="secondary" onClick={handleEditModalClose}>Annulla</Button>
                    <Button variant="primary" onClick={handleEditSubmit}>Salva Modifiche</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}