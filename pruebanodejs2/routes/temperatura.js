const { express, mongoose, bodyParser, session, sensor, jwt, cookieParser, bcrypt, User, http, socketIO, cors, Gpio, io, server, app, router } = require('./npm');



const temperaturaSchema = new mongoose.Schema({
    temperatura: {
      type: Number,
      required: true
    },
    humedad: {
      type: Number,
      required: true
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  });
  
  const Temperatura = mongoose.model('Temperatura', temperaturaSchema);
  
  module.exports = Temperatura;
  //Envias la ultima de temperatura a temperatura
  app.get('/temperaturas', (req, res) => {
    Temperatura.findOne().sort({fecha: -1})
        .then(nuevaTemperatura => {
            res.render('temperatura', { nuevaTemperatura });
        })
        .catch(err => console.log(err));
  });
  //Enviar a lista en forma json para usar en ayax para el grafico
  app.get('/api/temperaturas/lista', (req, res) => {
    Temperatura.find().sort({fecha: -1}).limit(20)
        .then(temperaturas => {
            res.json(temperaturas);
        })
        .catch(err => console.log(err));
  });
  //Envias la ultima de temperatura a temperatura en json en ayaz para actualizar
  
  app.get('/api/temperaturas', (req, res) => {
    Temperatura.findOne().sort({fecha: -1})
        .then(nuevaTemperatura => {
            res.json(nuevaTemperatura);
        })
        .catch(err => console.log(err));
  });
  
  setInterval(() => {
    leerTemperatura();
  }, 10000);
  //Hacer lecturas del sensor
  function leerTemperatura() {
    sensor.read(11, 4, function(err, temperature, humidity) {
      if (!err) {
        const nuevaTemperatura = new Temperatura({
          temperatura: temperature.toFixed(1),
          humedad: humidity.toFixed(1)
        });
        nuevaTemperatura.save().then(() => {
          console.log("Datos de temperatura y humedad guardados correctamente");
          console.log(nuevaTemperatura);
  
        }).catch((err) => {
          console.log("Error al guardar los datos de temperatura y humedad:", err);
        });
      }
    });
  }