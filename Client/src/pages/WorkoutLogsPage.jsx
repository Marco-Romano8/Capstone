import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import HeaderComponent from '../components/HeaderComponent';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import '../assets/styles/WorkoutLogsPage.css';

export default function WorkoutLogsPage() {
    const [user, setUser] = useState(null);
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [logsError, setLogsError] = useState(null);

    const navigate = useNavigate();
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    };
    useEffect(() => {
        const fetchWorkoutLogs = async () => {
            const userLogin = localStorage.getItem("userLogin");
            if (!userLogin) {
                navigate("/login");
                return;
            }

            try {
                const userLoginDecoded = jwt_decode(userLogin);
                setUser(userLoginDecoded);

                setLoadingLogs(true);
                setLogsError(null);

                const response = await axios.get('http://localhost:3001/api/workoutlogs', {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setWorkoutLogs(response.data);
                setLoadingLogs(false);
            } catch (err) {
                console.error('Errore nel recupero dei log di allenamento:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setLogsError('Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
                    localStorage.removeItem('userLogin');
                    navigate('/login');
                } else {
                    setLogsError(err.response?.data?.message || 'Errore durante il recupero dei log.');
                }
                setLoadingLogs(false);
            }
        };

        fetchWorkoutLogs();
    }, [navigate]);

    return (
        <>
            <HeaderComponent />
            <Container className="my-5 workout-logs-page-container">
                <h1 className="text-center mb-4">I Tuoi Allenamenti Registrati</h1>

                {loadingLogs ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs="auto"><Spinner animation="border" role="status" variant="light" /><p className="mt-3 text-white">Caricamento dei tuoi allenamenti registrati...</p></Col>
                    </Row>
                ) : logsError ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs={12} md={8}><Alert variant="danger" className="text-center"><Alert.Heading>Errore nel caricamento dei log!</Alert.Heading><p>{logsError}</p></Alert></Col>
                    </Row>
                ) : workoutLogs.length === 0 ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs={12} md={8}><Alert variant="info" className="text-center">Non hai ancora registrato nessun allenamento.</Alert></Col>
                    </Row>
                ) : (
                    <ListGroup className="workout-logs-list-group">
                        {workoutLogs.map((log) => (
                            <ListGroup.Item
                                key={log._id}
                                className="d-flex justify-content-between align-items-center workout-log-item"
                                onClick={() => navigate(`/workout-logs/${log._id}`)}
                            >
                                <div className="workout-log-details">
                                    <h5 className="mb-1">{log.workoutPlanId?.name || 'Nome Scheda Sconosciuto'}</h5>
                                    <p className="mb-1 text-muted">Data: {formatDate(log.date)}</p>
                                    <p className="mb-0">Esercizi Eseguiti: {log.exercisesPerformed.length}</p>
                                </div>
                                <Button 
                                    variant="outline-light" 
                                    size="sm" 
                                    onClick={(e) => { 
                                        e.stopPropagation();
                                        navigate(`/workout-logs/${log._id}`);
                                    }}
                                >
                                    Vedi Dettagli
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Container>
        </>
    );
}