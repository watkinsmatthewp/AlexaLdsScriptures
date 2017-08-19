var library = require('./library.js');
var verseOfTheDay = require('./verse-of-the-day.js');

var alexaHandler = {};

// COMMON AMAZON EVENTS
alexaHandler.registerLaunchEventHandler = function(alexaApp) {
  alexaApp.launch(function(request, response) {
    console.log("App launched");
    response.shouldEndSession(false);
    response.say('Hello. App launched');
  });
};

alexaHandler.registerCancelIntentHandler = function(alexaApp) {
  alexaApp.intent("AMAZON.CancelIntent", {
      "slots": {},
      "utterances": []
    }, function(request, response) {
      console.log("Sent cancel response");
      response.say("Ok, sure thing");
      return;
    }
  );
};

alexaHandler.registerStopIntentHandler = function(alexaApp) {
  alexaApp.intent("AMAZON.StopIntent", {
      "slots": {},
      "utterances": []
    }, function(request, response) {
      console.log("Sent stop response");
      response.say("Alright, I'll stop");
      return;
    }
  );
};

alexaHandler.registerHelpIntentHandler = function(alexaApp) {
  alexaApp.intent("AMAZON.HelpIntent", {
      "slots": {},
      "utterances": []
    }, function(request, response) {
      console.log("Sent help response");
      response.shouldEndSession(false);
      response.say("Say \"random verse\" to hear a randomly selected verse from the Book of Mormon.");
      return;
    }
  );
};

alexaHandler.registerSessionEndedEventHandler= function(alexaApp) {
  alexaApp.sessionEnded(function(request, response) {
    console.log("In sessionEnded");
    console.error('Alexa ended the session due to an error');
    // no response required
  });
};

// LIBRARY EVENTS
alexaHandler.registerHelpIntentHandler = function(alexaApp) {
  alexaApp.intent("Hello", {
      "slots": {},
      "utterances": [
        "Hello"
      ]
    }, function(request, response) {
      response.shouldEndSession(false);
      response.say("Hello world, it's me");
    }
  );
};

alexaHandler.registerRandomVerseIntentHandler = function(alexaApp) {
  alexaApp.intent("RandomVerse", {
      "slots": {
        'standardWorkID': 'StandardWorkName'
      },
      "utterances": [
        'from {-|standardWorkID}'
      ]
    }, function(request, response) {
      var standardWorkID = library.getStandardWorkID(request.slot('StandardWorkName'));
      return library.getRandomVerse(standardWorkID).then(function(verse) {
        console.log(verse);
        response.shouldEndSession(false);
        response.say(verse.reference.replace(":", ", verse ") + ' says:<break time="1s"/> ' + verse.text + ' <break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you\'re all done.');
      });
    }
  );
}

alexaHandler.registerVerseOfTheDayIntentHandler = function(alexaApp) {
  alexaApp.intent("VerseOfTheDay", {
      "slots": {
        'standardWorkID': 'StandardWorkName'
      },
      "utterances": [
        'from {-|standardWorkID}'
      ]
    }, function(request, response) {
      var standardWorkID = library.getStandardWorkID(request.slot('StandardWorkName'));
      return verseOfTheDay.get(standardWorkID).then(function(verses) {
        response.shouldEndSession(false);
        response.say(verses[0].reference.replace(":", ", verse ") + ' says:<break time="1s"/> ' + verses[0].text + ' <break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you\'re all done.');
      });
    }
  );
}

module.exports = alexaHandler;

function read(verse) {
  var text = verse.text.replace('&', ' and ');
  var reference = verse.reference.replace('D&C', 'Doctrine and Covenants').replace(":", ", verse ");
  return reference + ' says:<break time="1s"/> ' + text + '<break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you are done.';
}