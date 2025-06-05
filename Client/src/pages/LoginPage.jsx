import React from 'react'
import { Container, Form } from 'react-bootstrap'
import HeaderComponent from '../components/HeaderComponent.jsx'
import FormLoginComponent from '../components/FormLoginComponent.jsx'
import '../assets/styles/AuthForms.css';

export default function LoginPage() {
    return (
        <>
            <HeaderComponent />
            <div className="auth-page-container">
                <Container className='auth-form-container'>
                    <h1 className='text-center auth-page-title'>Login Page</h1>
                    <FormLoginComponent />
                </Container>
            </div>
        </>
    )
}