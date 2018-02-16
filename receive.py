from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient
import logging
import time
import argparse
import json


host = 'a1vgqh9vgvjzyh.iot.us-east-1.amazonaws.com'
rootCAPath = 'Certificates/root-CA.crt'
certificatePath = 'Certificates/Pi.cert.pem'
privateKeyPath = 'Certificates/Pi.private.key'
clientId = 'Pi'
topic = '/Transnavigators/Pi'

def callback(client, userdata, message):
    data_string = message.payload.decode("utf8").replace("'",'"')
    data_json = json.loads(data_string)
    print(json.dumps(data_json, indent=4))


print("Connecting to AWS")

# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId)
myAWSIoTMQTTClient.configureEndpoint(host, 8883)
myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()
myAWSIoTMQTTClient.subscribe(topic, 1, callback)

print("Connected to " + topic)

while True:
    time.sleep(1)
