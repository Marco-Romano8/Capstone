import axios from 'axios';
import React, { useState } from 'react'
import { Alert, Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AuthForms.css';
import GoogleWhiteIcon from '../assets/images/google-white-icon.png';

export default function FormLoginComponent() {

  const [user, setUser] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formHandler = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    })
  }

  const formSubmitHandler = () => {
    axios.post('https://capstone-skmb.onrender.com/auth/login', user)
      .then(response => {
        setError(null);
        localStorage.setItem('userLogin', response.data)
        navigate('/profile')
      })
      .catch(error => setError(error.response.data))
  }

  return (
    <Form className='my-5 auth-form'>
      <Form.Group className="mb-3" controlId="username">
        <Form.Control type="text" name="username" placeholder="Enter username" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Control type="password" name="password" placeholder="Enter password" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="loginButton">
        <Button variant="outline-primary" type="button" className='w-100 btn-outline-orange' onClick={formSubmitHandler}>Login</Button>
      </Form.Group>
      {error ? <Alert variant={'danger'} className="mt-3"> {error.message} </Alert> : ''}
      <Form.Group className="mb-3" controlId="googleLoginButton">
        <Button variant="primary" type="button" className='w-100 btn-orange-filled' href='https://capstone-skmb.onrender.com/auth/googleLogin'>
          <img src={GoogleWhiteIcon} alt="Google icon" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Google Login
        </Button>
      </Form.Group>
    </Form>
  )
}