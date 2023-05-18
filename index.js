const Gpio = require('pigpio').Gpio;

// Configuración de los pines GPIO
const triggerPin = 23;
const echoPin = 24;

// Crear instancias de los pines GPIO
const trigger = new Gpio(triggerPin, { mode: Gpio.OUTPUT });
const echo = new Gpio(echoPin, { mode: Gpio.INPUT, alert: true });

// Constante de calibración para ajustar la distancia medida
const calibrationFactor = 1;

// Umbral para la detección de objeto (en centímetros)
const objetoPresenteUmbral = 10;

// Función para medir la distancia
function measureDistance() {
  return new Promise((resolve, reject) => {
    let startTick;

    // Capturar el inicio del pulso de eco
    echo.on('alert', (level, tick) => {
      if (level === 1) {
        startTick = tick;
      } else {
        const endTick = tick;
        const diff = (endTick >> 0) - (startTick >> 0); // Diferencia en microsegundos
        const distance = (diff / 2 / 1000000 * 34300 * calibrationFactor).toFixed(2); // Distancia en centímetros

        if (distance < objetoPresenteUmbral) {
          resolve(distance);
        } else {
          reject("No se detectó ningún objeto cercano.");
        }
      }
    });

    // Generar un pulso de 10 microsegundos en el pin de disparo
    trigger.trigger(10, 1);
  });
}

// Leer y mostrar la distancia cuando hay un objeto presente
setInterval(async () => {
  try {
    const distance = await measureDistance();
    console.log('Distancia al objeto más cercano:', distance, 'cm');
  } catch (error) {
    console.error('Error al medir la distancia:', error);
  }
}, 1000);

// Manejar la interrupción y limpiar los pines GPIO al salir
process.on('SIGINT', () => {
  trigger.digitalWrite(0);
  trigger.unexport();
  echo.disableAlert();
  echo.unexport();
  process.exit();
});
