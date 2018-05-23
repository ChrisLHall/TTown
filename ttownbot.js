function listRand(list) { return list[Math.floor(Math.random() * list.length)] }
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

var WIDTH = 12
var HEIGHT = 9

function initMap(tileTypes, template) {
  console.log("hi")
  console.log(template ? "template" : "no template")
  var map = []
  for (var row = 0; row < HEIGHT; row++) {
    var rowList = []
    var tempStr = template ? template[row] : null;
    for (var col = 0; col < WIDTH; col++) {
      var tile = template ? tempStr[col] : "?";
      if (tile === "?") {
        tile = listRand(tileTypes)
      }
      console.log("made tile " + tile)
      rowList.push(tile)
    }
    map.push(rowList)
  }
  return map
}

function spawnAnimals(objects, types, num) {
  for (var j = 0; j < num; j++) {
    console.log("spawning " + j)
    var type = listRand(types)
    var animal = new Animal(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT), type)
    objects.push(animal)
  }
}

function simulate(objects) {
  for (var o = 0; o < objects.length; o++) {
    objects[o].simulate()
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
  "d": "📁",
  // fence
  "f": "📔",
  // grass/pasture
  "g": "🌾",
  // path
  "p": "🍪",
  // desert
  "s": "📓",
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

var Animal = function(x, y, type) {
  this.x = x
  this.y = y
  this.type = type
  this.info = Animal.types[type]
}

Animal.prototype.simulate = function() {
  if (Math.random() < .9) {
    var dx = -this.info.speed + Math.floor(Math.random() * (2 * this.info.speed + 1))
    var dy = -this.info.speed + Math.floor(Math.random() * (2 * this.info.speed + 1))
    this.x = clamp(this.x + dx, 0, WIDTH - 1)
    this.y = clamp(this.y + dy, 0, HEIGHT - 1)
  }
}

Animal.types = {
  "frog": {
    text: "f",
    emoji: "🐸",
    speed: 3,
  },
  "snail": {
    text: "9",
    emoji: "🐌",
    speed: 1,
  },
  "snake": {
    text: "S",
    emoji: "🐍",
    speed: 2,
  },
  "turtle": {
    text: "t",
    emoji: "🐢",
    speed: 1,
  },
  "bee": {
    text: "b",
    emoji: "🐝",
    speed: 3,
  },
}

var Biome = function(type) {
  console.log("creatng biome " + type)
  this.type = type
  this.info = Biome.types[type]
  this.map = initMap(this.info.tileSpawnTypes, this.info.template)
  this.objects = []
  spawnAnimals(this.objects, this.info.animalSpawnTypes, this.info.numAnimals)
  console.log("made biome " + type)
}

Biome.prototype.render = function(isEmoji) {
  return renderToArray(isEmoji, this.map, this.objects)
}

Biome.prototype.simulate = function() {
  simulate(this.objects)
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
  this.x = 0
  this.y = 0
  this.emotion = "normal"
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
  this.tick = 0
  this.timeOfDay = 0
  this.home = new Biome("home")
  this.travelingToBiome = null
  this.character = new Character()
  this.message = ""
  console.log("new sim made")
}

Simulation.prototype.render = function(isEmoji) {
  var outMap;
  if (this.travelingToBiome) {
    outMap = this.travelingToBiome.render(isEmoji)
  } else {
    outMap = this.home.render(isEmoji)
  }

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

  if (this.travelingToBiome) {
    this.travelingToBiome.simulate()
  } else {
    this.home.simulate()
  }
  console.log("simulated")

  this.moveCharacter()
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

Simulation.prototype.moveCharacter = function() {
  var possibleActions = []
  for (var j = 0; j < CHARACTER_ACTIONS.length; j++) {
    // TODO
  }
}
