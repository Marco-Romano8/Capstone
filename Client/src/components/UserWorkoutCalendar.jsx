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
    const [selectedEndDateTime, setSelectedEndDateTime] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const userLogin = localStorage.getItem('userLogin');

    const displayAppAlert = useCallback((message, variant) => {
        setAlertMessage(message);
        setAlertVariant(variant);
        setShowAlert(true);
        const timer = setTimeout(() => {
            setShowAlert(false);
            setAlertMessage('');
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const fetchAvailableWorkoutPlans = useCallback(async () => {
        if (!userLogin) {
            setError("Utente non autenticato. Impossibile caricare le schede.");
            return [];
        }
        try {
            const response = await axios.get(`https://capstone-skmb.onrender.com/api/workoutplans`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            setAvailablePlans(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            console.error("Errore nel recupero delle schede di allenamento disponibili:", err);
            setError("Impossibile caricare le tue schede di allenamento.");
            setAvailablePlans([]);
            return [];
        }
    }, [userLogin]);

    const fetchScheduledWorkouts = useCallback(async () => {
        if (!userLogin) {
            setError("Utente non autenticato. Impossibile caricare la programmazione.");
            return;
        }
        try {
            const response = await axios.get(`https://capstone-skmb.onrender.com/api/workout-schedules`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            const formattedSchedules = response.data.map(schedule => ({
                id: schedule._id,
                date: schedule.date,
                end: moment(schedule.endDate || schedule.date).toDate(),
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
        }
    }, [userLogin]);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            const plans = await fetchAvailableWorkoutPlans();
            if (plans.length > 0) {
                await fetchScheduledWorkouts();
            }
            setLoading(false);
        };

        loadAllData();
    }, [fetchAvailableWorkoutPlans, fetchScheduledWorkouts]);

    const handleSelectSlot = ({ start, end }) => {
        setSelectedDate(moment(start).format('YYYY-MM-DDTHH:mm'));
        setSelectedEndDateTime(moment(end).format('YYYY-MM-DDTHH:mm'));
        setSelectedPlanId('');
        setEditingScheduleId(null);
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedDate(moment(event.start).format('YYYY-MM-DDTHH:mm'));
        setSelectedEndDateTime(moment(event.end).format('YYYY-MM-DDTHH:mm'));
        setSelectedPlanId(event.workoutPlanId);
        setEditingScheduleId(event.id);
        setShowModal(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedDate || !selectedPlanId) {
            displayAppAlert('Seleziona una data e una scheda di allenamento valida.', 'danger');
            return;
        }
        try {
            const startDate = new Date(selectedDate);
            const endDate = new Date(selectedEndDateTime || selectedDate);

            let response;
            if (editingScheduleId) {
                response = await axios.put(`https://capstone-skmb.onrender.com/api/workout-schedules/${editingScheduleId}`,
                    { date: startDate, workoutPlanId: selectedPlanId, endDate: endDate },
                    { headers: { Authorization: `Bearer ${userLogin}` } }
                );
            } else {
                response = await axios.post(`https://capstone-skmb.onrender.com/api/workout-schedules`,
                    { date: startDate, workoutPlanId: selectedPlanId, endDate: endDate },
                    { headers: { Authorization: `Bearer ${userLogin}` } }
                );
            }
            await fetchScheduledWorkouts();
            setShowModal(false);
            displayAppAlert('Programmazione salvata con successo!', 'success');
        } catch (err) {
            console.error('Errore nel salvataggio della programmazione:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Errore nel salvataggio: ${err.response.data.message}`);
                displayAppAlert(`Errore nel salvataggio: ${err.response.data.message}`, 'danger');
            } else {
                setError('Errore durante il salvataggio della programmazione.', 'danger');
            }
        }
    };

    const confirmDelete = () => {
        setShowConfirmDeleteModal(true);
    };

    const handleDeleteSchedule = async () => {
        setShowConfirmDeleteModal(false);
        if (!editingScheduleId) {
            displayAppAlert('Nessun allenamento selezionato da eliminare.', 'danger');
            return;
        }
        try {
            await axios.delete(`https://capstone-skmb.onrender.com/api/workout-schedules/${editingScheduleId}`, {
                headers: { Authorization: `Bearer ${userLogin}` }
            });
            await fetchScheduledWorkouts();
            setShowModal(false);
            setEditingScheduleId(null);
            setSelectedDate(null);
            setSelectedPlanId('');
            setSelectedEndDateTime(null);
            displayAppAlert('Programmazione eliminata con successo!', 'success');
        } catch (err) {
            console.error('Errore nell\'eliminazione della programmazione:', err);
            if (err.response && err.response.data && err.response.data.message) {
                displayAppAlert(`Errore nell'eliminazione: ${err.response.data.message}`, 'danger');
            } else {
                displayAppAlert('Errore durante l\'eliminazione della programmazione.', 'danger');
            }
        }
    };

    const events = scheduledWorkouts.map(sw => ({
        id: sw.id,
        title: sw.workoutPlanName,
        start: new Date(sw.date),
        end: new Date(sw.end || sw.date),
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
            {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible className="floating-alert">
                    {alertMessage}
                </Alert>
            )}
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
                        step={30}
                        timeslots={2}
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
                        {editingScheduleId ? 'Modifica Programmazione' : 'Aggiungi Programmazione'}
                        <br />
                        <span className="modal-date-time-text">
                            {selectedDate && moment(selectedDate).format('DD/MM/YYYY HH:mm')}
                            {selectedEndDateTime && selectedDate !== selectedEndDateTime && ` - ${moment(selectedEndDateTime).format('HH:mm')}`}
                        </span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="selectPlan" className="mb-3">
                        <Form.Label className="modal-form-label">Seleziona Scheda di Allenamento:</Form.Label>
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
                        <Button variant="danger" onClick={confirmDelete} className="me-auto">
                            Rimuovi Allenamento
                        </Button>
                    )}
                    <Button variant="primary" onClick={handleSaveSchedule} disabled={!selectedPlanId}>
                        {editingScheduleId ? 'Aggiorna Programmazione' : 'Aggiungi Programmazione'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmDeleteModal} onHide={() => setShowConfirmDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Conferma Eliminazione</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Sei sicuro di voler eliminare questa programmazione?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmDeleteModal(false)}>
                        Annulla
                    </Button>
                    <Button variant="danger" onClick={handleDeleteSchedule}>
                        Elimina
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}