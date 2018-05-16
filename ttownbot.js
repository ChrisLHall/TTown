function listRand(list) { return list[Math.floor(Math.random() * list.length)] }

var WIDTH = 13
var HEIGHT = 9

function initMap() {
  var map = []
  for (var row = 0; row < HEIGHT; row++) {
    var rowList = []
    for (var col = 0; col < HEIGHT; col++) {
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
}

function generateLake(map) {
  
}

function spawnAnimals(objects, num) {
  for (var j = 0; j < num; j++) {
    var type = listRand(Animal.spawnTypes)
    var animal = new Animal(Math.floor(Math.random() * WIDTH), Math.floor(Math.random() * HEIGHT, type)
    objects.push(animal)
  }
}

function simulate() {

}

var EMOJI_SUBS = {
  ".": "🌿",
  "r": "🌹",
  "t": "🌳",
}

function render(isEmoji, map, objects) {
  // todn make a temp map first
  var out = ""
  for (var row = 0; row < map.length; row++) {
    var rowList = map[row]
    for (var col = 0; col < rowList.length; col++) {
      var tile = rowList[col]
      out += (isEmoji ? EMOJI_SUBS[tile] : tile)
    }
    out += "\n"
  }
  
  //todo objects
  
  return out
}

var Animal = function(x, y, type) {
  this.x = x
  this.y = y
  this.type = type
  this.info = Animal.types[type]
}

Animal.prototype.simulate = function() {
  // todo
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
