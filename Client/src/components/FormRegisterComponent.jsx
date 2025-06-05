import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AuthForms.css';

export default function FormRegisterComponent() {

  const [user, setUser] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formHandler = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const formSubmitHandler = () => {
    axios.post('https://capstone-skmb.onrender.com/auth/register', user)
      .then(response => {
        console.log(response);
        setError(null);
        navigate('/login');
      })
      .catch(error => {
        console.error(error);
        setError(error.response.data);
      });
  };

  return (
    <Form className='my-5 auth-form'>
      <Form.Group className="mb-3" controlId="fullname">
        <Form.Control type="text" name="fullname" placeholder="Enter fullname" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="username">
        <Form.Control type="text" name="username" placeholder="Enter username" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="email">
        <Form.Control type="email" name="email" placeholder="Enter email" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="password">
        <Form.Control type="password" name="password" placeholder="Enter password" onChange={formHandler} />
      </Form.Group>
      <Form.Group className="mb-3" controlId="registerButton">
        <Button variant="outline-primary" type="button" className='w-100 btn-outline-orange' onClick={formSubmitHandler}>Register</Button>
      </Form.Group>
      {error ? <Alert variant={'danger'} className="mt-3"> {error.message} </Alert> : ''}
    </Form>
  );
}