# AlexaVoiceControl

## Alexa Interface

**Invocation Name** : Wheelchair

### Intents

* **MoveForward** : Moves forward
* **Turn** : Turns the wheelchair a certain number of degrees
* **Stop** : Overrides the default Stop Intent for stopping the wheelchair
* **MoveTo** : Moves to a specified location
* **LocateMe** : Finds the user
* **Cancel** : Cancels the skill (Required for certification)

## Lambda Function

### Fields to Update
* `IOT_BROKER_ENDPOINT` : Endpoint of the IoT Thing
* `IOT_BROKER_REGION` : AWS IoT region
* `IOT_THING_NAME` : Name of the IoT Thing in AWS IoT
* `SKILL_APP_ID` : ID of this lambda function

*Handler* : index.handler

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
