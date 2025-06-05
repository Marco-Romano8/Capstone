import React from 'react';
import HeaderComponent from '../components/HeaderComponent';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../assets/styles/ErrorPage.css'; 

export default function ErrorPage() {
    return (
        <>
            <HeaderComponent />
            <div className="error-page-container">
                <h1 className="error-page-title">404</h1>
                <h2 className="error-page-subtitle">Pagina Non Trovata</h2>
                <p className="error-page-message">
                    Ops! Sembra che la pagina che stai cercando non esista.
                    Potrebbe essere stata rimossa, il nome potrebbe essere cambiato,
                    o l'indirizzo potrebbe essere stato digitato in modo errato.
                </p>
                <Link to="/" className="error-page-link">
                    Torna alla Homepage
                </Link>
            </div>
        </>
    );
}