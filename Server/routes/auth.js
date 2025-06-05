// server/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const saltRounds = +process.env.SALT_ROUNDS;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const passport = require('passport');

// Import Model
const userModel = require('../models/users');

// Auth Routes
router.post('/auth/register', async (req, res) => {

    const password = req.body.password;
    // Store hash in your password DB.
    const user = new userModel({
        ...req.body,
        password: await bcrypt.hash(password, saltRounds)
    })
    const userSave = await user.save()
    return res.status(201).json(userSave)
})

router.post('/auth/login', async (req, res) => {
    // Login logic here
    const username = req.body.username; // oppure una email
    const password = req.body.password;

    const userLogin = await userModel.findOne({ username: username });
    console.log(userLogin);
    if (userLogin) {
        // L'username è stato trovato nel DB
        // Controllo la password
        const log = await bcrypt.compare(password, userLogin.password);
        if (log) {
            // La password è corretta
            // Genero un Token JWT
            const token = await generateToken({
                id: userLogin.id,
                username: userLogin.username,
                fullname: userLogin.fullname,
                email: userLogin.email,
            })
            return res.status(200).json(token);
        } else {
            // La password non è corretta
            return res.status(400).json({ message: 'Password errata' });
        }
    } else {
        // Lo username non è stato trovato nel DB
        return res.status(400).json({ message: 'Username non trovato' });
    }
});


// Google Auth Route
router.get('/auth/googlelogin', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/callback', passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }), async (req, res, next) => {
    try {
        console.log('Google callback successful. User:', req.user);

        // Genera il nostro token JWT per l'utente autenticato tramite Google
        const ourAppToken = await generateToken({
            id: req.user.id,
            username: req.user.username || req.user.email,
            fullname: req.user.fullname,
            email: req.user.email,
        });

        console.log('Our App JWT generated:', ourAppToken);

        res.redirect(`https://capstone-xi-one.vercel.app/profile?token=${ourAppToken}`);

    } catch (error) {
        console.error('Error during Google authentication callback:', error);
        res.redirect(`https://capstone-xi-one.vercel.app/login?error=${encodeURIComponent('Errore durante il login con Google. Riprova.')}`);
    }
});

// Soluzione 2
const generateToken = (payload) => {
    return new Promise((res, rej) => {
        jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' }, (err, token) => {
            if (err) rej(err);
            else res(token);
        });
    })
}

// Export Router
module.exports = router;