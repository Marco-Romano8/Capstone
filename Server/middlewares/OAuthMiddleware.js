const passport = require('passport');
require('dotenv').config();
// var jwt = require('jsonwebtoken');
// const jwtSecretKey = process.env.JWT_SECRET_KEY;

const GoogleStrategy = require('passport-google-oauth2').Strategy;

// Import Model
const userModel = require('../models/users');

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
    async function (accessToken, refreshToken, profile, passportNext) {
        try {
            console.log("Profile: ", profile);
            const { email, name, given_name, family_name, email_verified } = profile._json;

            let user = await userModel.findOne({ email });

            if (!user) {
                // Se NON presente, lo salvo nel mio DB
                const newUser = new userModel({
                    username: given_name + family_name,
                    fullname: name,
                    email: email,
                    password: '-',
                    verified: email_verified
                });
                // Salvo il nuovo utente nel mio DB
                user = await newUser.save(); 
                console.log("Nuovo utente Google registrato nel DB:", user);
            } else {
                console.log("Utente Google già registrato nel DB:", user);
            }

            passportNext(null, user);

        } catch (error) {
            console.error("Errore in GoogleStrategy callback:", error);
            passportNext(error);
        }
    }
);

module.exports = googleStrategy;