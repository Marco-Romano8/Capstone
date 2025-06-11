import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
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
    const [currentViewDate, setCurrentViewDate] = useState(new Date()); 

    useEffect(() => {
        const fetchAvailablePlans = async () => {
            const userLogin = localStorage.getItem('userLogin');
            if (!userLogin) {
                setError("Utente non autenticato. Impossibile caricare le schede.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('https://capstone-skmb.onrender.com/api/workout-plans', {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setAvailablePlans(response.data);
            } catch (err) {
                console.error("Errore nel recupero delle schede di allenamento:", err);
                setError("Impossibile caricare le tue schede di allenamento.");
            } finally {
                setLoading(false);
            }
        };

        fetchAvailablePlans();
    }, []);

    useEffect(() => {
        setLoading(true);
        const userLogin = localStorage.getItem('userLogin');
        if (!userLogin) {
             setLoading(false);
             return;
        }

        const fetchScheduledWorkouts = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); 
                const mockScheduledWorkouts = [
                    { id: 'sch1', date: moment().day(1).format('YYYY-MM-DD'), planId: '65c92c556f8f533a68b1a37c', planName: 'Scheda A' },
                    { id: 'sch2', date: moment().day(3).format('YYYY-MM-DD'), planId: '65c92c556f8f533a68b1a37d', planName: 'Scheda B' },
                    { id: 'sch3', date: moment().day(5).format('YYYY-MM-DD'), planId: '65c92c556f8f533a68b1a37c', planName: 'Scheda A' },
                ];
                setScheduledWorkouts(mockScheduledWorkouts);
            } catch (err) {
                console.error("Errore nel recupero della programmazione allenamenti:", err);
                setError("Impossibile caricare la tua programmazione allenamenti.");
            } finally {
                setLoading(false);
            }
        };

        fetchScheduledWorkouts();
    }, [availablePlans]);

    const handleSelectSlot = ({ start }) => {
        setSelectedDate(moment(start).format('YYYY-MM-DD'));
        setSelectedPlanId('');
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedDate(moment(event.start).format('YYYY-MM-DD'));
        setSelectedPlanId(event.planId);
        setShowModal(true);
    };

    const handleSaveSchedule = async () => {
        if (selectedDate && selectedPlanId) {
            const plan = availablePlans.find(p => p._id === selectedPlanId);
            if (!plan) {
                alert("Scheda selezionata non trovata.");
                return;
            }
            console.log(`Salvataggio programmazione per ${selectedDate}: ${plan.name} (${selectedPlanId})`);

            setScheduledWorkouts(prev => {
                const existingIndex = prev.findIndex(sw => sw.date === selectedDate);
                const newWorkout = { id: `sch${Date.now()}`, date: selectedDate, planId: selectedPlanId, planName: plan.name };

                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newWorkout;
                    return updated;
                }
                return [...prev, newWorkout];
            });
            setShowModal(false);
        } else {
            alert("Seleziona una data e una scheda di allenamento.");
        }
    };

    const handleDeleteSchedule = async () => {
        if (selectedDate) {
            console.log(`Eliminazione programmazione per ${selectedDate}`);
            setScheduledWorkouts(prev => prev.filter(sw => sw.date !== selectedDate));
            setShowModal(false);
            setSelectedDate(null);
            setSelectedPlanId('');
        }
    };

    const events = scheduledWorkouts.map(sw => ({
        id: sw.id,
        title: sw.planName,
        start: new Date(sw.date),
        end: new Date(sw.date),
        planId: sw.planId,
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
                            const backgroundColor = availablePlans.find(p => p._id === event.planId)?.color || '#ff8c00';
                            return { style: { backgroundColor } };
                        }}
                    />
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedDate ? `Programma per il ${moment(selectedDate).format('DD/MM/YYYY')}` : 'Programma Allenamento'}</Modal.Title>
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
                    {selectedPlanId && (
                        <Button variant="danger" onClick={handleDeleteSchedule} className="me-auto">
                            Rimuovi Allenamento
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleSaveSchedule} disabled={!selectedPlanId}>
                        {scheduledWorkouts.some(sw => sw.date === selectedDate) ? 'Aggiorna Programmazione' : 'Aggiungi Programmazione'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}