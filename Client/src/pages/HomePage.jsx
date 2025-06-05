import React, { useState, useEffect } from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { Container, Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/HomePage.css';

export default function HomePage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const userLogin = localStorage.getItem('userLogin');
            if (userLogin) {
                setIsLoggedIn(true);
                try {
                    const response = await axios.get('http://localhost:3001/api/dashboard-summary', {
                        headers: {
                            Authorization: `Bearer ${userLogin}`,
                        },
                    });
                    setUserData(response.data);
                } catch (err) {
                    console.error("Errore nel recupero dati dashboard:", err);
                    setError('Impossibile caricare i dati della dashboard. Riprova più tardi.');
                    setIsLoggedIn(false);
                    localStorage.removeItem('userLogin');
                }
            } else {
                setIsLoggedIn(false);
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <>
                <HeaderComponent />
                <Container className="text-center my-5 home-page-container">
                    <Spinner animation="border" variant="primary" role="status" />
                    <p className="mt-3 text-color-dark">Caricamento...</p>
                </Container>
            </>
        );
    }

    if (error && !isLoggedIn) {
        return (
            <>
                <HeaderComponent />
                <div className="home-page-container">
                    <Alert variant="danger" className="text-center w-75">
                        <h4 className="alert-heading">Si è verificato un errore!</h4>
                        <p>{error}</p>
                        <hr />
                        <p className="mb-0">
                            Sembra ci sia stato un problema nel caricamento dei dati.
                            Prova ad <Link to="/login" className="alert-link">effettuare il login</Link> o a <Link to="/register" className="alert-link">registrarti</Link>.
                        </p>
                    </Alert>
                </div>
            </>
        );
    }

    if (isLoggedIn) {
        return (
            <>
                <HeaderComponent />
                <div className="home-page-container">
                    <h1 className="welcome-title">
                        Benvenuto, {userData?.username || 'Utente'}!
                    </h1>

                    <p className="home-page-intro">
                        Il tuo diario fitness personale. Inizia ad allenarti, monitora i tuoi progressi e raggiungi i tuoi obiettivi.
                    </p>

                    {error && (
                        <Alert variant="warning" className="w-100 text-center mb-4">
                            Attenzione: {error}
                        </Alert>
                    )}

                    <Row className="home-stats-row">
                        <Col md={4} className="mb-4">
                            <Card className="home-stat-card">
                                <Card.Body className="text-center">
                                    <h3 className="card-title-orange">Schede Create</h3>
                                    <p className="stat-number">{userData?.totalPlans || 0}</p>
                                    <Link to="/profile" className="btn-custom-secondary">
                                        <i className="bi bi-journal-album"></i> Le Tue Schede
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="home-stat-card">
                                <Card.Body className="text-center">
                                    <h3 className="card-title-orange">Allenamenti Registrati</h3>
                                    <p className="stat-number">{userData?.totalWorkouts || 0}</p>
                                    <Link to="/workout-logs" className="btn-custom-secondary">
                                        <i className="bi bi-clipboard-check"></i> I Tuoi Log
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="home-stat-card">
                                <Card.Body className="text-center">
                                    <h3 className="card-title-orange">Ultimo Allenamento</h3>
                                    <p className="stat-text">{userData?.lastWorkoutDate ? new Date(userData.lastWorkoutDate).toLocaleDateString() : 'Nessuno'}</p>
                                    <p className="stat-text-small">{userData?.lastWorkoutName || 'Inizia ora!'}</p>
                                    {userData?.lastWorkoutId && (
                                        <Link to={`/workout-logs/${userData.lastWorkoutId}`} className="btn-custom-secondary mt-2">
                                            <i className="bi bi-eye"></i> Vedi Dettagli
                                        </Link>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="home-cta-section">
                        <h2 className="cta-heading">Pronto per il tuo prossimo allenamento?</h2>
                        <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <Link to="/profile" className="btn-main-cta">
                                <i className="bi bi-plus-circle"></i> Crea Nuova Scheda
                            </Link>
                            <Link to="/profile" className="btn-main-cta-secondary">
                                <i className="bi bi-play-circle"></i> Inizia Allenamento
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderComponent />
            <div className="home-page-container">
                <h1 className="welcome-title">
                    Fitness Diary
                </h1>

                <p className="home-page-intro">
                    Il tuo compagno ideale per monitorare i progressi fitness.
                    Crea schede di allenamento personalizzate, registra i tuoi esercizi e visualizza i tuoi miglioramenti nel tempo!
                </p>

                <div className="home-cta-section dark-background-section">
                    <h2 className="cta-heading">Inizia il tuo percorso fitness oggi!</h2>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                        <Link to="/register" className="btn-main-cta">
                            <i className="bi bi-person-plus"></i> Registrati Ora
                        </Link>
                        <Link to="/login" className="btn-main-cta-secondary">
                            <i className="bi bi-box-arrow-in-right"></i> Login
                        </Link>
                    </div>
                </div>

                <Row className="home-features-row my-5">
                    <Col md={4} className="mb-4">
                        <Card className="home-feature-card">
                            <Card.Body className="text-center">
                                <i className="bi bi-card-checklist feature-icon"></i>
                                <h3 className="card-title-orange">Crea Schede Personalizzate</h3>
                                <p className="text-color-dark">Progetta allenamenti su misura per i tuoi obiettivi e preferenze.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="home-feature-card">
                            <Card.Body className="text-center">
                                <i className="bi bi-pencil-square feature-icon"></i>
                                <h3 className="card-title-orange">Registra i Tuoi Allenamenti</h3>
                                <p className="text-color-dark">Tieni traccia di ogni serie, ripetizione e peso per monitorare i progressi.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="home-feature-card">
                            <Card.Body className="text-center">
                                <i className="bi bi-graph-up feature-icon"></i>
                                <h3 className="card-title-orange">Monitora i Progressi</h3>
                                <p className="text-color-dark">Visualizza i tuoi miglioramenti nel tempo con statistiche e log dettagliati.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}