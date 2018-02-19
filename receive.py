# Receive script
#
# Receives messages from AWS and prints to stdout
#
# @author Transnavigators
# 

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import json
import time


host = 'a1vgqh9vgvjzyh.iot.us-east-1.amazonaws.com'
rootCAPath = 'Certificates/root-CA.crt'
certificatePath = 'Certificates/Pi.cert.pem'
privateKeyPath = 'Certificates/Pi.private.key'
clientId = 'Receive'
topic = '/Transnavigators/Pi'

def callback(client, userdata, message):
    data_string = message.payload.decode("utf8").replace("'",'"')
    data_json = json.loads(data_string)
    print(json.dumps(data_json, indent=4))


print("Connecting to AWS")

# Init AWSIoTMQTTClient
aws_iot_mqtt_client = AWSIoTMQTTClient(clientId)
aws_iot_mqtt_client.configureEndpoint(host, 8883)
aws_iot_mqtt_client.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
aws_iot_mqtt_client.configureAutoReconnectBackoffTime(1, 32, 20)
aws_iot_mqtt_client.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
aws_iot_mqtt_client.configureDrainingFrequency(2)  # Draining: 2 Hz
aws_iot_mqtt_client.configureConnectDisconnectTimeout(10)  # 10 sec
aws_iot_mqtt_client.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
aws_iot_mqtt_client.connect()
aws_iot_mqtt_client.subscribe(topic, 1, callback)

print("Connected to " + topic)

while True:
    time.sleep(1)
