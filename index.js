// SETUP
var express = require("express"),
    alexa = require("alexa-app"),
    request = require("request"),
    PORT = process.env.PORT || 3000,
    app = express(),
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

alexaHandler.registerLaunchEventHandler(alexaApp);
alexaHandler.registerCancelIntentHandler(alexaApp);
alexaHandler.registerStopIntentHandler(alexaApp);
alexaHandler.registerHelpIntentHandler(alexaApp);
alexaHandler.registerSessionEndedEventHandler(alexaApp);

alexaHandler.registerRandomVerseIntentHandler(alexaApp);

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));