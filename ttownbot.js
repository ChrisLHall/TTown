;(function () {
  function listRand(list) { return list[Math.floor(Math.random() * list.length)] }
  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
  function generateIDNum() {
    return Math.floor(10000000 * (1 + Math.random()))
  }
  function filterList(list, filterFunc) {
    var result = []
    for (var j = 0; j < list.length; j++) {
      if (filterFunc(list[j])) {
        result.push(list[j])
      }
    }
    return result
  }
  // rarity 1 is common, rarity 5 is rare...keep it between those I guess?
  function rarityRand(srcCollection, keyList) {
    if (typeof keyList === "undefined") {
      keyList = []
      for (var key in srcCollection) {
        if (!srcCollection.hasOwnProperty(key)) {
          continue
        }
        keyList.push(key)
      }
    }
    var totalChanceList = []
    var workingTotalChance = 0
    for (var j = 0; j < keyList.length; j++) {
      var key = keyList[j]
      workingTotalChance += 1 / srcCollection[key].rarity
      totalChanceList.push(workingTotalChance)
    }
    var rand = Math.random() * workingTotalChance
    var chosenKey = keyList[0]
    for (var j = 0; j < keyList.length; j++) {
      chosenKey = keyList[j]
      if (rand < totalChanceList[j]) {
        break
      }
    }
    return chosenKey
  }

  var WIDTH = 12
  var HEIGHT = 8

  function initMap(tileTypes, template) {
    console.log(template ? "map template" : "no map template")
    var map = []
    for (var row = 0; row < HEIGHT; row++) {
      var rowList = []
      var tempStr = template ? template[row] : null;
      for (var col = 0; col < WIDTH; col++) {
        var tile = template ? tempStr[col] : "?";
        if (tile === "?") {
          tile = rarityRand(tileTypes)
        }
        rowList.push(tile)
      }
      map.push(rowList)
    }
    return map
  }

  function renderToArray(isEmoji, map) {
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

  function getClassForType(type) {
    if (Animal.isAnimal(type)) {
      return Animal
    } else if (Plant.isPlant(type)) {
      return Plant
    } else if (Item.isItem(type)) {
      return Item
    }
    return null
  }

  var Animal = function () {
    this.fromJSON({})
  }

  Animal.prototype.toJSON = function () {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      age: this.age,
      type: this.type,
      permanent: this.permanent,
    }
  }

  Animal.prototype.fromJSON = function (json) {
    this.id = json.id || generateIDNum()
    this.x = json.x || 0
    this.y = json.y || 0
    this.age = json.age || 0
    this.type = json.type || "bee"
    this.permanent = json.permanent || false
    this.info = Animal.types[this.type]
  }

  Animal.prototype.render = function (isEmoji, outMap) {
    var icon = isEmoji ? this.info.emoji : this.info.text
    var outMapRow = outMap[clamp(this.y, 0, outMap.length)]
    outMapRow[clamp(this.x, 0, outMapRow.length)] = icon
  }

  Animal.prototype.simulate = function(biome) {
    this.age++
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

  Animal.isAnimal = function (type) {
    return Animal.types.hasOwnProperty(type)
  }

  var Plant = function () {
    this.fromJSON({})
  }

  Plant.prototype.toJSON = function () {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      age: this.age,
      type: this.type,
      permanent: this.permanent,
    }
  }

  Plant.prototype.fromJSON = function (json) {
    this.id = json.id || generateIDNum()
    this.x = json.x || 0
    this.y = json.y || 0
    this.age = json.age || 0
    this.type = json.type || "clover"
    this.permanent = json.permanent || false
    this.info = Plant.types[this.type]
  }

  Plant.prototype.render = function (isEmoji, outMap) {
    var icon = isEmoji ? this.info.emoji : this.info.text
    if (this.age < this.info.growAge) {
      icon = isEmoji ? this.info.sproutEmoji : this.info.sproutText
    }
    var outMapRow = outMap[clamp(this.y, 0, outMap.length)]
    outMapRow[clamp(this.x, 0, outMapRow.length)] = icon
  }

  Plant.prototype.simulate = function(biome) {
    this.age++
  }

  Plant.isPlant = function (type) {
    return Plant.types.hasOwnProperty(type)
  }

  var Item = function () {
    this.fromJSON({})
  }

  Item.prototype.toJSON = function () {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      age: this.age,
      type: this.type,
      permanent: this.permanent,
    }
  }

  Item.prototype.fromJSON = function (json) {
    this.id = json.id || generateIDNum()
    this.x = json.x || 0
    this.y = json.y || 0
    this.age = json.age || 0
    this.type = json.type || "clover"
    this.permanent = json.permanent || false
    this.info = Plant.types[this.type]
  }

  Item.prototype.render = function (isEmoji, outMap) {
    var icon = isEmoji ? this.info.emoji : this.info.text
    var outMapRow = outMap[clamp(this.y, 0, outMap.length)]
    outMapRow[clamp(this.x, 0, outMapRow.length)] = icon
  }

  Item.prototype.simulate = function(biome) {
    this.age++
  }

  Item.isItem = function (type) {
    return Item.types.hasOwnProperty(type)
  }

  var Biome = function(type) {
    console.log("creatng biome " + type)
    this.type = type
    this.info = Biome.types[type]
    this.map = initMap(this.info.tileSpawnTypes, this.info.template)
    this.objects = []
    this.spawnObjects(this.info.animalSpawnTypes, this.info.numAnimals)
    this.spawnObjects(this.info.plantSpawnTypes, this.info.numPlants)
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
        var jObj = json.objects[j]
        var ObjClass = getClassForType(jObj.type)
        if (!ObjClass) {
          continue
        }
        var obj = new ObjClass()
        obj.fromJSON(jObj)
        this.objects.push(obj)
      }
    }
  }

  Biome.prototype.spawnObjects = function (types, num, permanent) {
    permanent = permanent || false
    for (var j = 0; j < num; j++) {
      console.log("spawning " + j)
      var type = rarityRand(types)
      var ObjClass = getClassForType(type)
      var info = ObjClass.types[type]
      var pos = this.findAllowedPos(info.allowedTiles)
      var obj = new ObjClass()
      obj.fromJSON({ x: pos.x, y: pos.y, type: type, permanent: permanent })
      this.objects.push(obj)
    }
  }

  Biome.prototype.render = function(isEmoji) {
    var outMap = renderToArray(isEmoji, this.map)
    for (var j = 0; j < this.objects.length; j++) {
      this.objects[j].render(isEmoji, outMap)
    }
    return outMap
  }

  Biome.prototype.simulate = function() {
    // simulate animals spawning and leaving
    if (Math.random() < Biome.ANIMAL_SPAWN_CHANCE) {
      var animals = this.listAnimals(false)
      if (animals.length >= this.info.numAnimals) {
        var remove = listRand(animals)
        var removeIdx = this.objects.indexOf(remove)
        if (removeIdx > -1 && remove.age >= Animal.LEAVE_MIN_AGE) {
          this.objects.splice(removeIdx, 1)
        }
      } else if (animals.length < this.info.numAnimals) {
        // spawn
        this.spawnObjects(this.info.animalSpawnTypes, 1)
      }
    }
    if (Math.random() < Biome.PLANT_SPAWN_CHANCE) {
      var plants = this.listPlants(false)
      if (plants.length >= this.info.numPlants) {
        var remove = listRand(plants)
        var removeIdx = this.objects.indexOf(remove)
        if (removeIdx > -1 && remove.age >= Plant.DISAPPEAR_MIN_AGE) {
          this.objects.splice(removeIdx, 1)
        }
      } else if (plants.length < this.info.numPlants) {
        // spawn
        this.spawnObjects(this.info.plantSpawnTypes, 1)
      }
    }

    for (var o = 0; o < this.objects.length; o++) {
      this.objects[o].simulate(this)
    }
  }

  // TODO TEST FOR SUREEEEE
  Biome.prototype.remove = function (type, numToRemove, includePermanent) {
    var matching = filterList(this.objects, function (item) { return (!item.permanent || includePermanent) && item.type === type})
    for (var j = 0; matching.length > 0 && j < numToRemove; j++) {
      var remove = listRand(matching)
      var removeMatchingIdx = matching.indexOf(remove)
      if (removeMatchingIdx > -1) {
        matching.splice(removeMatchingIdx, 1)
      }
      var removeObjectsIdx = this.objects.indexOf(remove)
      if (removeObjectsIdx > -1) {
        this.objects.splice(removeObjectsIdx, 1)
      }
    }
  }

  Biome.prototype.listAnimals = function (includePermanent) {
    return filterList(this.objects, function (item) { return (!item.permanent || includePermanent) && Animal.isAnimal(item.type)})
  }

  Biome.prototype.listPlants = function (includePermanent) {
    return filterList(this.objects, function (item) { return (!item.permanent || includePermanent) && Plant.isPlant(item.type)})
  }

  Biome.prototype.listItems = function (includePermanent) {
    return filterList(this.objects, function (item) { return (!item.permanent || includePermanent) && Item.isItem(item.type)})
  }

  Biome.prototype.findAllowedPos = function(allowedTiles) {
    var available = []
    for (var r = 0; r < this.map.length; r++) {
      var mapRow = this.map[r]
      for (var c = 0; c < mapRow.length; c++) {
        var tile = mapRow[c]
        if (allowedTiles.indexOf(tile) >= 0 && this.isEmpty(c, r)) {
          available.push({x: c, y: r})
        }
      }
    }
    if (available.length === 0) {
      console.log("no available positions")
      return {x: 0, y: 0}
    }
    return listRand(available)
  }

  Biome.prototype.isAllowedPos = function(allowedTiles, x, y) {
    var tile = this.map[y][x]
    return (allowedTiles.indexOf(tile) >= 0);
  }

  Biome.prototype.isEmpty = function(x, y) {
    for (var j = 0; j < this.objects.length; j++) {
      var obj = this.objects[j]
      if (obj.x === x && obj.y === y) {
        return false
      }
    }
    return true
  }

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
    if (this.emotion !== "none") {
      var icon = isEmoji ? CHARACTER_EMOJIS[this.emotion] : "C"
      var outMapRow = outMap[clamp(this.y, 0, outMap.length)]
      outMapRow[clamp(this.x, 0, outMapRow.length)] = icon
    }
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
  function drawTopBar(isEmoji, timeOfDay, randomEventSkyFrame) {
    var sunOptions
    var skyOptions
    var topBarItems = []
    if (timeOfDay === 3) {
      // sunrise
      sunOptions = {"R": {rarity: 1}}
      skyOptions = {"b": {rarity: 1}, "t": {rarity: 3}}
    } else if (timeOfDay >= 4 && timeOfDay <= 9) {
      sunOptions = {"S": {rarity: 1}, "s": {rarity: 2}}
      skyOptions = {"b": {rarity: 1}, "c": {rarity: 2}}
    } else if (timeOfDay === 10) {
      sunOptions = {"r": {rarity: 1}}
      skyOptions = {"W": {rarity: 2}, "w": {rarity: 1}, "d": {rarity: 3}}
    } else {
      sunOptions = {"m": {rarity: 1}}
      skyOptions = {"n": {rarity: 1}, "t": {rarity: 3}, "T": {rarity: 3}, "N": {rarity: 3}}
    }

    for (var j = 0; j < WIDTH; j++) {
      var isSun = (j === timeOfDay)
      var item = rarityRand(isSun ? sunOptions : skyOptions)
      item = isEmoji ? WEATHER_EMOJI_SUBS[item] : item
      if (randomEventSkyFrame) {
        for (var drawIdx = 0; drawIdx < randomEventSkyFrame.length; drawIdx++) {
          var draw = randomEventSkyFrame[drawIdx]
          if (j === draw.pos) {
            item = isEmoji ? draw.emoji : draw.text
          }
        }
      }
      topBarItems.push(item)
    }

    var out = ""
    for (var j = 0; j < topBarItems.length; j++) {
      var item = topBarItems[j]
      out += item
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
      randomEvent: this.randomEvent,
      message: this.message,
      askedQuestion: this.askedQuestion,
      pendingAction: this.pendingAction,
      lastTweetID: this.lastTweetID,
      lastTweetStr: this.lastTweetStr,
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
    this.randomEvent = json.randomEvent || null
    this.message = json.message || ""
    this.askedQuestion = json.askedQuestion || null
    this.pendingAction = json.pendingAction || null
    this.lastTweetID = json.lastTweetID || null
    this.lastTweetStr = json.lastTweetStr || null

    // stuff not included in the json
    this.receivedAnswer = null
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
    var randEventInfo = this.randomEvent ? RANDOM_EVENTS[this.randomEvent.type] : null
    outMap = this.getCurrentBiome().render(isEmoji)
    if (randEventInfo && randEventInfo.frames) {
      var frame = randEventInfo.frames[this.randomEvent.time]
      for (var drawIdx = 0; drawIdx < frame.length; drawIdx++) {
        var draw = frame[drawIdx]
        outMap[draw.pos.y][draw.pos.x] = isEmoji ? draw.emoji : draw.text
      }
    }
    this.character.render(isEmoji, outMap)

    var skyFrame = (randEventInfo && randEventInfo.skyFrames) ? randEventInfo.skyFrames[this.randomEvent.time] : null
    var out = drawTopBar(isEmoji, this.timeOfDay, skyFrame) + "\n"
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

    this.maybeProcessActions()
    if (this.travelingToBiome) {
      if (this.timeOfDay === 10) {
        console.log("coming home")
        this.travelingToBiome = null
        this.randomEvent = null
      }
    }
    this.simulateRandomEvents()

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

  Simulation.prototype.maybeProcessActions = function() {
    if (this.receivedAnswer) {
      var action = this.receivedAnswer.action
      var target = this.receivedAnswer.target

      this.doAction(action, target)
    } else if (this.pendingAction) {
      var action = this.pendingAction.action
      var target = this.pendingAction.target

      this.doAction(action, target)
    }

    this.receivedAnswer = null
    this.pendingAction = null
  }

  Simulation.prototype.doAction = function (action, target) {
    var targetRarity = {}
    targetRarity[target] = {rarity: 1}
    if (action === "gotoBiome") {
      if (target && !this.travelingToBiome) {
        this.travelingToBiome = new Biome(target)
        // stop random event
        this.randomEvent = null
      } else if (!target && this.travelingToBiome) {
        this.travelingToBiome = null
        this.randomEvent = null
      }
    } else if (action === "spawn") {
      var biome = this.getCurrentBiome().spawnObjects(targetRarity, 1, true)
    } else if (action === "moveToHome") {
      this.getCurrentBiome().remove(target, 1, false)
      this.home.spawnObjects(targetRarity, 1, false)
    } else if (action === "remove") {
      this.getCurrentBiome().remove(target, 1, true)
    }
    // todo more actions
  }

  Simulation.prototype.checkCanHappen = function (event) {
    if (event.hasOwnProperty("biome") && event.biome !== this.getCurrentBiome().type) {
      return false
    }
    if (event.hasOwnProperty("timeOfDay") && event.timeOfDay.indexOf(this.timeOfDay) < 0) {
      return false
    }
    if (event.hasOwnProperty("randomEvent")
        && (!this.randomEvent || event.randomEvent !== this.randomEvent.type)) {
      return false
    }
    if (event.hasOwnProperty("randomEventTime")
        && (!this.randomEvent || event.randomEventTime.indexOf(this.randomEvent.time) < 0)) {
      return false
    }
    if (event.hasOwnProperty("objectType")) {
      // look for the animal
      var found = false
      var minAge = 0
      if (event.hasOwnProperty("minAge")) {
        minAge = event.minAge
      }
      var objects = this.getCurrentBiome().objects
      for (var k = 0; k < objects.length; k++) {
        var obj = objects[k]
        if (obj.type === event.objectType && obj.age >= minAge) {
          found = true
          break
        }
      }
      if (!found) {
        return false
      }
    }
    if (event.hasOwnProperty("onTile")) {
      var found = false
      var map = this.getCurrentBiome().map
      for (var row = 0; row < map.length; row++) {
        var mapRow = map[row]
        for (var col = 0; col < mapRow.length; col++) {
          var tile = mapRow[col]
          if (event.onTile.indexOf(tile) > -1) {
            found = true
            break
          }
        }
      }
      if (!found) {
        return false
      }
    }
    if (event.hasOwnProperty("emptyTile")) {
      var found = false
      var map = this.getCurrentBiome().map
      for (var row = 0; row < map.length; row++) {
        var mapRow = map[row]
        for (var col = 0; col < mapRow.length; col++) {
          var tile = mapRow[col]
          if (this.getCurrentBiome().isEmpty(col, row) && event.emptyTile.indexOf(tile) > -1) {
            found = true
            break
          }
        }
      }
      if (!found) {
        return false
      }
    }
    return true
  }

  Simulation.prototype.findPosFor = function (event) {
    if (event.hasOwnProperty("pos")) {
      return listRand(event.pos)
    } else if (event.hasOwnProperty("objectType")) {
      var minAge = 0
      if (event.hasOwnProperty("minAge")) {
        minAge = event.minAge
      }
      var objects = this.getCurrentBiome().objects
      var matching = []
      for (var k = 0; k < objects.length; k++) {
        var obj = objects[k]
        if (obj.type === event.objectType && obj.age >= minAge) {
          matching.push(obj)
        }
      }
      if (matching.length === 0) {
        console.log("No matches available??? " + event.objectType)
        return {x: 0, y: 0}
      }
      var obj = listRand(matching)
      var options = []
      if (obj.x >= 1) {
        options.push({x: obj.x - 1, y: obj.y})
      }
      if (obj.x <= WIDTH - 2) {
        options.push({x: obj.x + 1, y: obj.y})
      }
      if (obj.y >= 1) {
        options.push({x: obj.x, y: obj.y - 1})
      }
      if (obj.y <= HEIGHT - 2) {
        options.push({x: obj.x, y: obj.y + 1})
      }
      var chosen = listRand(options)
      return {x: chosen.x, y: chosen.y}
    } else if (event.hasOwnProperty("onTile")) {
      var tiles = []
      var map = this.getCurrentBiome().map
      for (var row = 0; row < map.length; row++) {
        var mapRow = map[row]
        for (var col = 0; col < mapRow.length; col++) {
          var tile = mapRow[col]
          if (event.onTile.indexOf(tile) > -1) {
            tiles.push({x: col, y: row})
          }
        }
      }

      if (tiles.length === 0) {
        console.log("No tiles available??? " + event.onTile)
        return {x: 0, y: 0}
      }
      return listRand(tiles)
    } else if (event.hasOwnProperty("emptyTile")) {
      var tiles = []
      var map = this.getCurrentBiome().map
      for (var row = 0; row < map.length; row++) {
        var mapRow = map[row]
        for (var col = 0; col < mapRow.length; col++) {
          var tile = mapRow[col]
          if (this.getCurrentBiome().isEmpty(col, row) && event.emptyTile.indexOf(tile) > -1) {
            tiles.push({x: col, y: row})
          }
        }
      }

      if (tiles.length === 0) {
        console.log("No empty tiles available??? " + event.emptyTile)
        return {x: 0, y: 0}
      }
      return listRand(tiles)
    }
    return null
  }

  Simulation.prototype.simulateCharacter = function() {
    this.message = ""
    this.character.emotion = "normal"
    this.askedQuestion = null
    // list possible actions
    var possibleActions = []
    for (var name in CHARACTER_ACTIONS) {
      if (!CHARACTER_ACTIONS.hasOwnProperty(name)) {
        continue
      }
      var charAction = CHARACTER_ACTIONS[name]
      var possible = this.checkCanHappen(charAction)

      if (possible) {
        possibleActions.push(name)
      }
    }

    if (possibleActions.length === 0) {
      console.log("no possible actions")
      return
    }
    var charAction = CHARACTER_ACTIONS[rarityRand(CHARACTER_ACTIONS, possibleActions)]
    var newX = this.character.x
    var newY = this.character.y
    var newEmotion = listRand(["normal", "happy"])
    var newMessage = ""
    var newQuestion = null
    var pos = this.findPosFor(charAction)
    if (pos) {
      newX = pos.x
      newY = pos.y
    }

    if (charAction.hasOwnProperty("emotion")) {
      newEmotion = listRand(charAction.emotion)
    }
    if (charAction.hasOwnProperty("message")) {
      newMessage = listRand(charAction.message)
    }
    if (charAction.hasOwnProperty("question")) {
      newQuestion = charAction.question
    }
    if (charAction.hasOwnProperty("action")) {
      this.pendingAction = {"action": charAction.action, "target": rarityRand(charAction.target)}
    }

    //apply
    this.character.standAt(newX, newY, newEmotion)
    this.message = newMessage
    this.askedQuestion = newQuestion
  }

  Simulation.prototype.setLastTweet = function (tweetID, tweetStr) {
    this.lastTweetID = tweetID
    this.lastTweetStr = tweetStr
  }

  Simulation.prototype.simulateRandomEvents = function () {
    if (this.randomEvent) {
      var info = RANDOM_EVENTS[this.randomEvent.type]
      this.randomEvent.time++
      var numFrames = 0
      if (info.frames) {
        numFrames = info.frames.length
      } else if (info.skyFrames) {
        numFrames = info.skyFrames.length
      } else if (info.duration) {
        numFrames = info.duration
      }
      if (this.randomEvent.time >= numFrames) {
        this.randomEvent = null
      }
    } else {
      // list possible actions
      var chosenEvents = []
      for (var eventName in RANDOM_EVENTS) {
        if (!RANDOM_EVENTS.hasOwnProperty(eventName)) {
          continue
        }
        var action = RANDOM_EVENTS[eventName]
        var possible = this.checkCanHappen(action)

        if (possible) {
          chosenEvents.push(eventName)
        }
      }
      if (chosenEvents.length > 0) {
        this.randomEvent = { type: rarityRand(RANDOM_EVENTS, chosenEvents), time: 0 }
      }
    }
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
    "P": "🌴",
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
    "bear": {
      text: "B",
      emoji: "🐻",
      speed: 2,
      allowedTiles: [".", "r"],
    },
    "squirrel": {
      text: "q",
      emoji: "🐿",
      speed: 3,
      allowedTiles: [".", "r", "t"],
    },
    "camel": {
      text: "C",
      emoji: "🐫",
      speed: 1,
      allowedTiles: ["s", "d"],
    },
    "scorpion": {
      text: "s",
      emoji: "🦂",
      speed: 2,
      allowedTiles: ["s", "d"],
    },
    "fish": {
      text: "f",
      emoji: "🐟",
      speed: 3,
      allowedTiles: ["~"],
    },
  }

  Animal.LEAVE_MIN_AGE = 3

  Plant.types = {
    "flower": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "F",
      emoji: "🌼",
      growAge: 3,
      allowedTiles: [".", "r", ","],
    },
    "clover": {
      sproutText: "3",
      sproutEmoji: "☘",
      text: "3",
      emoji: "☘",
      growAge: 0,
      allowedTiles: [".", "r"],
    },
    "four leaf clover": {
      sproutText: "4",
      sproutEmoji: "🍀",
      text: "4",
      emoji: "🍀",
      growAge: 0,
      allowedTiles: [".", "r"],
    },
    "white flower": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "w",
      emoji: "💮",
      growAge: 3,
      allowedTiles: ["s"],
    },
    "mushroom": {
      sproutText: "m",
      sproutEmoji: "🍄",
      text: "m",
      emoji: "🍄",
      growAge: 0,
      allowedTiles: [".", "r"],
    },
    "eggplant": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "E",
      emoji: "🍆",
      growAge: 12,
      allowedTiles: [","],
    },
    "chili": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "C",
      emoji: "🌶",
      growAge: 12,
      allowedTiles: [","],
    },
    "corn": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "O",
      emoji: "🌽",
      growAge: 12,
      allowedTiles: [","],
    },
    "carrot": {
      sproutText: "v",
      sproutEmoji: "🌱",
      text: "V",
      emoji: "🥕",
      growAge: 12,
      allowedTiles: [","],
    },
  }

  Plant.DISAPPEAR_MIN_AGE = 10

  Item.types = {
    "nut": {
      text: "n",
      emoji: "🌰",
    },
  }

  Biome.types = {
    "home": {
      template: [
      "???????~~~~~",
      "???????ddd~~",
      "pp??????~~~~",
      "?p???????~~~",
      "?p??????????",
      "tpt.,,,,gggg",
      "tHt.....gggg",
      "ttt.,,,,gggg",
      ],
      tileSpawnTypes: {".": {rarity: 1}, "t": {rarity: 2}, "r": {rarity: 4} },
      animalSpawnTypes: {"snail": {rarity: 1}, "bee": {rarity: 2}, "squirrel": {rarity: 3}, "frog": {rarity: 3}, "fish": {rarity: 5}},
      numAnimals: 4,
      plantSpawnTypes: {"flower": {rarity: 2}, "clover": {rarity: 1}},
      numPlants: 5,
    },
    "forest": {
      tileSpawnTypes: {".": {rarity: 1}, "t": {rarity: 2}, "r": {rarity: 4} },
      animalSpawnTypes: {"snail": {rarity: 1}, "bee": {rarity: 2}, "squirrel": {rarity: 1}, "bear": {rarity: 3}},
      numAnimals: 5,
      plantSpawnTypes: {"flower": {rarity: 2}, "clover": {rarity: 1}, "mushroom": {rarity: 2}, "four leaf clover": {rarity: 10}},
      numPlants: 5,
    },
    "desert": {
      tileSpawnTypes: {"s": {rarity: 1}, "d": {rarity: 2}, "c": {rarity: 3}, "w": {rarity: 5}, "P": {rarity: 5}},
      animalSpawnTypes: {"turtle": {rarity: 1}, "snake": {rarity: 3}, "camel": {rarity: 4}, "scorpion": {rarity: 5}},
      numAnimals: 4,
      plantSpawnTypes: {"white flower": {rarity: 1}},
      numPlants: 1,
    },
  }

  Biome.ANIMAL_SPAWN_CHANCE = .2
  Biome.PLANT_SPAWN_CHANCE = .2

  var CHARACTER_EMOJIS = {
    "normal": "🐱",
    "happy": "😺",
    "laughing": "😹",
    "love": "😻",
    "scared": "🙀",
    "angry": "😾",
    "none": "",
  }

  var CHARACTER_ACTIONS = {
    "looking into pond": {
      biome: "home",
      rarity: 3,
      pos: [{x: 9, y: 1}],
      message: ["Looking into the pond", "", ""],
    },
    "looking around the pasture": {
      biome: "home",
      rarity: 3,
      onTile: ["g"],
      emotion: ["normal", "angry", "happy"],
      message: ["Farm animals...they'll come someday!", "", ""],
    },
    "looking around home": {
      biome: "home",
      rarity: 1,
      onTile: [".", "r"],
      emotion: ["normal", "normal", "happy", "happy", "laughing", "angry"],
    },
    "where to go": {
      biome: "home",
      rarity: 1,
      timeOfDay: [4, 5],
      pos: [{x: 1, y: 6}],
      emotion: ["normal"],
      message: ["Where should we go today?"],
      question: {
        action: "gotoBiome",
        options: [
          { text: "the forest", keyword: "forest", target: "forest" },
          { text: "the desert", keyword: "desert", target: "desert" },
          { text: "stay home", keyword: "home", target: null },
        ],
      },
    },
    "random excursion": {
      biome: "home",
      rarity: 1,
      timeOfDay: [3],
      onTile: [".", "r"],
      emotion: ["happy"],
      message: ["Let's go somewhere..."],
      action: "gotoBiome",
      target: {"forest": {rarity: 1}, "desert": {rarity: 2}},
    },
    // TODO FINISH AND IMPLEMENT
    "random crop": {
      biome: "home",
      rarity: 2,
      emptyTile: [","],
      emotion: ["normal"],
      message: ["I want to plant something!"],
      action: "spawn",
      // TODO moveToHome - make it remove shit
      // TODO "remove" action IS DONE BUT NEEDS TESTING / AN ACTION
      target: {"corn": {rarity: 1}, "carrot": {rarity: 2}, "eggplant": {rarity: 2}, "chili": {rarity: 3}},
    },
    "eat eggplant": {
      biome: "home",
      rarity: 3,
      objectType: "eggplant",
      minAge: 15,
      emotion: ["happy", "laughing"],
      message: ["Mmm, eggplant!"],
      action: "remove",
      target: {"eggplant": {rarity: 1},},
    },
    "eat carrot": {
      biome: "home",
      rarity: 3,
      objectType: "carrot",
      minAge: 15,
      emotion: ["happy"],
      message: ["Love these lil orange pyramids"],
      action: "remove",
      target: {"carrot": {rarity: 1},},
    },
    "eat corn": {
      biome: "home",
      rarity: 3,
      objectType: "corn",
      minAge: 15,
      emotion: ["normal", "laughing"],
      message: ["I'm going to eat this corn...RIGHT HERE!"],
      action: "remove",
      target: {"corn": {rarity: 1},},
    },
    "eat chili": {
      biome: "home",
      rarity: 4,
      objectType: "chili",
      minAge: 15,
      emotion: ["scared"],
      message: ["Nomming on this chili pepper..."],
      action: "remove",
      target: {"chili": {rarity: 1},},
    },
    "collect mushroom": {
      biome: "home",
      rarity: 4,
      objectType: "mushroom",
      minAge: 10,
      emotion: ["laughing"],
      message: ["I love picking mushrooms"],
      action: "remove",
      target: {"mushroom": {rarity: 1},},
    },
    "asleep": {
      biome: "home",
      rarity: 1,
      timeOfDay: [11, 0, 1, 2],
      emotion: ["none"],
      message: ["Zzz...", ""],
    },
    "cart": {
      biome: "home",
      rarity: 2,
      randomEvent: "shopping cart",
      pos: [{x: 1, y: 3}],
      emotion: ["scared", "normal"],
      message: ["What's this?", "A...shopping cart...?"],
    },
    "cart mushroom": {
      biome: "home",
      rarity: 2,
      randomEvent: "shopping cart",
      pos: [{x: 1, y: 3}],
      emotion: ["happy", "laughing"],
      message: ["There's a mushroom in here!"],
      action: "spawn",
      target: {"mushroom": {rarity: 1},},
    },

    "looking around forest": {
      biome: "forest",
      rarity: 1,
      onTile: [".", "r"],
      emotion: ["normal", "normal", "happy", "happy", "laughing", "angry"],
    },
    "aww a snail": {
      biome: "forest",
      rarity: 3,
      objectType: "snail",
      emotion: ["laughing"],
      message: ["Aww, a snail!"],
    },
    "mushroom": {
      biome: "forest",
      rarity: 3,
      objectType: "mushroom",
      emotion: ["laughing", "happy"],
      message: [""],
    },
    "take a bear home": {
      biome: "forest",
      rarity: 3,
      objectType: "bear",
      emotion: ["laughing", "happy"],
      message: ["See you at home, bear!"],
      action: "moveToHome",
      target: {"bear": {rarity: 1}},
    },


    "looking around desert": {
      biome: "desert",
      rarity: 1,
      onTile: ["s", "d"],
      emotion: ["normal", "normal", "happy", "scared", "scared", "angry"],
    },
    "scorpion": {
      biome: "desert",
      rarity: 5,
      objectType: "scorpion",
      emotion: ["normal", "scared"],
      message: ["Gross!", "Looks dangerous...", "Bug!"],
    },
    "desert flower": {
      biome: "desert",
      rarity: 3,
      objectType: "white flower",
      emotion: ["happy", "laughing"],
      message: ["All the way out here!", "...", "Pretty"],
    },
    "see desert snowman": {
      biome: "desert",
      rarity: 1,
      randomEvent: "desert snowman",
      randomEventTime: [0, 1],
      pos: [{x: 9, y: 5}, {x: 9, y: 7}],
      message: ["What...", "Is this real?", "Frosty??"],
    }
  }

  var RANDOM_EVENTS = {
    "nothing": {
      rarity: 1,
      duration: 2,
    },
    "shopping cart": {
      biome: "home",
      rarity: 4,
      frames: [
        [{pos: {x: 1, y: 2}, text: "C", emoji: "🛒"},],
        [{pos: {x: 1, y: 4}, text: "C", emoji: "🛒"},],
        [{pos: {x: 1, y: 4}, text: "C", emoji: "🛒"},],
        [{pos: {x: 1, y: 4}, text: "C", emoji: "🛒"},],
        [{pos: {x: 1, y: 2}, text: "C", emoji: "🛒"},],
      ],
    },

    "desert snowman": {
      biome: "desert",
      rarity: 3,
      frames: [
        [{pos: {x: 10, y: 6}, text: "s", emoji: "☃"},],
        [{pos: {x: 10, y: 6}, text: "s", emoji: "⛄"}, {pos: {x: 9, y: 6}, text: "d", emoji: "💧"},],
        [{pos: {x: 9, y: 6}, text: "d", emoji: "💧"},{pos: {x: 10, y: 6}, text: "d", emoji: "💧"},{pos: {x: 11, y: 6}, text: "d", emoji: "💧"},],
      ]
    },

    "shooting star": {
      timeOfDay: [11, 0],
      rarity: 2,
      skyFrames: [
        [{pos: 9, text: "*", emoji: "🌠"},],
        [{pos: 6, text: "*", emoji: "🌠"},],
        [{pos: 3, text: "*", emoji: "🌠"},],
      ],
    },
    "flying money": {
      timeOfDay: [4, 5],
      rarity: 5,
      skyFrames: [
        [{pos: 2, text: "m", emoji: "💸"},],
        [{pos: 5, text: "m", emoji: "💸"},],
        [{pos: 8, text: "m", emoji: "💸"},],
        [{pos: 11, text: "m", emoji: "💸"},],
      ],
    },
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Simulation
  } else {
    window.Simulation = Simulation
  }
})();