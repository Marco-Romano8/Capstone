// Importo le dipendenze necessarie per il progetto
var jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Import Model
const userModel = require('../models/users');

// Middleware
const authMiddleware = async (req, res, next) => {
    // console.log("Sono authMiddleware!");
    try {
        const tokenBearer = req.headers.authorization
        // console.log(tokenBearer)
        if (tokenBearer !== undefined) {
            const token = tokenBearer.replace('Bearer ', '');
            const data = await verifyJWT(token);
            console.log(data);
            if (data.exp) {
                const me = await userModel.findById(data.id);
                if (me) {
                    req.user = me
                    next()
                } else {
                    res.status(401).json('User not found')
                }
            } else {
                res.status(401).json('Please login again')
            }
        } else {
            res.status(401).json('Token Required')
        }

    } catch (err) {
        next('Token Error')
    }
}


const verifyJWT = (token) => {
    return new Promise((res, rej) => {
        jwt.verify(token, jwtSecretKey, (err, data) => {
            if (err) res(err)
            else res(data)
        })
    })
}

// Export Router
module.exports = authMiddleware;