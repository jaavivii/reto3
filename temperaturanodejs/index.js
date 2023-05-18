var sensor = require("node-dht-sensor");
const port = 3000;
const mongoose = require('mongoose');
const express = require("express");
const app = express();
app.use(express.json());
const fs = require('fs');


app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

main().catch(err => console.log(err));

//Conectar MongoDB
async function main(){
    await mongoose.connect('mongodb+srv://Irusta:Almi123@cluster0.iryrcv0.mongodb.net/?retryWrites=true&w=majority');
}

var datos = mongoose.Schema({
    temp: String,
    hum: String
});

var DatosModel = mongoose.model('pruebas', datos);

//Conectar MQTT
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://irusta:Almi123@54.163.167.212')

client.on('connect', function () {
  console.log('MQTT connected')
})

client.on("error", function(err) {
  console.log("Error: " + err)
  if(err.code == "ENOTFOUND") {
      console.log("Network error, make sure you have an active internet connection") 
  }
})

client.on("close", function() {
  console.log("Connection closed by client")
})

client.on("reconnect", function() {
  console.log("Client trying a reconnection")
})

client.on("offline", function() {
  console.log("Client is currently offline")
})
//enviar datos
function leer(){
sensor.read(11, 4, function(err, temperature, humidity) {
  if (!err) {
    console.log(`temp: ${temperature}°C, humidity: ${humidity}%`);

    var temperatura = temperature;
    var humedad = humidity;

   //enviar MongoDB

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));

    var datosInstance = new DatosModel({
        temp: temperatura,
        hum: humedad
    });

    datosInstance.save()
    .then((result) => {
      console.log(result.username + " saved to usuarios collection.");
    })
    .catch((error) => {
      console.error(error);
    });

   //enviar MQTT

   if (client.connected) {
    var datos = {temperatura: temperatura.toString(), humedad: humedad.toString()};
    client.publish('home/temperaturas', JSON.stringify(datos));
    console.log('enviado');
      if (err) {
        console.log(err);
      }
    };
  } else {
    console.log(err);
  }
});
}
var intervalo = 3000;
setInterval(leer, intervalo);



