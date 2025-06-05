// Importo le dipendenze necessarie per il progetto
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('passport');
const googleStrategy = require('./middlewares/OAuthMiddleware');

// Imposto l'app express e definisco i dati della connessione
const app = express();
const port = process.env.PORT || 3001;
const dbName = process.env.DB_NAME;

// Middlewares
app.use(cors()); // middleware per la gestione del CORS
app.use(express.json()); // middleware per la gestione del formato JSON
passport.use('google', googleStrategy); // middleware per la gestione dell'autenticazione con Google


// Endpoints
const authEndpoint = require('./routes/auth');
const userEndpoint = require('./routes/users');
const exerciseEndpoint = require('./routes/exercises');
const workoutPlanEndpoint = require('./routes/workoutPlans');
const workoutLogsEndpoint = require('./routes/workoutLogs');

app.use(authEndpoint);
app.use('/api', userEndpoint);
app.use('/api/exercises', exerciseEndpoint);
app.use('/api/workoutplans', workoutPlanEndpoint);
app.use('/api/workoutlogs', workoutLogsEndpoint);



// Connect to DB and start the Server
mongoose.connect(process.env.MONGODB_URL + dbName)
    .then(resp => app.listen(port, () => console.log("Server attivo sulla porta " + port)))
    .catch(err => console.log(err));
