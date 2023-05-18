import RPi.GPIO as GPIO
import time
import paho.mqtt.client as mqtt
import json

# Define el pin TRIGGER y el pin ECHO
TRIGGER_PIN = 15
ECHO_PIN = 14

# Configura los pines GPIO de la Raspberry Pi
GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIGGER_PIN, GPIO.OUT)
GPIO.setup(ECHO_PIN, GPIO.IN)

# Configuración del cliente MQTT
broker_address = "54.163.167.212"
client = mqtt.Client("raspberry_pi")
client.connect(broker_address)

def medir_distancia():
    # Envía una señal de pulso al pin TRIGGER
    GPIO.output(TRIGGER_PIN, GPIO.HIGH)
    time.sleep(0.00001)
    GPIO.output(TRIGGER_PIN, GPIO.LOW)

    # Espera hasta que el pin ECHO se ponga en HIGH
    while GPIO.input(ECHO_PIN) == 0:
        pulse_start_time = time.time()

    # Espera hasta que el pin ECHO se ponga en LOW nuevamente
    while GPIO.input(ECHO_PIN) == 1:
        pulse_end_time = time.time()

    # Calcula la duración del pulso
    pulse_duration = pulse_end_time - pulse_start_time

    # Calcula la distancia utilizando la fórmula d = v * t / 2
    velocidad_del_sonido = 34300  # cm/s
    distancia = (velocidad_del_sonido * pulse_duration) / 2

    return distancia

# Bucle infinito para medir la distancia y enviarla por MQTT cada 2 segundos
while True:
    print("Midiendo distancia...")
    distancia = medir_distancia()
    print("Distancia:", distancia, "cm")

    # Crea un diccionario con la distancia
    mensaje = {"distancia":str(distancia)}

    # Convierte el diccionario a una cadena de texto JSON
    mensaje_json = json.dumps(mensaje)

    # Envía el mensaje por MQTT

    client.publish("home/temperaturas", '{{"distancia":"{:.2f}"}}'.format(distancia))


    time.sleep(2)
# Limpia los pines GPIO
GPIO.cleanup()
