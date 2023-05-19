const express = require('express'); 
const cors = require('cors');
const app = express();
const mongoose = require('mongoose'); //Base de datos
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); //Encriptar 
const User = require('./modelos/user.js');
const session = require('express-session'); //Control de sesiones
const sensor = require('node-dht-sensor'); //Sensor
const http = require('http');
const socketIO = require('socket.io');
const Gpio = require('pigpio').Gpio; //Para los servos
const server = http.createServer(app); //Declaramos server para socket
const io = socketIO(server); //Declaramos el io para el server
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

app.use(cookieParser());


app.locals.usuario = null;
app.locals.fotoUsuario = null;
app.use(express.static('public'));
app.use(cors());



app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1800000 // 30 minutos
  }
}));
// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');

// Configurar el directorio para ejs
app.set('views', __dirname + '/views');

// Configurar body-parser para analizar los datos del formulario
app.use(bodyParser.urlencoded({ extended: false }));

// Configurar la sesión
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true
}));

// Conectar a MongoDB
mongoose.connect('mongodb+srv://jokin:Almi123@cluster0.5eyccwa.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch((err) => {
  console.log('Error al conectar a MongoDB', err);
});

// Definir las rutas
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/menulateral', (req, res) => {
  res.render('pruebasmenulateral');
});

app.get('/stream',verifyToken, (req, res) => {
  res.render('stream');
});

app.get('/conversor',verifyToken, (req, res) => {
  res.render('conversor');
});

app.get('/logout', (req, res) => {
  res.clearCookie('token'); // Borra la cookie 'token'
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  const token = req.cookies.token // Obtén el token de la cookie

  if (token) {
    try {
      // Verifica el token. Si es válido, redirige al perfil
      jwt.verify(token, 'your_secret_key');
      res.redirect('/perfil');
    } catch (err) {
      // Si el token no es válido, muestra la página de inicio de sesión
      res.render('login');
    }
  } else {
    // Si no hay token, muestra la página de inicio de sesión
    res.render('login');
  }
});


app.get('/register', (req, res) => {
  res.render('register');
});


app.get('/register', (req, res) => {
  res.render('register');
});

//Inicio de sesion
app.post('/login', (req, res) => {
  const { user, password } = req.body;

  User.findOne({ user })
  .then((userFound) => {
    if (!userFound) {
      res.send('Usuario o contraseña incorrectos');
    } else {
      bcrypt.compare(password, userFound.password, function(err, result) {
        if (result === true) {
          const token = jwt.sign({ _id: userFound._id }, 'your_secret_key'); // Crea un token
          res.cookie('token', token).redirect('/perfil'); // Establece una cookie con el token y redirige al perfil
        } else {
          res.send('Usuario o contraseña incorrectos');
        }
      });
    }
  })
  .catch((err) => {
    console.log('Error al iniciar sesión', err);
    res.send('Error al iniciar sesión');
  });
});




app.get('/perfil', verifyToken, (req, res) => {
  // Verifica que el token corresponda a un usuario existente
  User.findById(req.user._id)
    .then(user => {
      if (user) {
        res.render('perfiles', { username: user.user, foto: user.foto });
      } else {
        // No se encontró el usuario
        res.send('Usuario no encontrado');
      }
    })
    .catch(err => {
      console.log('Error al buscar usuario en la base de datos', err);
      res.send('Error al buscar usuario en la base de datos');
    });
});




