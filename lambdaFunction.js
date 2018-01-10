'use strict'

/**
 * Wheelchair Controller Lambda Function
 *
 *
 *
 */

//Environment Configuration
var IOT_BROKER_ENDPOINT      = 'a1vgqh9vgvjzyh.iot.us-east-1.amazonaws.com';
var IOT_BROKER_REGION        = 'us-east-1';
var IOT_THING_NAME           = 'Pi';
var skillAppID               = 'amzn1.ask.skill.cb64fd35-2d9a-4c28-a3a8-7c23168e1b9f';

//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = IOT_BROKER_REGION;

//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: IOT_BROKER_ENDPOINT});


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome to the Transnavigators\' Voice Controlled Wheelchair';
    const speechOutput = 'Welcome to the Transnavigators\' Voice Controlled Wheelchair.';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = null;
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = 'Session Ended';
    const speechOutput = 'Thank you for trying the Transnavigators\'s Voice Controlled Wheelchair. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
	   	
   	var payloadObj= {
    	'state': {
    		'desired': {
    		    'type':'Stop'
    		}
    	}
    };
    //Prepare the parameters of the update call
    var paramsUpdate = {
        'thingName' : IOT_THING_NAME,
        'payload' : JSON.stringify(payloadObj)
        
    };
    
    //Update Device Shadow
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
      if (err) {
        //Handle the error here
        callback('error'+err);
      }
      else {
        callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
      }
    });
}

function handleWheelchairCommand(intent, session, callback) {
    const intentName = intent.name;
	
	var repromptText = null;
	var speechOutput = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    
	   	
   	var payloadObj= {
    	'state': {
    		'desired': {}
    	}
    };
    
    if (intentName === 'Turn') {
        payloadObj.state.desired.type = 'Turn';
        if (intent.slots.direction.value) {
            speechOutput = 'Turning ' + intent.slots.direction.value;
            payloadObj.state.desired.direction = intent.slots.direction.value;
            if (intent.slots.angle.value) {
                payloadObj.state.desired.angle = intent.slots.angle.value;
                speechOutput += ' ' + intent.slots.angle.value;
            }
            else {
                payloadObj.state.desired.angle = 90;
            }
            payloadObj.state.desired.angleUnit = intent.slots.angleUnit.value;
        }
        else {
            repromptText = 'What direction';
        }
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'Stop') {
        speechOutput = 'Stopping';
		payloadObj.state.desired.type = 'Stop';
   	} else if (intentName === 'MoveForward') {
   	    speechOutput = 'Moving Forward';
		payloadObj.state.desired.type = 'Forward';
		if (intent.slots.distance.value) {
			payloadObj.state.desired.distance = intent.slots.distance.value;
	    	payloadObj.state.desired.distanceUnit = intent.slots.distanceUnit.value;
			speechOutput += ' ' + intent.slots.distance.value + ' ' + intent.slots.distanceUnit.value;
		}
   	} else if (intentName === 'LocateMe'){
   	    speechOutput = 'Transnavigating to you';
		payloadObj.state.desired.type = 'Locate';
   	} else if (intentName === 'MoveTo') {
   	    payloadObj.state.desired.type = 'Move';
   	    speechOutput = 'Moving'
   	    if (intent.slots.location.value) {
   	        payloadObj.state.desired.location = intent.slots.location.value;
   	        speechOutput += " to the " + intent.slots.location.value;
   	    }
   	}
    else{
        throw new Error('Invalid intent');
    }

    //Prepare the parameters of the update call
    var paramsUpdate = {
        'thingName' : IOT_THING_NAME,
        'payload' : JSON.stringify(payloadObj)
        //'topic' : '/update'
        
    };
	
    //Update Device Shadow
    iotData.updateThingShadow(paramsUpdate, function(err, data) {
      if (err) {
        //Handle the error here
        callback('error'+err);
      }
      else {
        callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
      }
    });

}

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;
    
	
    // Dispatch to your skill's intent handlers
    if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        handleWheelchairCommand(intent, session, callback);
    }
    
}


/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);

        //Prevent someone else from configuring a skill that sends requests to this function.        
        if (event.session.application.applicationId !== skillAppID) {
             callback('Invalid Application ID');
        }
        

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};

