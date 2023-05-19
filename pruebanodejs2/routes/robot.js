

const { express, mongoose, bodyParser, session, sensor, jwt, cookieParser, bcrypt, User, http, socketIO, cors, Gpio, io, server, app, router } = require('./npm');



//Motores = servos
const motor1 = new Gpio(20, {mode: Gpio.OUTPUT}); // Pata delantera izquierda
const motor2 = new Gpio(21, {mode: Gpio.OUTPUT}); // Pata delantera derecha
const motor3 = new Gpio(16, {mode: Gpio.OUTPUT}); // Pata trasera derecha
const motor4 = new Gpio(26, {mode: Gpio.OUTPUT}); // Pata trasera izquierda

let pulseWidthFront = 1300; 
let pulseWidthBack = 1300;  

let increment = 50;
let interval;

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('start', () => {
    console.log('Start event received');
    
    interval = setInterval(() => {
      // Movimiento de andar
      motor1.servoWrite(pulseWidthFront);
      motor2.servoWrite(pulseWidthBack);

      motor3.servoWrite(pulseWidthBack);
      motor4.servoWrite(pulseWidthFront);

      pulseWidthFront -= increment;
      pulseWidthBack += increment;

      if (pulseWidthFront <= 500) {
        pulseWidthFront = 500;
        increment = -50;
      } else if (pulseWidthFront >= 1500) {
        pulseWidthFront = 1500;
        increment = 50;
      }

      if (pulseWidthBack >= 1800) {
        pulseWidthBack = 1800;
        increment = -50;
      } else if (pulseWidthBack <= 500) {
        pulseWidthBack = 500;
        increment = 50;
      }

    

    }, 50); // El tiempo
  });

  // Enviar 
  socket.on('stop', () => {
    console.log('Stop event received');
    clearInterval(interval);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});