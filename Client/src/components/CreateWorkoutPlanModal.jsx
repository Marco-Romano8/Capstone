import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap'; 
import axios from 'axios';
import '../assets/styles/CreateWorkoutPlanModal.css';

export default function CreateWorkoutPlanModal({ show, handleClose, onPlanCreated }) {
    const [planName, setPlanName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const userLogin = localStorage.getItem('userLogin');
        if (!userLogin) {
            setError('Devi essere loggato per creare una scheda di allenamento.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:3001/api/workoutplans',
                { name: planName, exercises: [] },
                {
                    headers: {
                        Authorization: `Bearer ${userLogin}`,
                    },
                }
            );

            onPlanCreated(response.data);
            setPlanName('');
            handleClose();
        } catch (err) {
            console.error('Errore nella creazione della scheda di allenamento:', err);
            if (err.response) {
                setError(err.response.data.message || 'Errore durante la creazione della scheda.');
            } else {
                setError('Impossibile connettersi al server. Riprova più tardi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="create-plan-modal">
            <Modal.Header closeButton>
                <Modal.Title>Crea Nuova Scheda di Allenamento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formPlanName">
                        <Form.Label>Nome Scheda</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Es. Full Body Workout, Allenamento Gambe A"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                {' '}Creazione...
                            </>
                        ) : (
                            'Crea Scheda'
                        )}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}