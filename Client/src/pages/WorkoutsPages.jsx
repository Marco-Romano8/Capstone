import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExerciseCard from '../components/ExerciseCard';
import { Container, Row, Col, Spinner, Alert, Form, FormControl, Dropdown, DropdownButton } from 'react-bootstrap';
import HeaderComponent from '../components/HeaderComponent';
import '../assets/styles/WorkoutsPage.css';

export default function WorkoutsPage() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('');

    const [uniqueMuscles, setUniqueMuscles] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/exercises');
                setExercises(response.data);
                setLoading(false);

                const muscles = [...new Set(response.data.map(ex => ex.targetMuscle))];
                setUniqueMuscles(['Tutti', ...muscles].sort());

            } catch (err) {
                console.error('Errore nel recupero degli esercizi:', err);
                if (err.response) {
                    setError(`Errore del server: ${err.response.status} - ${err.response.data.message || 'Qualcosa è andato storto'}`);
                } else if (err.request) {
                    setError('Nessuna risposta dal server. Assicurati che il backend sia attivo e raggiungibile.');
                } else {
                    setError(`Errore: ${err.message}`);
                }
                setLoading(false);
            }
        };

        fetchExercises();
    }, []);

    const filteredExercises = exercises.filter(exercise => {
        const matchesSearchTerm = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMuscleFilter = filterMuscle === '' || filterMuscle === 'Tutti' || exercise.targetMuscle === filterMuscle;
        return matchesSearchTerm && matchesMuscleFilter;
    });

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Caricamento esercizi...</span>
                </Spinner>
                <p className="mt-3 text-color-dark">Caricamento esercizi...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="bg-white text-dark">
                    <Alert.Heading>Oh no! Errore di Caricamento!</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        Assicurati che il tuo backend sia attivo e che la connessione al database funzioni correttamente.
                    </p>
                </Alert>
            </Container>
        );
    }

    return (
        <>
            <HeaderComponent />
            <Container className="my-5 workouts-page-container">
                <h1 className="text-center mb-5 workouts-page-title">La Nostra Libreria di Esercizi</h1>

                <Row className="mb-4 justify-content-center">
                    <Col xs={12} md={6} lg={4} className="mb-3">
                        <Form.Group>
                            <FormControl
                                type="text"
                                placeholder="Cerca per nome esercizio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={3} className="mb-3">
                        <DropdownButton
                            id="dropdown-basic-button"
                            title={filterMuscle === '' || filterMuscle === 'Tutti' ? "Filtra per Muscolo" : `Muscolo: ${filterMuscle}`}
                            variant="outline-primary"
                            className="w-100 filter-dropdown"
                        >
                            {uniqueMuscles.map((muscle) => (
                                <Dropdown.Item
                                    key={muscle}
                                    onClick={() => setFilterMuscle(muscle)}
                                    active={filterMuscle === muscle}
                                    className="filter-dropdown-item"
                                >
                                    {muscle}
                                </Dropdown.Item>
                            ))}
                        </DropdownButton>
                    </Col>
                </Row>

                {filteredExercises.length === 0 && !loading && !error ? (
                    <Alert variant="info" className="text-center mt-4 bg-white text-dark">
                        Nessun esercizio trovato con i criteri di ricerca/filtro attuali.
                    </Alert>
                ) : (
                    <Row xs={1} sm={1} md={2} lg={2} className="g-4">
                        {filteredExercises.map((exercise) => (
                            <Col key={exercise._id} className="d-flex">
                                <ExerciseCard exercise={exercise} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
}