const Gpio = require('pigpio').Gpio;

const motor = new Gpio(21, {mode: Gpio.OUTPUT});

let pulseWidth = 1000;
let increment = 200; // Incrementamos de 100 a 200

setInterval(() => {
  motor.servoWrite(pulseWidth);

  pulseWidth += increment;
  if (pulseWidth >= 2000) {
    increment = -200; // Cambiamos de -100 a -200
  } else if (pulseWidth <= 1000) {
    increment = 200; // Cambiamos de 100 a 200
  }
}, 500); // Cambiamos de 1000ms (1 segundo) a 500ms (0.5 segundos)