app.post('/register', (req, res) => {
  const { user, password } = req.body;

  // Comprobar usuario
  User.findOne({ user })
    .then((existingUser) => {
      if (existingUser) {
        // El usuario existe
        res.send('El usuario ya existe');
      } else {
        // Si usuario no existe, lo guarda
        bcrypt.hash(password, 10, function(err, hashedPassword) {
          if (err) {
            console.log('Error al encriptar contraseña', err);
            res.send('Error al registrar usuario');
          } else {
            const newUser = new User({ user, password: hashedPassword });
            newUser.save()
              .then(() => {
                res.render('registrohecho', { message: 'Usuario registrado exitosamente' });     
              })
              .catch((err) => {
                console.log('Error al registrar usuario', err);
                res.send('Error al registrar usuario');
              });
          }
        });
      }
    })
    .catch((err) => {
      console.log('Error al buscar usuario en la base de datos', err);
      res.send('Error al registrar usuario');
    });
});
//Esquema temperaturas
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
app.get('/temperaturas',verifyToken, (req, res) => {
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
//control

app.get('/control', verifyToken, (req, res) => {
  res.render('control');
});


//actualizar foto de perfil





// Agregar ruta para actualizar la foto de perfil del usuario
/*app.post('/perfiles', (req, res) => {
  const { foto } = req.body;

  if (!req.session.loggedin) {
    res.redirect('/login');
    return;
  }
//, { usuario: updatedUser }
  const username = req.session.username;

  User.findOneAndUpdate(
    { user: username },
    { foto: foto },
    { new: true }
  )
    .then(updatedUser => {
      if (updatedUser) {
        updatedUser = app.locals.fotoUsuario;

        res.render('perfiles');
       
        
      } else {
        // No se encontró el usuario
        res.send('Usuario no encontrado');
      }
    })
    .catch(err => {
      console.log('Error al actualizar la foto del usuario', err);
      res.send('Error al actualizar la foto del usuario');
    });
});
*/

// motor

//const motor = new Gpio(21, {mode: Gpio.OUTPUT});
//const motor2 = new Gpio(16, {mode: Gpio.OUTPUT});
//const motor3 = new Gpio(20, {mode: Gpio.OUTPUT});

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

app.use(async (req, res, next) => {
  const token = req.cookies['auth-token']; // Obtén el token de la cookie

  if (token) {
    try {
      // Verifica el token. Si es válido, busca el usuario correspondiente
      const decoded = jwt.verify(token, 'your_secret_key');
      const user = await User.findById(decoded._id);
      
      if (user) {
        // Si el usuario existe, establece res.locals
        res.locals.usuario = user.user;
        res.locals.fotoUsuario = user.foto;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Llama a next() para continuar con la siguiente middleware o ruta
  next();
});


async function verifyToken(req, res, next) {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(403).send('PA tras e inicia sesion');
  }

  try {
    const verified = jwt.verify(token, 'your_secret_key');
    req.user = verified;

    // buscar el usuario en la base de datos
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error('K no va');
    }

    // establecer las variables de nombre de usuario y foto de perfil actualizadas al iniciar ses
    res.locals.usuario = user.user;
    res.locals.fotoUsuario = user.foto;

    next();
  } catch (err) {
    res.status(400).send('se ta caducao el token ese');
  }
}

app.post('/perfiles', verifyToken, (req, res) => {
  const { foto } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { foto: foto },
    { new: true }
  )
    .then(updatedUser => {
      if (updatedUser) {
        // actualizar las variables locales
        res.locals.usuario = updatedUser.user;
        res.locals.fotoUsuario = updatedUser.foto;

        res.render('perfiles');
      } else {
        // No se encontró el usuario
        res.send('Usuario no encontrado');
      }
    })
    .catch(err => {
      console.log('Error al actualizar la foto del usuario', err);
      res.send('Error al actualizar la foto del usuario');
    });
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });

const xmlSchema = new mongoose.Schema({
  xmlData: Object
});

const XmlModel = mongoose.model('Xml', xmlSchema);

app.get('/upload', function(req, res) {
  res.render('upload.ejs');
});

app.post('/upload', upload.single('xmlFile'), function(req, res) {
  const xmlPath = req.file.path;

  fs.readFile(xmlPath, 'utf-8', function(err, data) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el archivo XML');
    }

    xml2js.parseString(data, function(err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al convertir el archivo XML a JSON');
      }

      const xmlInstance = new XmlModel({
        xmlData: result
      });

      xmlInstance.save()
        .then(() => {
          res.json({convertedData: result});  // Enviar el resultado de la conversión XML a JSON como respuesta
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send('Error al guardar el resultado en la base de datos');
        });
    });
  });
});

// Iniciar el servidor
/*app.listen(80, () => {
  console.log('Servidor iniciado en el puerto 80');
});*/
//Declarar el server para el socket
server.listen(80, () => {
  console.log('Servidor iniciado en el puerto 80');
});