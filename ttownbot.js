var WIDTH = 13
var HEIGHT = 13

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

var EMOJI_SUBS = {
  ".": "🌾",
  "r": "🌹",
  "t": "🌳",
}

function render(isEmoji, map, objects) {
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
