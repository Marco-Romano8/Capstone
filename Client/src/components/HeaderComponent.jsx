import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import { FaHome, FaDumbbell, FaPlusCircle, FaChartBar, FaUserCircle, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

export default function HeaderComponent() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let userLogin = localStorage.getItem("userLogin");
        if (userLogin) {
            try {
                var userLoginDecoded = jwt_decode(userLogin);
                if (userLoginDecoded.exp * 1000 < Date.now()) {
                    console.warn("Token JWT scaduto. Effettuando il logout automatico.");
                    localStorage.removeItem("userLogin");
                    setUser(null);
                    navigate("/login");
                } else {
                    setUser(userLoginDecoded);
                }
            } catch (error) {
                console.error("Errore decodifica JWT dal localStorage:", error);
                localStorage.removeItem("userLogin");
                navigate("/login");
            }
        }
    }, [navigate]);

    const logout = (e) => {
        e.preventDefault();
        setUser(null);
        localStorage.removeItem("userLogin");
        navigate("/login");
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img
                        src={logo}
                        height="30"
                        className="d-inline-block align-top me-2"
                        alt="Fitness Diary Logo"
                    />
                    <span className="fw-bold text-white">Fitness Diary</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link as={Link} to="/" className="d-flex align-items-center me-3">
                            <FaHome className="me-1" /> Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/workouts" className="d-flex align-items-center me-3">
                            <FaDumbbell className="me-1" /> Workouts
                        </Nav.Link>

                        {user && (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to="/profile"
                                    state={{ showCreateModal: true }} 
                                    className="d-flex align-items-center me-3"
                                >
                                    <FaPlusCircle className="me-1" /> Nuova Scheda
                                </Nav.Link>

                                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center me-3">
                                    <FaUserCircle className="me-1" /> Le Tue Schede
                                </Nav.Link>

                                <Nav.Link as={Link} to="/workout-logs" className="d-flex align-items-center me-3">
                                    <FaChartBar className="me-1" /> Allenamenti Registrati
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {!user ? (
                            <>
                                <Nav.Link as={Link} to="/login" className="d-flex align-items-center">
                                    <FaSignInAlt className="me-1" /> Login
                                </Nav.Link>
                                <Nav.Link as={Link} to="/register" className="d-flex align-items-center">
                                    <FaUserPlus className="me-1" /> Register
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
                                    Benvenuto {user.fullname}
                                </Nav.Link>
                                <Nav.Link onClick={logout} className="d-flex align-items-center">
                                    <FaSignOutAlt className="me-1" /> Logout
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}