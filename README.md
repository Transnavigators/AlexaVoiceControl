# Voice Control Interface

Voice Control Interface controls the Transnavigators' Voice Controlled Wheelchair.  This interface allows users to speak commands to an Echo (Dot) which will send messages to direct the wheelchair based on the commands given.  Upon receiving a message, Alexa will confirm the message and the wheelchair will begin moving.

A typical exchange is a follows:

* User: "Start my wheelchair"
* Alexa: "Welcome to the Transnavigators' Voice Controlled Wheelchair"
* User: "Come to me"
* Alexa: "Transnavigating to you"
* User: "Move forward"
* Alexa: "Moving forward"
* User: "Stop"
* Alexa: "Stopping"
* User: "Turn left 45 degrees"
* Alexa: "Turning left 45 degrees"
* User: "Bring me to the couch"
* Alexa: "Moving to the couch"
* User: "Exit"

The interface consists of three files:

* Alexa Interface
* Lambda Function
* Receive Script

The Alexa Interface is a JSON file that Alexa uses to recognize the commands a user can give.
The Lambda Function runs in AWS Lambda and sends data through AWS IoT to the wheelchair.  It is written for Lambda's Node.js 6.10 runtime.
The Receive Script is a test script written in Python that receives data from AWS and prints it to the console.  It requires the installation of AWSIoTPythonSDK.


## Alexa Interface

The Alexa Interface defines 8 different intents for interfacing with the wheelchair

**Invocation Name** : Wheelchair

### Intents

* **MoveForward** : Moves forward
* **Turn** : Turns the wheelchair a certain number of degrees
* **Stop** : Overrides the default Stop Intent for stopping the wheelchair
* **MoveTo** : Moves to a specified location (unimplemented in the final version of the chair)
* **LocateMe** : Finds the user (unimplemented in the final version of the chair)
* **AMAZON.CancelIntent** : Cancel required for certification (Closes the skill)
* **AMAZON.HelpIntent** : Help required for certification
* **AMAZON.StopIntent** : Stop required for certification (Does the same thing as the Stop intent)


## Lambda Function

The Lambda Function transforms output from Alexa into the proper format for the wheelchair.  All messages sent using AWS IoT to the topic /Transnavigators/Pi.

### Fields to Update

* `IOT_BROKER_ENDPOINT` : Endpoint of the IoT Thing
* `IOT_BROKER_REGION` : AWS IoT region
* `IOT_THING_NAME` : Name of the IoT Thing in AWS IoT
* `SKILL_APP_ID` : ID of this lambda function
* `TOPIC` : The topic to publish to
* `QOS` : (Optional) The QoS of the MQTT service

**Handler** : index.handler

### Output JSON

* **MoveForward**

```
{
  "type" : "forward" 
  "distance" : How far to move forward
  "distanceUnit" : Units for the distance number ("meters" or "feet") (optional: empty means feet)
}
```

* **Turn**

```
{
  "type" : "turn" 
  "direction" : "left" or "right"
  "angle" : Number of degrees to turn
  "angleUnit" : "degrees" or "radians"
}
```

* **Stop**

```
{
  "type" : "stop"
}
```

* **MoveTo** (unimplemented in the final version of the chair)

```
{
  "type" : "move" 
  "location" : Where to move to
}
```

* **LocateMe** (unimplemented in the final version of the chair)

```
{
  "type" : "locate"
}
```

## Receive script

Receives messages from AWS and prints to stdout

`data_json` : the message in json format 


### Fields to Update

* `host` : the thing's REST API endpoint
* `rootCAPath` : Path to the root-CA.crt file
* `certificatePath` : Path to the *.cert.pem file
* `privateKeyPath` : Path to the *.private.key file
* `clientId` : Unique name
* `topic` : Topic that the lambda function is publishing to
