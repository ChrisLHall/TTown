var Simulation = require("./ttownbot")
var Twit = require("twit")
var TwitterCreds = require("./TwitterCreds")()
var kii = require("kii-cloud-sdk").create()
var KiiServerCreds = require('./KiiServerCreds')()

var sim = new Simulation()
var tweeter = new Twit(TwitterCreds)
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
  if (sim.lastTweetID && sim.askedQuestion) {
    console.log("Scanning for answers to last question")
    searchForReplies(sim.lastTweetID, sim.askedQuestion, startSimulation)
  } else {
    startSimulation()
  }
}

function searchForReplies(lastTweetID, askedQuestion, onSearchComplete) {
  tweeter.get('search/tweets', { q: 'to:TinyTownSim', since_id: lastTweetID, count: 100 }, function(err, data, response) {
    if (data.statuses) {
      console.log("Total replies: " + data.statuses.length)
      var directReplies = 0
      var countedVotes = {}
      for (var option = 0; option < askedQuestion.options.length; option++) {
          countedVotes[askedQuestion.options[option].keyword] = []
      }
      for (var j = 0; j < data.statuses.length; j++) {
        var status = data.statuses[j]
        var userID = status.user.id
        if (status.in_reply_to_status_id === lastTweetID) {
          for (var key in countedVotes) {
            if (countedVotes.hasOwnProperty(key)) {
              // make sure they said the keyword
              if (status.text.includes(key)) {
                var votesList = countedVotes[key]
                if (votesList.indexOf(userID) === -1) {
                  // only add users who did not already vote
                  votesList.push(userID)
                }
                break
              }
            }
          }
          directReplies++
        }
      }
      console.log("Direct replies to this status: " + directReplies)
      for (var key in countedVotes) {
        if (countedVotes.hasOwnProperty(key)) {
          var totalVotes = countedVotes[key].length
          console.log(key + " got votes: " + totalVotes)
        }
      }
    }
    onSearchComplete()
  })
}

var simulated = false
function startSimulation() {
  simulated = false
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
      simulated = true
    } else {
      console.log("Sim currently up to date. Exiting")
      return
    }
  } else {
    console.log("not simulating")
  }

  if (!doTweet) {
    console.log("skipping tweet phase")
    sim.setLastTweet(null, null)
    afterTweet()
  } else {
    performTweet()
  }
}

function performTweet() {
  tweeter.post('statuses/update', { status: sim.render(true) }, function(err, data, response) {
    console.log("Tweet posted")
    console.log(data)
    sim.setLastTweet(data.id, data.id_str)
    afterTweet()
  })
}

function afterTweet() {
  if (simulated) {
    console.log("Saving to kii")
    sim.kiiSave(kii.Kii)
  }
}


// time to go!
start()
