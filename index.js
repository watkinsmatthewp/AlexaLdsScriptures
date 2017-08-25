// SETUP
var express = require("express"),
    alexa = require("alexa-app"),
    request = require("request"),
    PORT = process.env.PORT || 3000,
    app = express(),
    library = require('./library.js'),
    scriptureOfTheDay = require('./scripture-of-the-day.js'),
    alexaHandler = require('./alexahandler.js'),
    // Setup the alexa app and attach it to express before anything else.
    alexaApp = new alexa.app("");

// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  debug: true
});

app.set("view engine", "ejs");

library.load().then(function() {
  scriptureOfTheDay.library = library;
  alexaHandler.library = library;
  alexaHandler.scriptureOfTheDay = scriptureOfTheDay;
  
  alexaHandler.registerLaunchEventHandler(alexaApp);
  alexaHandler.registerCancelIntentHandler(alexaApp);
  alexaHandler.registerStopIntentHandler(alexaApp);
  alexaHandler.registerHelpIntentHandler(alexaApp);
  alexaHandler.registerSessionEndedEventHandler(alexaApp);

  alexaHandler.registerRandomVerseIntentHandler(alexaApp);
  alexaHandler.registerScriptureOfTheDayIntentHandler(alexaApp);
  alexaHandler.registerReadScriptureIntentHandler(alexaApp);
  
  app.listen(PORT, () => console.log("Listening on port " + PORT + "."));
});