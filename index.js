// CONSTANTS
var chaptersByBook = [
  22, // 1 Nephi
  33, // 2 Nephi
  7,  // Jacob 7
  1,  // Enos
  1,  // Jarom
  1,  // Omni
  1,  // Words of Mormon
  29, // Mosiah
  63, // Alma
  16, // Helaman
  30, // 3 Nephi
  1,  // 4 Nephi
  9,  // Mormon
  15, // Ether
  10  // Moroni
];

var bookOfMormonCache = null;

// SETUP
var express = require("express"),
    alexa = require("alexa-app"),
    request = require("request"),
    PORT = process.env.PORT || 3000,
    app = express(),
    // Setup the alexa app and attach it to express before anything else.
    alexaApp = new alexa.app("");

// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  debug: true
});

app.set("view engine", "ejs");

alexaApp.launch(function(request, response) {
  console.log("App launched");
  response.shouldEndSession(false);
  response.say('Welcome to Power in the Book<break time="1s"/>. Say \"random verse\" to hear a randomly selected verse from the Book of Mormon.');
});

// The main Weather intent - checks if a day/date was supplied or not and sends the appropriate response
alexaApp.intent("GetRandomVerse", {
    "slots": { },
    "utterances": [
      "Random verse",
      "Read a random verse",
      "Read a verse",
      "Next"
    ]
  },
  function(request, response) {
    return getRandomVerse().then(function(verse) {
      response.shouldEndSession(false);
      response.say(verse.reference.replace(":", ", verse ") + ' says:<break time="1s"/> ' + verse.text + ' <break time="1s"/>Say \"next\" to hear another verse, or \"stop\" if you\'re all done.');
    }).catch(function(err) {
      console.log(err);
      response.say('Error getting a random verse. Try again later');
    });
  }
);

alexaApp.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent cancel response");
  	response.say("Ok, sure thing");
  	return;
  }
);

alexaApp.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent stop response");
  	response.say("Alright, I'll stop");
  	return;
  }
);

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

alexaApp.sessionEnded(function(request, response) {
  console.log("In sessionEnded");
  console.error('Alexa ended the session due to an error');
  // no response required
});

function getRandomVerse() {  
  return new Promise(function(resolve, reject) {
    if (bookOfMormonCache) {
      console.log('Using cache');
      resolve(getRandomVerseFrom(bookOfMormonCache));
    } else {
      console.log('Downloading Book of Mormon');
      request({
          url: 'https://raw.githubusercontent.com/bcbooks/scriptures-json/master/book-of-mormon.json',
          json: true
        }, function(err, res, body) {
          console.log('Book of Mormon downloaded');  
          bookOfMormonCache = body;
          resolve(getRandomVerseFrom(bookOfMormonCache));
        }
      );
    }
  });
};

function getRandomVerseFrom(bookOfMormon) {
  console.log('Getting a random verse...');
  var allChaptersCount = 0;
  for (var i = 0; i < chaptersByBook.length; i++) {
    allChaptersCount += chaptersByBook[i];
  }

  var selectedChapterIdx = chooseRandom(allChaptersCount);
  var selectedBookIdx = -1;
  for (var i = 0; i < chaptersByBook.length; i++) {
    if (chaptersByBook[i] >= selectedChapterIdx) {
      selectedBookIdx = i;
      break;
    }
    selectedChapterIdx-= chaptersByBook[i];
  }

  console.log('Selected book idx ' + selectedBookIdx);
  var book = bookOfMormon.books[selectedBookIdx];    
  console.log('Selected book ' + book.book);
  
  console.log('Selected chapter idx ' + selectedChapterIdx);
  var chapter = book.chapters[selectedChapterIdx];
  
  var verseIdx = chooseRandom(chapter.verses.length - 1);
  console.log('Selected verse idx ' + verseIdx);
  var verse = chapter.verses[verseIdx];
  console.log('Selected verse text: ' + verse.text);
  
  return verse;
}

function chooseRandom(max) {
  return Math.floor(Math.random() * (max + 1));
}

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));