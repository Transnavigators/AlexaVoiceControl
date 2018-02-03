from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTShadowClient
import logging
import time
import argparse
import json

def callback(payload, responseStatus, token):
    data = json.loads(payload)['state']
    
    print(data);
    
    # Delete shadow JSON doc
    deviceShadowHandler.shadowDelete(callbackDelete, 5)

def callbackDelete(payload, responseStatus, token):
    if responseStatus == "accepted":
        pass
    if responseStatus == "timeout":
        print("Delete request " + token + " time out")
    if responseStatus == "rejected":
        print("Delete request " + token + " rejected")
    

host = 'a1vgqh9vgvjzyh.iot.us-east-1.amazonaws.com'
rootCAPath = 'Certificates/root-CA.crt'
certificatePath = 'Certificates/Pi.cert.pem'
privateKeyPath = 'Certificates/Pi.private.key'
clientId = 'Pi'
topic = '/get/accepted'

# # Configure logging
# logger = logging.getLogger("AWSIoTPythonSDK.core")
# logger.setLevel(logging.INFO)
# streamHandler = logging.StreamHandler()
# formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# streamHandler.setFormatter(formatter)
# logger.addHandler(streamHandler)

# Shadow Client
# Init AWSIoTMQTTClient
myAWSIoTMQTTShadowClient = AWSIoTMQTTShadowClient(clientId)
myAWSIoTMQTTShadowClient.configureEndpoint(host, 8883)
myAWSIoTMQTTShadowClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTShadowClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTShadowClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTShadowClient.configureMQTTOperationTimeout(5)  # 5 sec

myAWSIoTMQTTShadowClient.connect()
deviceShadowHandler = myAWSIoTMQTTShadowClient.createShadowHandlerWithName("Pi", True)
deviceShadowHandler.shadowRegisterDeltaCallback(callback);
while True:
    time.sleep(1)
    
    
    

# def callbackTopic(client, userdata, message):
    # print("Received a new message: ")
    # print(message.payload)
    # print("from topic: ")
    # print(message.topic)
    # print("--------------\n\n")

# # Init AWSIoTMQTTClient
# myAWSIoTMQTTClient = AWSIoTMQTTClient(clientId)
# myAWSIoTMQTTClient.configureEndpoint(host, 8883)
# myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# # AWSIoTMQTTClient connection configuration
# myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
# myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
# myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
# myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
# myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# # Connect and subscribe to AWS IoT
# myAWSIoTMQTTClient.connect()
# myAWSIoTMQTTClient.subscribe(topic, 1, callbackTopic)


