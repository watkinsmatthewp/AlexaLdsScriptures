var alexaHandler = {};

alexaHandler.library = null;
alexaHandler.scriptureOfTheDay = null;

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
      var standardWorkID = alexaHandler.library.getStandardWorkID(request.slot('StandardWorkName'));
      return alexaHandler.library.getRandomVerse(standardWorkID).then(function(verse) {
        console.log(verse);
        response.shouldEndSession(false);
        response.say(verse.reference.replace(":", ", verse ") + ' says:<break time="1s"/> ' + verse.text + ' <break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you\'re all done.');
      });
    }
  );
}

alexaHandler.registerScriptureOfTheDayIntentHandler = function(alexaApp) {
  alexaApp.intent("ScriptureOfTheDay", {
      "slots": {
        'standardWorkID': 'StandardWorkName'
      },
      "utterances": [
        'from {-|standardWorkID}'
      ]
    }, function(request, response) {
      console.log('Processing ScriptureOfTheDay intent');
      var standardWorkID = alexaHandler.library.getStandardWorkID(request.slot('StandardWorkName'));
      response.shouldEndSession(false);
      var verses = alexaHandler.scriptureOfTheDay.get(standardWorkID);
      response.say(verses[0].reference.replace(":", ", verse ") + ' says:<break time="1s"/> ' + verses[0].text + ' <break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you\'re all done.');
    }
  );
}

alexaHandler.registerReadScriptureIntentHandler = function(alexaApp) {
  alexaApp.intent("ReadScripture", {
      "slots": {
        'bookName': 'BookName',
        'chapterNumber': 'ChapterNumber',
        'startVerseNumber': 'StartVerseNumber',
        'endVerseNumber': 'EndVerseNumber'
      },
      "utterances": []
    }, function(request, response) {
      response.shouldEndSession(false);
      console.log('Processing ReadScripture intent');
      var reference = request.slot('BookName').replace('st', '').replace('nd', '').replace('rd', '').replace('th', '') + ' ' + request.slot('ChapterNumber');
      if (request.slot('StartVerseNumber')) {
        reference += ':' + request.slot('StartVerseNumber');
        if (request.slot('EndVerseNumber')) {
          reference += '-' + request.slot('EndVerseNumber');
        }
      }
    
      var verses = alexaHandler.library.getVerses(reference);
      var text = '';
      for (var verseIdx = 0; verseIdx < verses.length; verseIdx++) {
        text += (verseIdx == 0 ? verses[0].reference.replace(":", ", verse ") : 'verse ' + (verseIdx + 1));
        text += '<break time="1s"/>';
        text += verses[verseIdx].text;
      }
      response.say(text);
    }
  );
}

module.exports = alexaHandler;

function read(verse) {
  var text = verse.text.replace('&', ' and ');
  var reference = verse.reference.replace('D&C', 'Doctrine and Covenants').replace(":", ", verse ");
  return reference + ' says:<break time="1s"/> ' + text + '<break time="1s"/>. Say \"next\" to hear another verse, or \"stop\" if you are done.';
}