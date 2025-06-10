import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Button, Form, Row, Col } from 'react-bootstrap';
import HeaderComponent from '../components/HeaderComponent';
import '../assets/styles/RunWorkoutPage.css';

export default function RunWorkoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workoutPlan, setWorkoutPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLogs, setCurrentLogs] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const timerIntervals = useRef({});

    useEffect(() => {
        const fetchWorkoutPlan = async () => {
            setLoading(true);
            setError(null);

            const userLogin = localStorage.getItem("userLogin");
            if (!userLogin) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`https://capstone-skmb.onrender.com/api/workoutplans/${id}`, {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setWorkoutPlan(response.data);

                const initialLogs = {};
                response.data.exercises.forEach(ex => {
                    initialLogs[ex.exercise._id] = Array.from({ length: ex.sets }, (_, i) => ({
                        setNumber: i + 1,
                        reps: ex.reps.toString(),
                        weight: ex.kg !== undefined ? ex.kg.toString() : '',
                        restTimeRemaining: ex.restTimeSeconds || 0,
                        isTimerActive: false,
                    }));
                });
                setCurrentLogs(initialLogs);
            } catch (err) {
                console.error('Errore nel recupero della scheda di allenamento:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError('Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
                    localStorage.removeItem('userLogin');
                    navigate('/login');
                } else {
                    setError(err.response?.data?.message || 'Errore durante il recupero della scheda di allenamento.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutPlan();

        setSuccessMessage(null);
        setErrorMessage(null);

        return () => {
            Object.values(timerIntervals.current).forEach(clearInterval);
        };
    }, [id, navigate]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const startTimer = (exerciseId, setNumber) => {
        setCurrentLogs(prevLogs => {
            const updatedLogs = {
                ...prevLogs,
                [exerciseId]: prevLogs[exerciseId].map(set =>
                    set.setNumber === setNumber
                        ? { ...set, isTimerActive: true }
                        : set
                )
            };
            return updatedLogs;
        });

        if (timerIntervals.current[`${exerciseId}-${setNumber}`]) {
            clearInterval(timerIntervals.current[`${exerciseId}-${setNumber}`]);
        }

        const intervalId = setInterval(() => {
            setCurrentLogs(prevLogs => {
                const updatedLogs = { ...prevLogs };
                const targetSet = updatedLogs[exerciseId].find(set => set.setNumber === setNumber);

                if (targetSet) {
                    if (targetSet.restTimeRemaining > 0) {
                        targetSet.restTimeRemaining--;
                    } else {
                        clearInterval(timerIntervals.current[`${exerciseId}-${setNumber}`]);
                        delete timerIntervals.current[`${exerciseId}-${setNumber}`];
                        targetSet.isTimerActive = false;
                    }
                }
                return updatedLogs;
            });
        }, 1000);

        timerIntervals.current[`${exerciseId}-${setNumber}`] = intervalId;
    };

    const stopTimer = (exerciseId, setNumber) => {
        const timerKey = `${exerciseId}-${setNumber}`;
        if (timerIntervals.current[timerKey]) {
            clearInterval(timerIntervals.current[timerKey]);
            delete timerIntervals.current[timerKey];
        }

        setCurrentLogs(prevLogs => ({
            ...prevLogs,
            [exerciseId]: prevLogs[exerciseId].map(set =>
                set.setNumber === setNumber
                    ? { ...set, isTimerActive: false }
                    : set
            )
        }));
    };

    const resetTimer = (exerciseId, setNumber, initialTime) => {
        stopTimer(exerciseId, setNumber);
        setCurrentLogs(prevLogs => ({
            ...prevLogs,
            [exerciseId]: prevLogs[exerciseId].map(set =>
                set.setNumber === setNumber
                    ? { ...set, restTimeRemaining: initialTime, isTimerActive: false }
                    : set
            )
        }));
    };

    const handleLogChange = (exerciseId, setNumber, field, value) => {
        setCurrentLogs(prevLogs => ({
            ...prevLogs,
            [exerciseId]: prevLogs[exerciseId].map(set =>
                set.setNumber === setNumber ? { ...set, [field]: value } : set
            )
        }));
    };

    const handleAddSet = (exerciseId) => {
        const exerciseInPlan = workoutPlan.exercises.find(ex => ex.exercise._id === exerciseId);
        const defaultReps = exerciseInPlan ? exerciseInPlan.reps.toString() : '';
        const defaultWeight = exerciseInPlan && exerciseInPlan.kg !== undefined ? exerciseInPlan.kg.toString() : '';
        const defaultRestTime = exerciseInPlan ? exerciseInPlan.restTimeSeconds || 0 : 0; 

        setCurrentLogs(prevLogs => ({
            ...prevLogs,
            [exerciseId]: [...prevLogs[exerciseId], {
                setNumber: prevLogs[exerciseId].length + 1,
                reps: defaultReps,
                weight: defaultWeight,
                restTimeRemaining: defaultRestTime,
                isTimerActive: false,
            }]
        }));
    };

    const handleRemoveSet = (exerciseId, setNumber) => {
        stopTimer(exerciseId, setNumber);

        setCurrentLogs(prevLogs => {
            const updatedLogs = {
                ...prevLogs,
                [exerciseId]: prevLogs[exerciseId].filter(set => set.setNumber !== setNumber)
            };
            updatedLogs[exerciseId] = updatedLogs[exerciseId].map((set, index) => ({
                ...set,
                setNumber: index + 1
            }));
            return updatedLogs;
        });
    };

    const saveWorkoutLog = async () => {
        setIsSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        Object.keys(timerIntervals.current).forEach(key => clearInterval(timerIntervals.current[key]));
        timerIntervals.current = {};

        const userLogin = localStorage.getItem("userLogin");
        if (!userLogin) {
            navigate('/login');
            return;
        }

        try {
            const exercisesToLog = workoutPlan.exercises.map(ex => {
                const loggedSets = currentLogs[ex.exercise._id]
                    .filter(set => {
                        const hasReps = set.reps !== '' && !isNaN(parseInt(set.reps));
                        const hasWeight = set.weight !== '' && !isNaN(parseFloat(set.weight));
                        return hasReps || hasWeight;
                    })
                    .map(set => ({
                        setNumber: set.setNumber,
                        reps: parseInt(set.reps) || 0,
                        weight: parseFloat(set.weight) || 0
                    }));

                return {
                    exerciseId: ex.exercise._id,
                    exerciseName: ex.exercise.name,
                    sets: loggedSets
                };
            }).filter(ex => ex.sets.length > 0);

            if (exercisesToLog.length === 0) {
                setErrorMessage('Per salvare l\'allenamento, devi compilare almeno un set (reps o peso) per almeno un esercizio.');
                setIsSaving(false);
                return;
            }

            const payload = {
                workoutPlanId: workoutPlan._id,
                exercisesPerformed: exercisesToLog
            };

            await axios.post('https://capstone-skmb.onrender.com/api/workoutlogs', payload, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });

            setSuccessMessage('Allenamento registrato con successo! Reindirizzamento...');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            console.error('Errore nel salvataggio del log di allenamento:', err);
            setErrorMessage(err.response?.data?.message || 'Errore durante il salvataggio dell\'allenamento.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5 run-workout-page-container">
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Caricamento scheda...</span>
                </Spinner>
            </Container>
        );
    }
    if (error) {
        return (
            <Container className="text-center mt-5 run-workout-page-container">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => navigate('/profile')}>Torna al Profilo</Button>
            </Container>
        );
    }

    return (
        <>
            <HeaderComponent />
            <Container className="my-5 run-workout-page-container">
                <h1 className="text-center mb-4">Esegui: {workoutPlan.name}</h1>
                <Button variant="secondary" onClick={() => navigate('/profile')} className="mb-4">
                    &lt; Torna al Profilo
                </Button>

                {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="mb-3">{successMessage}</Alert>}
                {errorMessage && <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible className="mb-3">{errorMessage}</Alert>}

                {workoutPlan.exercises.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        Questa scheda non contiene esercizi. Torna indietro e aggiungine alcuni!
                    </Alert>
                ) : (
                    workoutPlan.exercises.map((ex) => (
                        <Card key={ex.exercise._id} className="mb-4">
                            <Card.Body>
                                <Card.Title>
                                    {ex.exercise.name} <small className="text-muted">({ex.exercise.targetMuscle})</small>
                                </Card.Title>
                                {currentLogs[ex.exercise._id]?.map((set) => {
                                    const initialRestTime = workoutPlan.exercises.find(e => e.exercise._id === ex.exercise._id)?.restTimeSeconds || 0;
                                    const progressBarWidth = (set.restTimeRemaining / initialRestTime) * 100;

                                    return (
                                        <Row key={`${ex.exercise._id}-${set.setNumber}`} className="align-items-center mb-2">
                                            <Col xs={1}>Set {set.setNumber}</Col>
                                            <Col xs={3}>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Reps"
                                                    value={set.reps}
                                                    onChange={(e) => handleLogChange(ex.exercise._id, set.setNumber, 'reps', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={3}>
                                                <Form.Control
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="Peso (kg)"
                                                    value={set.weight}
                                                    onChange={(e) => handleLogChange(ex.exercise._id, set.setNumber, 'weight', e.target.value)}
                                                />
                                            </Col>
                                            <Col xs={4} className="d-flex align-items-center">
                                                {!set.isTimerActive && set.restTimeRemaining > 0 && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => startTimer(ex.exercise._id, set.setNumber)}
                                                        className="me-1"
                                                    >
                                                        &#9654;
                                                    </Button>
                                                )}
                                                {set.isTimerActive && (
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => stopTimer(ex.exercise._id, set.setNumber)}
                                                        className="me-1"
                                                    >
                                                        &#9208;
                                                    </Button>
                                                )}
                                                {set.restTimeRemaining !== initialRestTime && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => resetTimer(ex.exercise._id, set.setNumber, initialRestTime)}
                                                        className="me-2"
                                                    >
                                                        &#8634;
                                                    </Button>
                                                )}
                                                <span className="me-2 text-white">{formatTime(set.restTimeRemaining)}</span>
                                                <div className="progress-bar-container flex-grow-1" style={{ height: '20px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{
                                                            width: `${progressBarWidth}%`,
                                                            height: '100%',
                                                            backgroundColor: '#4CAF50',
                                                            transition: set.isTimerActive ? 'width 1s linear' : 'none',
                                                            borderRadius: '5px'
                                                        }}
                                                    ></div>
                                                </div>
                                            </Col>
                                            <Col xs={1}>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleRemoveSet(ex.exercise._id, set.setNumber)}>
                                                    Rimuovi Set
                                                </Button>
                                            </Col>
                                        </Row>
                                    );
                                })}
                                <Button variant="outline-info" size="sm" className="mt-2" onClick={() => handleAddSet(ex.exercise._id)}>
                                    + Aggiungi Set
                                </Button>
                            </Card.Body>
                        </Card>
                    ))
                )}

                <Button
                    variant="success"
                    size="lg"
                    className="w-100 mt-4"
                    onClick={saveWorkoutLog}
                    disabled={isSaving || !workoutPlan.exercises.length}
                >
                    {isSaving ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            {' '}Salvataggio...
                        </>
                    ) : (
                        'Salva Allenamento Completato'
                    )}
                </Button>
            </Container>
        </>
    );
}