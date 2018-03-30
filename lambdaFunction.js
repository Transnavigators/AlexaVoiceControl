'use strict'

/**
 * Wheelchair Controller Lambda Function
 *
 * Transforms output from Alexa into the proper format for the wheelchair.
 * All messages sent using AWS IoT to the topic /Transnavigators/Pi.
 *
 * @author Transnavigators
 *
 */

//Environment Configuration
var IOT_BROKER_ENDPOINT      = 'a1vgqh9vgvjzyh.iot.us-east-1.amazonaws.com';
var IOT_BROKER_REGION        = 'us-east-1';
var IOT_THING_NAME           = 'Pi';
var SKILL_APP_ID             = 'amzn1.ask.skill.cb64fd35-2d9a-4c28-a3a8-7c23168e1b9f';
var TOPIC                    = '/Transnavigators/Pi';
var QOS                      = 1;

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
    const speechOutput = 'Thank you for trying the Transnavigators\' Voice Controlled Wheelchair. Have a nice day!';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;
	
	// Stop command
	var payload =  {'type':'stop'}
	
    // Prepare state information message
    var data = {
        'topic' : TOPIC,
        'payload' : JSON.stringify(payload),
        'qos' : QOS
    };
	
    // Publish message
    iotData.publish(data, function(err, data) {
      if (err) {
        // Handle the error here
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
    
	// Holds movement data
   	var payload= {};
    
    if (intentName === 'Turn') {
        // Turn type
        payload.type = 'turn';
        
        // Set direction
        if (intent.slots.direction.value == 'right' || intent.slots.direction.value == 'left') {
            payload.direction = intent.slots.direction.value;
            speechOutput = 'Turning ' + payload.direction;
        }
        else {
            // default is right
            payload.direction = 'right';
            speechOutput = 'Turning right';
        }
        
        // set angle if exists
        if (intent.slots.angle.value && intent.slots.angle.value != '?') {
            payload.angle = parseInt(intent.slots.angle.value);
            // set angle unit
            if (intent.slots.angleUnit.value) {
                payload.angleUnit = intent.slots.angleUnit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }
            else {
                // default is degrees
                payload.angleUnit = 'degrees';
            }
            speechOutput += ' ' + payload.angle + ' ' + payload.angleUnit;
        }
        else {
            // default is 90 degrees
            payload.angle = 90;
            payload.angleUnit = 'degrees';
        }
        
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'Stop') {
        // Stop type
        speechOutput = 'Stopping';
		payload.type = 'stop';
   	} else if (intentName === 'MoveForward') {
   	    // Move forward type
   	    speechOutput = 'Moving Forward';
		payload.type = 'forward';
		
		// Set distance if exists
		if (intent.slots.distance.value && intent.slots.distance.value != '?') {
			payload.distance = parseInt(intent.slots.distance.value);
			
			// Get distance unit if it exists
			if (intent.slots.distanceUnit.value) {
			    payload.distanceUnit = intent.slots.distanceUnit.resolutions.resolutionsPerAuthority[0].values[0].value.name;
			}
			else {
			    // default is feet
			    payload.distanceUnit = 'feet';
			}
			
			speechOutput += ' ' + payload.distance + ' ' + payload.distanceUnit;
		}
		
   	} else if (intentName === 'LocateMe'){
   	    // Locate me type
   	    speechOutput = 'Transnavigating to you';
		payload.type = 'locate';
        
        // Not implemented so change speech
        speechOutput = 'Navigating to the user is not supported in this version of the system'
   	} else if (intentName === 'MoveTo') {
   	    // Move to type
   	    payload.type = 'move';
   	    speechOutput = 'Moving'
   	    
   	    // Get location
   	    if (intent.slots.location.value) {
   	        payload.location = intent.slots.location.resolutions.resolutionsPerAuthority[0].values[0].value.name;
   	        speechOutput += ' to the ' + payload.location;
   	    }
        
        // Not implemented so change speech
        speechOutput = 'Moving to a location is not supported in this version of the system'
   	}
    else{
        throw new Error('Invalid intent');
    }

    // Prepare state information data
    var data = {
        'topic' : TOPIC,
        'payload' : JSON.stringify(payload),
        'qos' : QOS
    };
	
    // Publish message
    iotData.publish(data, function(err, data) {
      if (err) {
        // Handle the error here
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
        if (event.session.application.applicationId !== SKILL_APP_ID) {
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