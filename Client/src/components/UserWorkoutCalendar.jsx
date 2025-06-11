import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/it';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../assets/styles/UserWorkoutCalendar.css';

moment.locale('it');
const localizer = momentLocalizer(moment);

export default function UserWorkoutCalendar() {
    const [scheduledWorkouts, setScheduledWorkouts] = useState([]);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [editingScheduleId, setEditingScheduleId] = useState(null);

    const API_BASE_URL = 'https://capstone-skmb.onrender.com/api';
    const userLogin = localStorage.getItem('userLogin');

    const fetchAvailableWorkoutPlans = useCallback(async () => {
        if (!userLogin) {
            setError("Utente non autenticato. Impossibile caricare le schede.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/workoutplans`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            setAvailablePlans(response.data);
            setError(null);
        } catch (err) {
            console.error("Errore nel recupero delle schede di allenamento disponibili:", err);
            setError("Impossibile caricare le tue schede di allenamento.");
            setAvailablePlans([]);
        }
    }, [userLogin, API_BASE_URL]);

    const fetchScheduledWorkouts = useCallback(async () => {
        if (!userLogin) {
            setError("Utente non autenticato. Impossibile caricare la programmazione.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/workout-schedules`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            const formattedSchedules = response.data.map(schedule => ({
                id: schedule._id,
                date: schedule.date,
                workoutPlanId: schedule.workoutPlanId._id,
                workoutPlanName: schedule.workoutPlanId.name,
                color: schedule.workoutPlanId.color
            }));
            setScheduledWorkouts(formattedSchedules);
            setError(null);
        } catch (err) {
            console.error("Errore nel recupero della programmazione allenamenti:", err);
            setError("Impossibile caricare la tua programmazione allenamenti.");
            setScheduledWorkouts([]);
        } finally {
            setLoading(false);
        }
    }, [userLogin, API_BASE_URL]);

    useEffect(() => {
        setLoading(true);
        fetchAvailableWorkoutPlans();
    }, [fetchAvailableWorkoutPlans]);

    useEffect(() => {
        if (!loading && availablePlans) {
            fetchScheduledWorkouts();
        }
    }, [loading, availablePlans, fetchScheduledWorkouts]);

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(moment(start).format('YYYY-MM-DD'));
        setSelectedPlanId('');
        setEditingScheduleId(null);
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedDate(moment(event.start).format('YYYY-MM-DD'));
        setSelectedPlanId(event.workoutPlanId);
        setEditingScheduleId(event.id);
        setShowModal(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !selectedPlanId) {
            alert('Seleziona una data e una scheda di allenamento valida.');
            return;
        }
        try {
            const dateToSave = new Date(selectedDate);
            let response;
            if (editingScheduleId) {
                response = await axios.put(`${API_BASE_URL}/workout-schedules/${editingScheduleId}`,
                    { date: dateToSave, workoutPlanId: selectedPlanId },
                    { headers: { Authorization: `Bearer ${userLogin}` } }
                );
            } else {
                response = await axios.post(`${API_BASE_URL}/workout-schedules`,
                    { date: dateToSave, workoutPlanId: selectedPlanId },
                    { headers: { Authorization: `Bearer ${userLogin}` } }
                );
            }
            fetchScheduledWorkouts();
            setShowModal(false);
            alert('Programmazione salvata con successo!');
        } catch (err) {
            console.error('Errore nel salvataggio della programmazione:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Errore nel salvataggio: ${err.response.data.message}`);
            } else {
                setError('Errore durante il salvataggio della programmazione.');
            }
        }
    };

    const handleDeleteSchedule = async () => {
        if (!editingScheduleId) {
            alert('Nessun allenamento selezionato da eliminare.');
            return;
        }
        if (!window.confirm('Sei sicuro di voler eliminare questa programmazione?')) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/workout-schedules/${editingScheduleId}`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            fetchScheduledWorkouts();
            setShowModal(false);
            setEditingScheduleId(null);
            setSelectedDate(null);
            setSelectedPlanId('');
            alert('Programmazione eliminata con successo!');
        } catch (err) {
            console.error('Errore nell\'eliminazione della programmazione:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Errore nell'eliminazione: ${err.response.data.message}`);
            } else {
                setError('Errore durante l\'eliminazione della programmazione.');
            }
        }
    };

    const events = scheduledWorkouts.map(sw => ({
        id: sw.id,
        title: sw.workoutPlanName,
        start: new Date(sw.date),
        end: new Date(sw.date),
        workoutPlanId: sw.workoutPlanId,
        color: sw.color
    }));

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Caricamento calendario...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="user-calendar-container my-5">
            <h2 className="text-center mb-4 calendar-title">La Tua Programmazione Settimanale</h2>
            <Card className="calendar-card">
                <Card.Body>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        defaultView="week"
                        views={['month', 'week', 'day', 'agenda']}
                        messages={{
                            next: 'Prossimo',
                            previous: 'Precedente',
                            today: 'Oggi',
                            month: 'Mese',
                            week: 'Settimana',
                            day: 'Giorno',
                            agenda: 'Agenda',
                            showMore: total => `+ ${total} altro/i`,
                            noEventsInRange: 'Nessun allenamento in questo periodo.',
                        }}
                        eventPropGetter={(event) => {
                            const backgroundColor = event.color || '#ff8c00';
                            return { style: { backgroundColor } };
                        }}
                    />
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingScheduleId ? 'Modifica Programmazione' : 'Aggiungi Programmazione'} per il {selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : ''}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectPlan" className="mb-3">
                        <Form.Label>Seleziona Scheda di Allenamento:</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                        >
                            <option value="">Nessuna Scheda</option>
                            {availablePlans.map(plan => (
                                <option key={plan._id} value={plan._id}>{plan.name}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Annulla
                    </Button>
                    {editingScheduleId && (
                        <Button variant="danger" onClick={handleDeleteSchedule} className="me-auto">
                            Rimuovi Allenamento
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleSaveSchedule} disabled={!selectedPlanId}>
                        {editingScheduleId ? 'Aggiorna Programmazione' : 'Aggiungi Programmazione'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}