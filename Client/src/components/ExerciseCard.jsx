import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/ExerciseCard.css';

export default function ExerciseCard({ exercise }) {
    const { _id, name, targetMuscle, equipment, imageUrl, difficulty } = exercise;
    const navigate = useNavigate();

    const handleViewDetails = () => {
        navigate(`/exercises/${_id}`);
        console.log(`Navigazione alla pagina dettagli per l'esercizio con ID: ${_id}`);
    };

    const getDifficultyClass = (diff) => {
        switch (diff.toLowerCase()) {
            case 'principiante':
                return 'difficulty-beginner';
            case 'intermedio':
                return 'difficulty-intermediate';
            case 'avanzato':
                return 'difficulty-advanced';
            default:
                return 'difficulty-default';
        }
    };

    return (
        <Card className="exercise-card-horizontal-custom h-100 shadow-sm border-0">
            <Row className="g-0 d-flex align-items-center">
                <Col md={4} className="card-img-col">
                    <Card.Img
                        src={imageUrl}
                        alt={name}
                        className="exercise-card-img"
                    />
                </Col>
                <Col md={8} className="card-body-col">
                    <Card.Body className="d-flex flex-column justify-content-between h-100 p-3">
                        <div>
                            <Card.Title className="exercise-card-title mb-2">{name}</Card.Title>
                            <Card.Text className="card-text-detail mb-1">
                                Muscolo: <strong>{targetMuscle}</strong>
                            </Card.Text>
                            <Card.Text className="card-text-detail mb-2">
                                Attrezzatura: {equipment || 'Nessuna'}
                            </Card.Text>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-auto w-100">
                            <Badge pill className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
                                {difficulty}
                            </Badge>
                            <Button
                                variant="primary"
                                onClick={handleViewDetails}
                                className="view-details-button"
                            >
                                Vedi Dettagli
                            </Button>
                        </div>
                    </Card.Body>
                </Col>
            </Row>
        </Card>
    );
}