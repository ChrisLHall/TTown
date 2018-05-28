;(function () {
  function listRand(list) { return list[Math.floor(Math.random() * list.length)] }
  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  var WIDTH = 12
  var HEIGHT = 9

  function initMap(tileTypes, template) {
    console.log(template ? "map template" : "no map template")
    var map = []
    for (var row = 0; row < HEIGHT; row++) {
      var rowList = []
      var tempStr = template ? template[row] : null;
      for (var col = 0; col < WIDTH; col++) {
        var tile = template ? tempStr[col] : "?";
        if (tile === "?") {
          tile = listRand(tileTypes)
        }
        rowList.push(tile)
      }
      map.push(rowList)
    }
    return map
  }

  var EMOJI_SUBS = {
    "?": "🚫",
    ".": "🌿",
    //fertile dirt
    ",": "〰",
    "r": "🍃",
    "t": "🌳",
    "H": "🏡",
    "~": "🌊",
    // dock
    "d": "📙",
    // fence
    "f": "📔",
    // grass/pasture
    "g": "🌾",
    // path
    "p": "🍪",
    // desert
    "s": "📒",
    "c": "🌵",
    "w": "☠",
  }

  function renderToArray(isEmoji, map, objects) {
    console.log("starting render to array")
    var outMap = []
    for (var row = 0; row < map.length; row++) {
      var rowList = map[row]
      var outMapRow = []
      for (var col = 0; col < rowList.length; col++) {
        var tile = rowList[col]
        outMapRow.push(isEmoji ? EMOJI_SUBS[tile] : tile);
      }
      outMap.push(outMapRow)
    }

    for (var o = 0; o < objects.length; o++) {
      var obj = objects[o]
      console.log(obj.type)
      if (obj.y >= 0 && obj.y < map.length) {
        var outMapRow = outMap[obj.y]
        if (obj.x >= 0 && obj.x < outMapRow.length) {
          outMapRow[obj.x] = isEmoji ? obj.info.emoji : obj.info.text
        }
      }
    }
    console.log("rendered to array")
    return outMap
  }

  function renderToString(outMap) {
    console.log("ready to render outmap")
    var out = ""
    for (var row = 0; row < outMap.length; row++) {
      var outMapRow = outMap[row]
      for (var c = 0; c < outMapRow.length; c++) {
        out += outMapRow[c]
      }
      out += "\n"
    }
    console.log("done")
    return out
  }

  var Animal = function () {
    this.fromJSON({})
  }

  Animal.prototype.toJSON = function () {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
    }
  }

  Animal.prototype.fromJSON = function (json) {
    this.x = json.x || 0
    this.y = json.y || 0
    this.type = json.type || "bee"
    this.info = Animal.types[this.type]
  }

  Animal.prototype.simulate = function(biome) {
    if (Math.random() < .9) {
      // 5 tries
      for (var j = 0; j < 5; j++) {
        var dx = -this.info.speed + Math.floor(Math.random() * (2 * this.info.speed + 1))
        var dy = -this.info.speed + Math.floor(Math.random() * (2 * this.info.speed + 1))
        var newX = clamp(this.x + dx, 0, WIDTH - 1)
        var newY = clamp(this.y + dy, 0, HEIGHT - 1)
        if (biome.isAllowedPos(this.info.allowedTiles, newX, newY)) {
          this.x = newX
          this.y = newY
          break
        }
      }
    }
  }

  Animal.types = {
    "frog": {
      text: "f",
      emoji: "🐸",
      speed: 3,
      allowedTiles: ["~"],
    },
    "snail": {
      text: "9",
      emoji: "🐌",
      speed: 1,
      allowedTiles: [".", "r"],
    },
    "snake": {
      text: "S",
      emoji: "🐍",
      speed: 2,
      allowedTiles: ["s", "d"],
    },
    "turtle": {
      text: "t",
      emoji: "🐢",
      speed: 1,
      allowedTiles: [".", "r", "s", "d", "~"],
    },
    "bee": {
      text: "b",
      emoji: "🐝",
      speed: 3,
      allowedTiles: [".", "r", "t"],
    },
  }

  var Biome = function(type) {
    console.log("creatng biome " + type)
    this.type = type
    this.info = Biome.types[type]
    this.map = initMap(this.info.tileSpawnTypes, this.info.template)
    this.objects = []
    this.spawnAnimals(this.info.animalSpawnTypes, this.info.numAnimals)
    console.log("made biome " + type)
  }

  Biome.prototype.toJSON = function() {
    var objectsJSON = []
    for (var j = 0; j < this.objects.length; j++) {
      objectsJSON.push(this.objects[j].toJSON())
    }
    return {
      type: this.type,
      map: this.map,
      objects: objectsJSON,
    }
  }

  Biome.prototype.fromJSON = function(json) {
    this.type = json.type || "forest"
    this.info = Biome.types[this.type]
    if (json.map) {
      this.map = json.map
    } else {
      this.map = initMap(this.info.tileSpawnTypes, this.info.template)
    }
    if (json.objects) {
      this.objects = []
      for (var j = 0; j < json.objects.length; j++) {
        var obj = new Animal()
        obj.fromJSON(json.objects[j])
        this.objects.push(obj)
      }
    }
  }

  Biome.prototype.spawnAnimals = function (types, num) {
    for (var j = 0; j < num; j++) {
      console.log("spawning " + j)
      var type = listRand(types)
      var info = Animal.types[type]
      var pos = this.findAllowedPos(info.allowedTiles)
      var animal = new Animal()
      animal.fromJSON({ x: pos[0], y: pos[1], type: type, })
      this.objects.push(animal)
    }
  }

  Biome.prototype.render = function(isEmoji) {
    return renderToArray(isEmoji, this.map, this.objects)
  }

  Biome.prototype.simulate = function() {
    for (var o = 0; o < this.objects.length; o++) {
      this.objects[o].simulate(this)
    }
  }

  Biome.prototype.findAllowedPos = function(allowedTiles) {
    var available = []
    for (var r = 0; r < this.map.length; r++) {
      var mapRow = this.map[r]
      for (var c = 0; c < mapRow.length; c++) {
        var tile = mapRow[c]
        if (allowedTiles.indexOf(tile) >= 0) {
          available.push([c, r])
        }
      }
    }
    if (available.length === 0) {
      console.log("no available positions")
      return [0, 0]
    }
    return listRand(available)
  }

  Biome.prototype.isAllowedPos = function(allowedTiles, x, y) {
    var tile = this.map[y][x]
    return (allowedTiles.indexOf(tile) >= 0);
  }

  Biome.types = {
    "home": {
      template: [
      "???????~~~~~",
      "???????ddd~~",
      "????????~~~~",
      "pp???????~~~",
      "?p??????????",
      "?pr....fffff",
      "tpt.,,,fgggg",
      "tHt....fgggg",
      "ttt.,,,fgggg",
      ],
      tileSpawnTypes: [".", ".", ".", ".", "t", "t", "r" ],
      animalSpawnTypes: ["snail", "snail", "snail", "bee", "bee", "frog"],
      numAnimals: 3,
    },
    "forest": {
      tileSpawnTypes: [".", ".", ".", "t", "t", "r" ],
      animalSpawnTypes: ["snail", "snail", "bee"],
      numAnimals: 5,
    },
    "desert": {
      tileSpawnTypes: ["s", "s", "s", "d", "d", "d", "c", "c", "w"],
      animalSpawnTypes: ["turtle", "turtle", "turtle", "snake", "bee"],
      numAnimals: 3,
    },
  }
  // pick from this list when traveling
  Biome.travelToTypes = [ "forest", "forest", "desert" ]

  var Character = function() {
    this.fromJSON({})
  }

  Character.prototype.toJSON = function() {
    return {
      x: this.x,
      y: this.y,
      emotion: this.emotion,
    }
  }

  Character.prototype.fromJSON = function(json) {
    this.x = json.x || 0
    this.y = json.y || 0
    this.emotion = json.emotion || "normal"
  }

  Character.prototype.standAt = function(x, y, emotion) {
    this.x = x
    this.y = y
    this.emotion = emotion
  }

  Character.prototype.render = function(isEmoji, outMap) {
    var icon = isEmoji ? CHARACTER_EMOJIS[this.emotion] : "C"
    var outMapRow = outMap[clamp(this.y, 0, HEIGHT)]
    outMapRow[clamp(this.x, 0, WIDTH)] = icon
  }

  var WEATHER_EMOJI_SUBS = {
    "S": "🌞",
    "s": "🌤",
    "R": "🌄",
    "r": "🌅",
    "w": "🔴",
    "W": "🔶",
    "d": "🌆",
    "b": "🔵",
    "c": "☁",
    "m": "🌜",
    "N": "🌌",
    "n": "⬛",
    "t": "⭐",
    "T": "🌟",
  }

  // times are 12am (0) - 10pm (11)
  // sunrise is 6am (3)
  // day is 8am - 6pm (4 - 9)
  // sunset is 8pm (10)
  // night is 10pm thru 4am (11, 0-2)
  function drawTopBar(isEmoji, timeOfDay) {
    var sunOptions
    var skyOptions
    var topBarItems = []
    if (timeOfDay === 3) {
      // sunrise
      sunOptions = ["R"]
      skyOptions = ["b", "b", "b", "t"]
    } else if (timeOfDay >= 4 && timeOfDay <= 9) {
      sunOptions = ["S", "S", "s"]
      skyOptions = ["b", "b", "c"]
    } else if (timeOfDay === 10) {
      sunOptions = ["r"]
      skyOptions = ["W", "W", "w", "w", "w", "d"]
    } else {
      sunOptions = ["m"]
      skyOptions = ["n", "n", "n", "t", "T", "N"]
    }

    for (var j = 0; j < WIDTH; j++) {
      var isSun = (j === timeOfDay)
      topBarItems.push(listRand(isSun ? sunOptions : skyOptions))
    }

    var out = ""
    for (var j = 0; j < topBarItems.length; j++) {
      var item = topBarItems[j]
      out += isEmoji ? WEATHER_EMOJI_SUBS[item] : item
    }
    return out
  }

  var Simulation = function() {
    console.log("making sim")
    this.fromJSON({})
    console.log("new sim made")
  }

  Simulation.prototype.toJSON = function() {
    console.log("writing sim to json")
    return {
      tick: this.tick,
      timeOfDay: this.timeOfDay,
      home: this.home.toJSON(),
      travelingToBiome: (this.travelingToBiome ? this.travelingToBiome.toJSON() : null),
      character: this.character.toJSON(),
      message: this.message,
    }
  }

  Simulation.prototype.fromJSON = function(json) {
    console.log("reading sim from json")
    this.tick = json.tick || 0
    this.timeOfDay = json.timeOfDay || 0
    if (json.home) {
      this.home = new Biome("home")
      this.home.fromJSON(json.home)
    } else {
      this.home = new Biome("home")
    }
    if (json.travelingToBiome) {
      this.travelingToBiome = new Biome("forest") // temporary
      this.travelingToBiome.fromJSON(json.travelingToBiome)
    } else {
      this.travelingToBiome = null
    }
    if (json.character) {
      this.character = new Character()
      this.character.fromJSON(json.character)
    } else {
      this.character = new Character()
    }
    this.message = json.message || ""
  }

  Simulation.prototype.kiiLogin = function(kiiObj, kiiSiteObj, kiiUserObj, kiiServerCreds, onLoginSuccessful) {
    console.log("trying to login to " + kiiServerCreds.username)
    kiiObj.initializeWithSite("l31z3ww8lfm7", "780253b2617d4c6eb9e21633e129da1f", kiiSiteObj.US)
    kiiUserObj.authenticate(kiiServerCreds.username, kiiServerCreds.password).then(function (user) {
      console.log("Kii Admin User authenticated.")
      onLoginSuccessful()
    }).catch(function (error) {
      var errorString = error.message;
      console.log("FAILED Kii Admin authentication: " + errorString);
    });
  }

  Simulation.prototype.kiiSave = function(kiiObj) {
    var bucket = kiiObj.bucketWithName("History");
    var obj = bucket.createObject();
    var json = this.toJSON()
    for (var key in json) {
      if (json.hasOwnProperty(key)) {
        obj.set(key, json[key]);
      }
    }

    obj.save().then(function (obj) {
      console.log("Saved to kii successfully")
    }).catch(function (error) {
      var errorString = "" + error.code + ": " + error.message
      console.log("unable to save game: " + errorString);
    });
  }

  Simulation.prototype.kiiLoad = function(kiiObj, kiiQueryObj, onLoadSuccessful) {
    var queryObject = kiiQueryObj.queryWithClause(null);
    queryObject.sortByDesc("_created");
    var bucket = kiiObj.bucketWithName("History");
    var thisSim = this
    bucket.executeQuery(queryObject).then(function (params) {
      var queryPerformed = params[0];
      var result = params[1];
      var nextQuery = params[2]; // if there are more results
      if (result.length > 0) {
        console.log("load query successful")
        var loadedJSON = result[0]._customInfo
        console.log(loadedJSON)
        thisSim.fromJSON(loadedJSON)
        onLoadSuccessful()
      } else {
        console.log("Load failed, no previous states found")
      }
    }).catch(function (error) {
      var errorString = "" + error.code + ":" + error.message;
      console.log("Load query failed, unable to execute query: " + errorString);
    });
  }

  Simulation.prototype.render = function(isEmoji) {
    var outMap;
    outMap = this.getCurrentBiome().render(isEmoji)

    this.character.render(isEmoji, outMap)

    var out = drawTopBar(isEmoji, this.timeOfDay) + "\n"
    out += renderToString(outMap)
    if (this.message.length > 0) {
      out += "\n" + this.message
    }
    return out
  }

  Simulation.prototype.simulate = function() {
    this.tick++
    this.timeOfDay = this.tick % 12
    console.log("time "+ this.timeOfDay)
    if (this.travelingToBiome) {
      if (this.timeOfDay === 10) {
        console.log("coming home")
        this.travelingToBiome = null
      }
    } else {
      if (this.timeOfDay === 4 && Math.random() < .5) {
        console.log("traveling")
        this.travelingToBiome = new Biome(listRand(Biome.travelToTypes))
      }
    }

    this.getCurrentBiome().simulate()
    console.log("simulated")

    this.simulateCharacter()
  }

  Simulation.prototype.getCurrentBiome = function() {
    if (this.travelingToBiome) {
      return this.travelingToBiome
    }
    return this.home
  }

  var CHARACTER_EMOJIS = {
    "normal": "🐱",
    "happy": "😺",
    "laughing": "😹",
    "love": "😻",
    "scared": "🙀",
    "angry": "😾",
  }

  var CHARACTER_ACTIONS = [
    {
      biome: "home",
      pos: [9, 1],
      message: "Looking into the pond",
    }, {
      biome: "forest",
      animal: "snail",
      emotion: "laughing",
      message: "Aww, a snail!",
    }
  ]

  Simulation.prototype.simulateCharacter = function() {
    this.message = ""
    this.character.emotion = "normal"
    // list possible actions
    var possibleActions = []
    for (var j = 0; j < CHARACTER_ACTIONS.length; j++) {
      // TODO
      var action = CHARACTER_ACTIONS[j]
      var possible = true
      if (action.hasOwnProperty("biome") && action.biome !== this.getCurrentBiome().type) {
        possible = false
      }
      if (action.hasOwnProperty("animal")) {
        // look for the animal
        var found = false
        var objects = this.getCurrentBiome().objects
        for (var k = 0; k < objects.length; k++) {
          var obj = objects[k]
          if (obj.type === action.animal) {
            found = true
            break
          }
        }
        if (!found) {
          possible = false
        }
      }
      // todo more conditions

      if (possible) {
        possibleActions.push(action)
      }
    }

    if (possibleActions.length === 0) {
      console.log("no possible actions")
      return
    }
    var action = listRand(possibleActions)
    var newX = this.character.x
    var newY = this.character.y
    var newEmotion = listRand(["normal", "happy"])
    var newMessage = ""
    // move the character
    if (action.hasOwnProperty("animal")) {
      // TODO PICK A RANDOM ONE AND STAND NEXT TO IT
      var objects = this.getCurrentBiome().objects
      var animals = []
      for (var k = 0; k < objects.length; k++) {
        var obj = objects[k]
        if (obj.type === action.animal) {
          animals.push(obj)
        }
      }
      if (animals.length === 0) {
        console.log("No animals available??? " + action.animal)
      }
      var animal = listRand(animals)
      if (animal.x >= 1) {
        newX = animal.x - 1
      } else {
        newX = animal.x + 1
      }
      newY = animal.y
    } else if (action.hasOwnProperty("pos")) {
      newX = action.pos[0]
      newY = action.pos[1]
    }

    if (action.hasOwnProperty("emotion")) {
      newEmotion = action.emotion
    }
    if (action.hasOwnProperty("message")) {
      newMessage = action.message
    }

    //apply
    this.character.standAt(newX, newY, newEmotion)
    this.message = newMessage
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Simulation
  } else {
    window.Simulation = Simulation
  }
})();
