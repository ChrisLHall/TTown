function listRand(list) { return list[Math.floor(Math.random() * list.length)] }
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

var WIDTH = 13
var HEIGHT = 9

var HOME_MAP_TEMPLATE = [
  "t.tt...~~~~~",
  "..t.tr.ddd~~",
  "pp..tt..~~~~",
  "tp.t.tt..~~~",
  ".pttt.t..tt.",
  ".pr..r.fffff",
  "tpt.,,,fgggg",
  "tHt....fgggg",
  "ttt.,,,fgggg",
];

function initMap() {
  var map = []
  for (var row = 0; row < HEIGHT; row++) {
    var rowList = []
    for (var col = 0; col < WIDTH; col++) {
      var rand = Math.random()
      var tile = "."
      if (rand < .1) {
        tile = "r"
      } else if (rand < .4) {
        tile = "t"
      }
      rowList.push(tile)
    }
    map.push(rowList)
  }
  return map
};

function initMapFromTemplate(template) {
  console.log("hi")
  var h = "hi"
  var map = []
  for (var row = 0; row < template.length; row++) {
    var rowList = []
    var tempStr = template[row]
    for (var col = 0; col < tempStr.length; col++) {
      var tile = tempStr[col]
      rowList.push(tile)
    }
    map.push(rowList)
  }
  return map
};

function spawnAnimals(objects, num) {
  for (var j = 0; j < num; j++) {
    console.log("spawning " + j)
    var type = listRand(Animal.spawnTypes)
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
  console.log("map: " + out)
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
    text: "s",
    emoji: "🐌",
    speed: 1,
  }
}

Animal.spawnTypes = ["snail", "snail", "frog"]
