var Simulation = require("./ttownbot")
var Twit = require("twit")
var TwitterCreds = require("./TwitterCreds")()
var kii = require("kii-cloud-sdk").create()
var KiiServerCreds = require('./KiiServerCreds')()

var sim = new Simulation()
console.log("sim made successfully")

var clippedArgs = process.argv.slice(2);
var doTweet = false
if (clippedArgs.indexOf("doTweet") >= 0) {
  console.log("doTweet set to true")
  doTweet = true
}
var resetSim = false
if (clippedArgs.indexOf("resetSim") >= 0) {
  console.log("resetSim set to true")
  resetSim = true
}
var noSimulate = false
if (clippedArgs.indexOf("noSimulate") >= 0) {
  console.log("noSimulate set to true")
  noSimulate = true
}

function start() {
  console.log("initializing kii")
  sim.kiiLogin(kii.Kii, kii.KiiSite, kii.KiiUser, KiiServerCreds, onLoginSuccessful)
}

function onLoginSuccessful() {
  if (!resetSim) {
    console.log("loading from kii")
    sim.kiiLoad(kii.Kii, kii.KiiQuery, onLoadFinished)
  } else {
    console.log("resetting sim, so did not load")
    onLoadFinished()
  }
}

function onLoadFinished() {
  console.log("Sim time of day: " + sim.timeOfDay)
  var date = new Date()
  console.log("Current real time: " + date)
  var currentTimeOfDay = Math.floor(date.getHours() / 2)
  console.log("Current time of day: " + currentTimeOfDay)
  if (!noSimulate) {
    if (currentTimeOfDay !== sim.timeOfDay) {
      console.log("Time to simulate")
      sim.simulate()
      console.log("New sim time: " + sim.timeOfDay)
      console.log("Saving to kii")
      sim.kiiSave(kii.Kii)
    } else {
      console.log("Sim currently up to date. Exiting")
    }
  } else {
    console.log("not simulating")
  }

  if (!doTweet) {
    console.log("skipping tweet phase")
  } else {
    performTweet()
  }
}

function performTweet() {
  var tweeter = new Twit(TwitterCreds)
  tweeter.post('statuses/update', { status: sim.render(true) }, function(err, data, response) {
    console.log("Tweet posted")
    console.log(data)
  })
}


// time to go!
start()
