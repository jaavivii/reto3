const mqtt = require('mqtt')
var sensor = require("node-dht-sensor")
const client  = mqtt.connect('mqtt://irusta:Almi123@34.226.194.99')
var tem
client.on('connect', function () {
  client.subscribe('temperaturas', function (err) {
    if (!err) {
      client.publish('temperaturas', 'hola')
    }
  })
 
})


client.on('message', function (temperaturas, message) {
  // message is Buffer
  console.log(message.toString())
  
})
