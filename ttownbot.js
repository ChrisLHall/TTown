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

function render(isEmoji, map, objects) {
  console.log("starting render")
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
  if (Math.random() < .3) {
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
  return render(isEmoji, this.map, this.objects)
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
    template: null,
    tileSpawnTypes: [".", ".", ".", "t", "t", "r" ],
    animalSpawnTypes: ["snail", "snail", "bee"],
    numAnimals: 5,
  },
  "desert": {
    template: null,
    tileSpawnTypes: ["s", "s", "s", "d", "d", "d", "c", "c", "w"],
    animalSpawnTypes: ["turtle", "turtle", "turtle", "snake", "bee"],
    numAnimals: 3,
  },
}
// pick from this list when traveling
Biome.travelToTypes = [ "forest", "forest", "desert" ]

var Simulation = function() {
  console.log("making sim")
  this.tick = 0
  this.home = new Biome("home")
  this.travelingToBiome = null
  console.log("new sim made")
}

Simulation.prototype.render = function(isEmoji) {
  if (this.travelingToBiome) {
    return this.travelingToBiome.render(isEmoji)
  } else {
    return this.home.render(isEmoji)
  }
}

Simulation.prototype.simulate = function() {
  this.tick++
  if (this.travelingToBiome) {
    this.travelingToBiome.simulate()
  } else {
    this.home.simulate()
  }
}
