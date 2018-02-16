# Voice Control Interface



## Alexa Interface

The Alexa Interface defines 8 different intents for interfacing with the wheelchair

**Invocation Name** : Wheelchair

### Intents

* **MoveForward** : Moves forward
* **Turn** : Turns the wheelchair a certain number of degrees
* **Stop** : Overrides the default Stop Intent for stopping the wheelchair
* **MoveTo** : Moves to a specified location
* **LocateMe** : Finds the user
* **AMAZON.CancelIntent** : Cancel required for certification
* **AMAZON.HelpIntent** : Help required for certification
* **AMAZON.StopIntent** : Stop required for certification (Does the same thing as the Stop intent


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
  "distance" : How far to move forward (optional: empty means infinity)
  "distanceUnit" : Units for the distance number (optional: empty means infinity)
}
```

* **Turn**

```
{
  "type" : "turn" 
  "angle" : Number of degrees to turn
  "angleUnit" : "degrees"
}
```

* **Stop**

```
{
  "type" : "stop"
}
```

* **MoveTo**

```
{
  "type" : "move" 
  "location" : Where to move to
}
```

* **LocateMe**

```
{
  "type" : "locate"
}
```

## Receive script

Receives messages from AWS and prints to stdout

*data_json* : message in json format 


### Fields to Update

* `host` : the thing's REST API endpoint
* `rootCAPath` : Path to the root-CA.crt file
* `certificatePath` : Path to the *.cert.pem file
* `privateKeyPath` : Path to the *.private.key file
* `clientId` : Thing name
* `topic` : Topic lambda function is publishing to
