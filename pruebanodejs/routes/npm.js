const express = require('express'); 
const mongoose = require('mongoose'); //Base de datos
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session'); //Control de sesiones
const sensor = require('node-dht-sensor'); //Sensor
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const User = require('../modelos/user.js');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app); //Declaramos server para socket
const io = socketIO(server); //Declaramos el io para el server
const cors = require('cors');
const Gpio = require('pigpio').Gpio; //Para los servos
app.use(cookieParser());
app.locals.usuario = null;
app.locals.fotoUsuario = null;

app.use(express.static('public'));
app.use(cors());
// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Configurar el directorio para ejs
app.set('views', __dirname + '/views');

// Configurar body-parser para analizar los datos del formulario
app.use(bodyParser.urlencoded({ extended: false }));

module.exports = { 
    express, 
    mongoose,
    bodyParser,
    session,
    sensor,
    jwt,
    cookieParser,
    bcrypt,
    User,
    http,
    socketIO,
    cors,
    Gpio,
    io,
    server,
    app
};