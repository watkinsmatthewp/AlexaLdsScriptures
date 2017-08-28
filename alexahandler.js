var alexaHandler = {};

alexaHandler.helpText = 'Say what passage you want to read, say \"scripture of the day,\" or say \"surprise me.\"';

alexaHandler.library = null;
alexaHandler.scriptureOfTheDay = null;

// COMMON AMAZON EVENTS
alexaHandler.registerLaunchEventHandler = function(alexaApp) {
  alexaApp.launch(function(request, response) {
    console.log("App launched");
    response.shouldEndSession(false);
    response.say('Hello. Welcome to L. D. S. Library.<break time="1s"/>' + alexaHandler.helpText);
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
      response.say("Alright, goodbye.");
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
      response.say(alexaHandler.helpText);
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
alexaHandler.registerRandomVerseIntentHandler = function(alexaApp) {
  alexaApp.intent("RandomVerse", {
      "slots": {
        'standardWorkID': 'StandardWorkName'
      },
      "utterances": [
        'from {-|standardWorkID}'
      ]
    }, function(request, response) {
      response.shouldEndSession(false);  
      var standardWorkID = alexaHandler.library.getStandardWorkID(request.slot('StandardWorkName'), false, true);
      var randomVerse = alexaHandler.library.getRandomVerse(standardWorkID);
      response.say(readVerse(randomVerse) + '<break time="1s"/>' + alexaHandler.helpText);
  });
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
      response.shouldEndSession(false);  
      console.log('Processing ScriptureOfTheDay intent');
      var standardWorkID = alexaHandler.library.getStandardWorkID(request.slot('StandardWorkName'), true, false);
      var verses = alexaHandler.scriptureOfTheDay.get(standardWorkID);
      response.say(readVerses(verses) + '<break time="1s"/>' + alexaHandler.helpText);
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
      if (verses.length > 3) { 
        response.say('Sorry, I can\'t read more than three verses at a time. Please try again with three verses or less.');
      } else {
        response.say(readVerses(verses) + '<break time="1s"/>' + alexaHandler.helpText);
      }
    }
  );
}

module.exports = alexaHandler;

function readVerse(verse) {
  return readVerses([ verse ]);
}
  
function readVerses(verses) {
  var text = '';
  for (var verseIdx = 0; verseIdx < verses.length; verseIdx++) {
    if (verseIdx > 0) {
      text += '<break time="1s"/>';
    }
    text += (verseIdx == 0 ? verses[0].reference.replace(":", ", verse ") : 'verse ' + (verseIdx + 1));
    text += '<break time="1s"/>';
    text += verses[verseIdx].text;
  }
  return text;
}