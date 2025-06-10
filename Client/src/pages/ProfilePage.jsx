import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import HeaderComponent from '../components/HeaderComponent';
import CreateWorkoutPlanModal from '../components/CreateWorkoutPlanModal';
import { useNavigate, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import '../assets/styles/ProfilePage.css';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [plansError, setPlansError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmDeletePlanId, setConfirmDeletePlanId] = useState(null);
    const [planToDeleteName, setPlanToDeleteName] = useState('');
    const [profileAlert, setProfileAlert] = useState({ show: false, message: '', variant: '' });
    const navigate = useNavigate();
    const location = useLocation();

    const showAlert = (message, variant) => {
        setProfileAlert({ show: true, message, variant });
        setTimeout(() => {
            setProfileAlert({ show: false, message: '', variant: '' });
        }, 5000);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            localStorage.setItem('userLogin', tokenFromUrl);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            window.history.replaceState({}, document.title, newUrl.toString());
        }

        let userLogin = localStorage.getItem("userLogin");
        if (!userLogin) {
            navigate("/login");
        } else {
            try {
                const userLoginDecoded = jwt_decode(userLogin);
                setUser(userLoginDecoded);
            } catch (error) {
                console.error("Errore decodifica JWT dal localStorage:", error);
                localStorage.removeItem("userLogin");
                navigate("/login");
            }
        }
        setProfileAlert({ show: false, message: '', variant: '' });
        if (location.state && location.state.showCreateModal) {
            setShowCreateModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.search, location.state, location.pathname, navigate]);

    useEffect(() => {
        const fetchWorkoutPlans = async () => {
            const userLogin = localStorage.getItem("userLogin");
            if (!userLogin) { setLoadingPlans(false); return; }

            setLoadingPlans(true);
            setPlansError(null);

            try {
                const response = await axios.get('https://capstone-skmb.onrender.com/api/workoutplans', {
                    headers: { Authorization: `Bearer ${userLogin}` }
                });
                setWorkoutPlans(response.data);
                setLoadingPlans(false);
            } catch (err) {
                console.error('Errore nel recupero delle schede di allenamento:', err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setPlansError('Sessione scaduta o non autorizzato. Effettua nuovamente il login.');
                    localStorage.removeItem('userLogin');
                    navigate('/login');
                } else {
                    setPlansError(err.response?.data?.message || 'Errore durante il recupero delle schede.');
                }
                setLoadingPlans(false);
            }
        };
        if (user) { fetchWorkoutPlans(); }
    }, [user, navigate]);

    const handlePlanCreated = (newPlan) => {
        setWorkoutPlans((prevPlans) => [...prevPlans, newPlan]);
        setShowCreateModal(false);
        showAlert(`Scheda "${newPlan.name}" creata con successo!`, 'success');
    };

    const handleShowCreateModal = () => setShowCreateModal(true);
    const handleCloseCreateModal = () => setShowCreateModal(false);

    const handleConfirmDeleteClick = (planId) => {
        const plan = workoutPlans.find(p => p._id === planId);
        if (plan) {
            setConfirmDeletePlanId(planId);
            setPlanToDeleteName(plan.name);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeletePlanId(null);
        setPlanToDeleteName('');
    };

    const handleDeleteWorkoutPlan = async (planId, planName) => {
        const userLogin = localStorage.getItem("userLogin");
        if (!userLogin) {
            showAlert('Devi essere loggato per eliminare una scheda di allenamento.', 'danger');
            navigate("/login");
            return;
        }
        try {
            await axios.delete(`https://capstone-skmb.onrender.com/api/workoutplans/${planId}`, {
                headers: { Authorization: `Bearer ${userLogin}` },
            });
            setWorkoutPlans((prevPlans) => prevPlans.filter((plan) => plan._id !== planId));
            setConfirmDeletePlanId(null);
            setPlanToDeleteName('');
            showAlert(`Scheda "${planName}" eliminata con successo!`, 'success');
        } catch (err) {
            console.error('Errore nell\'eliminazione della scheda di allenamento:', err);
            setConfirmDeletePlanId(null);
            setPlanToDeleteName('');
            if (err.response) {
                showAlert(err.response.data.message || 'Errore durante l\'eliminazione della scheda.', 'danger');
            } else {
                showAlert('Impossibile connettersi al server per eliminare la scheda.', 'danger');
            }
        }
    };

    if (!user) {
        return (
            <Container className="text-center mt-5 profile-page-container">
                <Spinner animation="border" role="status" className="profile-spinner"><span className="visually-hidden">Caricamento profilo...</span></Spinner>
                <p className="mt-3 text-color-dark">Caricamento profilo...</p>
            </Container>
        );
    }

    return (
        <>
            <HeaderComponent />
            <Container className="my-5 profile-page-container">
                <h1 className="text-center mb-4 profile-title">Le Tue Schede di Allenamento</h1>
                <Row className="mb-4 justify-content-center">
                    <Col xs="auto">
                        <Button variant="primary" className="create-plan-button" onClick={handleShowCreateModal}>
                            + Crea Nuova Scheda
                        </Button>
                    </Col>
                </Row>

                {profileAlert.show && (
                    <Alert variant={profileAlert.variant} onClose={() => setProfileAlert({ show: false, message: '', variant: '' })} dismissible className="mb-3 profile-alert">
                        {profileAlert.message}
                    </Alert>
                )}

                {loadingPlans ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs="auto"><Spinner animation="border" role="status" className="profile-spinner" /><p className="mt-3 text-color-dark">Caricamento delle tue schede di allenamento...</p></Col>
                    </Row>
                ) : plansError ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs={12} md={8}><Alert variant="danger" className="text-center profile-alert"><Alert.Heading>Errore nel caricamento delle schede!</Alert.Heading><p>{plansError}</p></Alert></Col>
                    </Row>
                ) : workoutPlans.length === 0 ? (
                    <Row className="justify-content-center mt-5">
                        <Col xs={12} md={8}><Alert variant="info" className="text-center profile-empty-plans-alert">Non hai ancora creato nessuna scheda di allenamento. Inizia ora!</Alert></Col>
                    </Row>
                ) : (
                    <div className="workout-plans-list">
                        {workoutPlans.map((plan) => (
                            <div key={plan._id} className="workout-plan-list-item d-flex align-items-center justify-content-between p-3 mb-3">
                                <div className="plan-details">
                                    <h4 className="plan-name">{plan.name}</h4>
                                    <p className="plan-exercises-count">Esercizi: {plan.exercises ? plan.exercises.length : 0}</p>
                                </div>
                                <div className="plan-buttons d-flex gap-2">
                                    <Button variant="outline-light" className="profile-button-list view-edit-button-list" onClick={() => navigate(`/workout-plans/${plan._id}/edit`)}>Vedi/Modifica</Button>
                                    <Button variant="primary" className="profile-button-list start-workout-button-list" onClick={() => navigate(`/workout-plans/${plan._id}/run`)}>Inizia</Button>
                                    {confirmDeletePlanId === plan._id ? (
                                        <>
                                            <Button variant="danger" className="profile-button-list confirm-delete-button-list" onClick={() => handleDeleteWorkoutPlan(plan._id, plan.name)}>Conferma</Button>
                                            <Button variant="outline-secondary" className="profile-button-list cancel-delete-button-list" onClick={handleCancelDelete}>Annulla</Button>
                                        </>
                                    ) : (
                                        <Button variant="danger" className="profile-button-list delete-button-list" onClick={() => handleConfirmDeleteClick(plan._id)}>Elimina</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Modal show={confirmDeletePlanId !== null} onHide={handleCancelDelete} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Conferma Eliminazione</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Sei sicuro di voler eliminare la scheda **"{planToDeleteName}"**? Questa azione è irreversibile.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCancelDelete}>
                            Annulla
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteWorkoutPlan(confirmDeletePlanId, planToDeleteName)}>
                            Elimina
                        </Button>
                    </Modal.Footer>
                </Modal>

                <CreateWorkoutPlanModal show={showCreateModal} handleClose={handleCloseCreateModal} onPlanCreated={handlePlanCreated} />
            </Container>
        </>
    );
}