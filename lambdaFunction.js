
//Environment Configuration
var config = {
};
config.IOT_BROKER_ENDPOINT      = "a295kd6qvlmey2.iot.us-east-1.amazonaws.com";
config.IOT_BROKER_REGION        = "us-east-1";
config.IOT_THING_NAME           = "Pi";

//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;

//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

exports.myHandler = function(intent, session, callback) {
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    var eventText = JSON.stringify(intent, null, 2);
    var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});
    //Set the pump to 1 for activation on the device
    var moving = false;
    var distance = 0;
    var angle = 0;
    if(intent.request.intent.name === "MoveRight") {
        angle = -intent.request.intent.slots.Degrees.value;
        moving = true;
    } else if(intent.request.intent.name === "MoveLeft") {
        angle = intent.request.intent.slots.Degrees.value;
        moving = true;
    } else if(intent.request.intent.name === "Stop") {

   	} else if(intent.request.intent.name === "MoveForward") {
        moving = true;
        distance = intent.request.intent.slots.Distance.value;
   	}
   	
   	var payloadObj= {
    	"state": {
    		"desired": {
    			"moving":moving,
    			"location":"Shiley Open Lab",
    			"destination":"Shiley 249",
    			"lat":0,
    			"long":0,
    			"distance":distance,
    			"angle":angle
    		}
    	}
    };
    //Prepare the parameters of the update call
    var paramsUpdate = {
        "thingName" : config.IOT_THING_NAME,
        "payload" : JSON.stringify(payloadObj)
        //"topic" : "/update"
        
    };
    /*var rtnMsg = {
        "header": {
            "messageId": intent.header.message,
            "name": "Hello",
            ""
        },
        "payload": {}
        
    };*/
    //Update Device Shadow
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
      if (err) {
        //Handle the error here
        callback("error"+err);
      }
      else {
        //callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
        callback(null, true);
      }
    });
}