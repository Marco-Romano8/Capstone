import React from 'react'
import { Container } from 'react-bootstrap'
import HeaderComponent from '../components/HeaderComponent.jsx'
import FormRegisterComponent from '../components/FormRegisterComponent.jsx'
import '../assets/styles/AuthForms.css';

export default function RegisterPage() {
    return (
        <>
            <HeaderComponent />
            <div className="auth-page-container">
                <Container className='auth-form-container'>
                    <h1 className='text-center auth-page-title'>Register Page</h1>
                    <FormRegisterComponent />
                </Container>
            </div>
        </>
    )
}