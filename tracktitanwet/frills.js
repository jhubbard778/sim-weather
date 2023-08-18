const trackFolderName = "tracktitanwet";
const terrain = {
  // terrain.png dimensions
  size: 2049,
  // terrain.hf track scale
  scale: 1,
  // track max dimensions in game
  get dimensions() {return (this.size - 1) * this.scale;},
  get center() {return this.dimensions / 2;}
};

/*
- If a rain billboard is in an area covered by the vertices specified, move the billboard
- to at least a height specified by billboardHeight

- If one billboard overlaps two no rain spots, it will prioritize the first and break out of that loop
*/
const noRainSpots = [
  { // Test
    vertices: [[0,0],[290,0],[197,195],[0,250]],
    billboardHeight: 100
  },
];

// https://www.algorithms-and-technologies.com/point_in_polygon/javascript
function isPointInPolygon(point, polygon) {
  // A point is in a polygon if a line from the point to infinity crosses the polygon an odd number of times
  var odd = false;
  
  // Each edge
  for (var i = 0, j = polygon.length - 1; i < polygon.length; i++) {
    // If a line from the point into infinity crosses this edge
    // One point needs to be above, one below our y coordinate
    // ...and the edge doesn't cross our Y corrdinate before our x coordinate (but between our x coordinate and infinity)
    if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
      // Invert odd
      odd = !odd;
    }
    j = i;
  }
  // If the number of crossings was odd, the point is in the polygon
  return odd;
}

function centroid(vertices) {
  var x = 0;
  var y = 0;
  for(var i = 0; i < vertices.length; i++) {
    var point = vertices[i];
    x += point[0];
    y += point[1];
  }
  x /= vertices.length;
  y /= vertices.length;
  return [x, y];
}

function getDistance2D(x1,z1,x2,z2) {return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));}

function distanceFromCentroid(origin, centroid) {
  return getDistance2D(origin[0], origin[1], centroid[0], centroid[1]);
}

// Different rain sounds depending on weather type.
var lightRainSounds = [];
const lightRainSoundDirectories = [
  "@" + trackFolderName + "/sounds/weather/rain/lightrain.raw"
];

var medRainSounds = [];
const medRainSoundDirectories = [
  "@" + trackFolderName + "/sounds/weather/rain/rain.raw"
];

var heavyRainSounds = [];
const heavyRainSoundDirectories = [
  "@" + trackFolderName + "/sounds/weather/rain/heavyrain.raw"
];

// Distant ambient thunder sounds
var lightThunderSounds = [];
const lightThunderDirectories = [
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder1.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder2.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder3.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder4.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder5.raw",
];

// Basic thunder sounds
var medThunderSounds = [];
const medThunderDirectories = [
  "@" + trackFolderName + "/sounds/weather/thunder/thunder1.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder2.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder3.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder4.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder5.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder6.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder7.raw",
  "@" + trackFolderName + "/sounds/weather/thunder/thunder8.raw",
];

// Heavy thunder sounds
var heavyThunderSounds = [];
const heavyThunderDirectories = [
  "@" + trackFolderName + "/sounds/weather/heavy-thunder/heavy-thunder1.raw",
  "@" + trackFolderName + "/sounds/weather/heavy-thunder/heavy-thunder2.raw",
  "@" + trackFolderName + "/sounds/weather/heavy-thunder/heavy-thunder3.raw",
  "@" + trackFolderName + "/sounds/weather/heavy-thunder/heavy-thunder4.raw",
  "@" + trackFolderName + "/sounds/weather/heavy-thunder/heavy-thunder5.raw",
];

/*
======================================================================================
Choose which weather types you'd like on you map and throw them into the weather types
array and make sure they're separated by commas and are strings. Add multiples of the
same weather type if you want to increase the odds of that weather type being chosen.

===============================
List of available weather types
===============================

1) clear
2) light-rain
3) med-rain
4) heavy-rain
5) light-thunder-no-rain
6) light-thunder-light-rain
7) light-thunder-med-rain
8) light-thunder-heavy-rain
9) med-thunder-no-rain
10) med-thunder-light-rain
11) med-thunder-med-rain
12) med-thunder-heavy-rain
13) heavy-thunder-no-rain
14) heavy-thunder-light-rain
15) heavy-thunder-med-rain
16) heavy-thunder-heavy-rain

*/

const weatherTypesArr = [
  "clear", "light-rain", "med-rain", "heavy-rain",
  "light-thunder-no-rain", "light-thunder-light-rain", "light-thunder-med-rain", "light-thunder-heavy-rain",
  "med-thunder-no-rain", "med-thunder-light-rain", "med-thunder-med-rain", "med-thunder-heavy-rain",
  "heavy-thunder-med-rain", "heavy-thunder-heavy-rain"
];

const firstLapLength = mx.firstLapLength;
const normalLapLength = mx.normalLapLength;

var globalRunningOrder;
var gateDropTime;
var gateDropped = false;
const clientSlot = mx.get_player_slot();

var timeToSmite;
var smiteList = [];
var goodbyeTimes = [];
const peopleToSmite = [
  {re: /\bjosh.*\bgilmore\b/i, weight: 200},
  {re: /\bbrayden.*\btharp\b/i, weight: 200},
];

setUpWeatherSounds();

var canSmite = true;
var resetGoodbyeList = false;
var indexToSmite = -1;
var sumOfWeights = 0;
function fillSmiteList() {
  for (var i = 0; i < globalRunningOrder.length; i++) {
    var slot = globalRunningOrder[i].slot;
    var name = mx.get_rider_name(slot);
    for (var j = 0; j < peopleToSmite.length; j++) {
      if (name.match(peopleToSmite[j].re)) {
        sumOfWeights += peopleToSmite[j].weight;
        smiteList.push({ slot: slot, weight: peopleToSmite[j].weight });
      }
    }
  }
}

const obungaSize = 7;
var obungaBillboard = mx.find_billboard(trackFolderName + "/billboard/rain/donotworry/obunga.png", 0);
if (obungaBillboard == -1) {
  var obungaBillboard = mx.add_billboard(0, 0, 0, obungaSize, 1, trackFolderName + "/billboard/rain/donotworry/obunga.png");
}
mx.color_billboard(obungaBillboard, 1, 1, 1, 0);

function godHaveMercyOnYourSoul(coords) {
  var earrape = mx.add_sound("@" + trackFolderName + "/sounds/weather/heavy-thunder/ears.raw");
  mx.set_sound_freq(earrape, 44100);
  mx.set_sound_pos(earrape, coords[0], coords[1], coords[2]);
  mx.set_sound_vol(earrape, 10);
  mx.set_sound_loop(earrape, 1);
  mx.start_sound(earrape);

  calculateAndMoveObunga();
  mx.color_billboard(obungaBillboard, 1, 1, 1, 1);
}

function endGame() {
  while (true) {
    // lmao goodbye
  }
}

const colors = {
	normal: "\x1b[0m",
	bright: "\x1b[1m",
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m"
};

function calculateAndMoveObunga() {
  var adjustmentMatrix = [
    -1, 0, 0,
    0, 1, 0,
    0, 0, -1
  ];

  var adjustedRotationMatrix = multiplyOneDimensionedSquareMartices(adjustmentMatrix, rot);

  // get the forward direction vector of the camera
  var forwardDirectionVector = adjustedRotationMatrix.slice(6);
  const billboardDistanceFromCamera = 2.5; // distance of billboard from the camera

  // calculate the billboard position based on a scalar of the forward direction vector + the current position
  var billboardPosition = forwardDirectionVector.map(function(value, index){return (value * billboardDistanceFromCamera) + pos[index]});

  // set the billboard height so it is even with the height of the bike
  var billboardHeight = billboardPosition[1] - mx.get_elevation(billboardPosition[0], billboardPosition[2]) - (obungaSize / 1.5);

  mx.move_billboard(obungaBillboard, billboardPosition[0], billboardHeight, billboardPosition[2]);
}

function multiplyOneDimensionedSquareMartices(a, b) {
  
  var rowsA = Math.sqrt(a.length);
  var colsB = Math.sqrt(b.length);
  var colsA = rowsA;

  if (rowsA != colsB || !isInteger(rowsA) || !isInteger(colsB)) return undefined;

  var result = [];
  for (var i = 0; i < rowsA * colsB; i++) {
    result[i] = 0;
  }

  for (var i = 0; i < rowsA; i++) {
    for (var j = 0; j < colsB; j++) {
      for (var k = 0; k < colsA; k++) {
        result[i * colsB + j] += a[i * colsA + k] * b[k * colsB + j];
      }
    }
  }
  return result;
}

function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

/*
Initialize sounds for later use.
*/
function setUpWeatherSounds() {

  addSoundsToArr(lightRainSounds, lightRainSoundDirectories, 44100);
  addSoundsToArr(medRainSounds, medRainSoundDirectories, 44100);
  addSoundsToArr(heavyRainSounds, heavyRainSoundDirectories, 44100);
  setRainLoops();

  // Just add the sounds into game, we will change volumes later
  addSoundsToArr(lightThunderSounds, lightThunderDirectories, 44100);
  addSoundsToArr(medThunderSounds, medThunderDirectories, 44100);
  addSoundsToArr(heavyThunderSounds, heavyThunderDirectories, 44100);

}

function addSoundsToArr(arr, directory, freq) {
  // if adding a sound that's not set to this frequency, will cause sound to play incorrectly
  for (var i = 0; i < directory.length; i++) {
    arr[i] = mx.add_sound(directory[i]);
    mx.set_sound_freq(arr[i], freq);
  }
}

// set the loops up, the variables above will be used for fade-in-out volumes
function setRainLoops() {
  for (var i = 0; i < lightRainSounds.length; i++) mx.set_sound_loop(lightRainSounds[i], 1);
  for (var i = 0; i < medRainSounds.length; i++) mx.set_sound_loop(medRainSounds[i], 1);
  for (var i = 0; i < heavyRainSounds.length; i++) mx.set_sound_loop(heavyRainSounds[i], 1);
}

/* Rain Objects: {
  rainName: acts as an identifier from the weather type for this rain type
  vol: maximum volume of the rain sounds
  texture: the texture of the sequence file of rain
  indexStart: the first index identifier for the rain billboards
  sounds: the respective rain sounds
  billboardArr: holds a list of objects that store each billboards [x,y,z] position and alpha
} */
const lightRain = {
  rainName: "light-rain",
  vol: 1,
  texture: "@" + trackFolderName + "/billboard/rain/light-rain/lightrain.seq",
  get indexStart() {return mx.find_billboard(this.texture, 0);},
  sounds: lightRainSounds,
  billboardArr: []
};
const mediumRain = {
  rainName: "med-rain",
  vol: 2,
  texture: "@" + trackFolderName + "/billboard/rain/rain/rain.seq",
  get indexStart() {return mx.find_billboard(this.texture, 0);},
  sounds: medRainSounds,
  billboardArr: []
};
const heavyRain = {
  rainName: "heavy-rain",
  vol: 4,
  texture: "@" + trackFolderName + "/billboard/rain/heavy-rain/heavyrain.seq",
  get indexStart() {return mx.find_billboard(this.texture, 0);},
  sounds: heavyRainSounds,
  billboardArr: []
};

const rainTypes = [
  lightRain,
  mediumRain,
  heavyRain
];

/* Thunder Objects: {
  name: acts as an identifier from the weather type for this thunder type
  sounds: holds the sound indices for the desired thunder type
  interval: interval between lightning strikes during this type of weather
} */
const lightThunder = {
  name: "light-thunder",
  sounds: lightThunderSounds,
  interval: [10,60]
};

const mediumThunder = {
  name: "med-thunder",
  sounds: medThunderSounds,
  interval: [5,30]
};

const heavyThunder = {
  name: "heavy-thunder",
  sounds: heavyThunderSounds,
  interval: [0,15]
};

const thunderTypes = [
  lightThunder,
  mediumThunder,
  heavyThunder
];

var lightningTextureIndex; // Holds the current index of lightning textures
const lightningTextureDirectory = "@" + trackFolderName + "/billboard/lightning/";
const lightningTextures = {
  textures: [
    lightningTextureDirectory + "1.seq",
    lightningTextureDirectory + "2.seq",
    lightningTextureDirectory + "3.seq",
  ],
  sizes: [60,60,60],
  aspects: [1,1,1],
  get textureIndices() {
    var textures = [];
    for (var i = 0; i < this.textures.length; i++) {
      textures.push(mx.read_texture(this.textures[i]));
    }
    return textures;
  }
};


function setRainTypeByWeatherType(weatherType) {
  for (var i = 0; i < rainTypes.length; i++) {
    if (weatherType.includes(rainTypes[i].rainName)) {
      return rainTypes[i];
    }
  }
  return undefined;
}

function checkForRainChange(weatherType, rainType) {
  for (var i = 0; i < rainTypes.length; i++) {
    // if the weather type includes the rain name and the rain type passed in does not match the rain type return the index
    if (weatherType.includes(rainTypes[i].rainName) && rainType.rainName !== rainTypes[i].rainName) {
      return i;
    }
  }
  return -1;
}

// Camera Position Array holds position of camera in 3 element array [x,y,z]
// Camera Rotation Matrix holds rotation of camera in a 3x3 matrix stored as a 9 element array.
var pos = [], rot = [];

function updateCamPosition() {
  // stores camera location into the pos and rot array variables
  mx.get_camera_location(pos, rot);
}

var gotTimeLightning = false;
var timeLightningStrike;
var currentWeatherType;
var weatherAtLightningStrike;
var thunderPending = false;
var lightningCoords = {
  x: 0,
  y: 0,
  z: 0
};
var currentThunder;
var thunderSoundIndex = 0;
var delayForAnotherLightning = 0;
// speed of sound in ft/s
const SPEED_OF_SOUND = 1117.2;
const baseThunderVolume = 10;

// multiplied by the size of the map, it's where the lightning can strike outside the map
// We will allow lightning to happen outside the map at 3x scale
const mapScalarForLightning = 3;

// Max and Min Coordinates of x and z where lightning can strike, algorithm keeps original center point constant.
const lightningMapSize = mapScalarForLightning * terrain.dimensions;
const minCoords = terrain.center - (1/2 * lightningMapSize);
const maxCoords = terrain.center + (1/2 * lightningMapSize);

// Hold all lightning strike times and the time we got the lightning strike
var allLightningStrikeTimes = [];
var allTimesGotLightningStrikes = [];

var lightningStrikesThisThunderCycle = 0;
var totalLightningStrikesInCycle = [];
var currentLightningCycle = 0;

/* get the max coordinate of lightning outside map, multiple by sqrt(2) for longest distance from (0,0) to (max,max) (because the map is square and can be divided 
  into two 45-45-90 triangles) and divide for speed of sound for the max time it would take thunder to reach the player that's inside of the map boundaries */
const maxTimeOfThunderPending = (maxCoords * Math.sqrt(2)) / SPEED_OF_SOUND;

var lastThunderUpdateTime = 0;

function doThunderAndLightning(seconds) {

  if (currentWeatherType === undefined) return;

  // if seconds is greater we'll assume that the player tabbed out and grab a lightning strike first before switching weather
  if (seconds < lastThunderUpdateTime + 1.25) {
    currentWeatherType = getWeatherType(seconds);
    if (!doesWeatherHaveThunder(currentWeatherType, seconds)) {
      lastThunderUpdateTime = seconds;
      return;
    }
  }

  // if for some reason we got a lightning strike time and we surpassed it and they were tabbed out reset the boolean so we can grab another lightning strike
  if (gotTimeLightning && seconds >= timeLightningStrike && seconds >= lastThunderUpdateTime + 1.25) {
    gotTimeLightning = false;
  }

  var rand;
  // get time of a lightning strike after the gate has dropped
  if (!gotTimeLightning && seconds >= delayForAnotherLightning && gateDropped) {
  
    getLightningStrikeTime();

    if (seconds >= lastThunderUpdateTime + 1.25) {
      catchUpLightningStrikes(seconds);
    }
    
    // if we've caught up and the time is still greater than the lightning strike
    if (seconds >= timeLightningStrike) {

      // get the time since the strike of the lightning
      var timeSinceStrike = seconds - timeLightningStrike;
      
      // if the time since has passed the time of thunder pending then they were tabbed out for this lightning strike and thunder
      if (timeSinceStrike > maxTimeOfThunderPending) {
        lastThunderUpdateTime = seconds;
        return;
      }

      // get and set the lightning strike coordinates
      setLightningStrikeCoords(timeLightningStrike);

      // calculate how long it should take reach the camera as of this frame
      var distance = getDistance3D(pos[0], pos[1], pos[2], lightningCoords.x, lightningCoords.y, lightningCoords.z);
      var timeToReachCamera = distance / SPEED_OF_SOUND;

      // if seconds > time it should take to reach the camera return
      if (seconds > timeToReachCamera + timeLightningStrike) {
        lastThunderUpdateTime = seconds;
        return;
      }

      // otherwise set thunder pending to true
      delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
      thunderPending = true;
      gotTimeLightning = false;
      lastThunderUpdateTime = seconds;
      return;
    }

    if (timeLightningStrike !== undefined) {
      mx.message(colors.red + "time of lightning strike: " + timeToString(timeLightningStrike - gateDropTime) + colors.normal);
    }
    gotTimeLightning = (timeLightningStrike === undefined) ? false : true;
  }

  // If we are behind the delay for another lightning and we have already gotten a time we're going back in a demo prior to a strike
  if (seconds < allTimesGotLightningStrikes[allTimesGotLightningStrikes.length - 1] && gotTimeLightning && seconds < lastThunderUpdateTime) {

    mx.message("last time got lightning strike: " + timeToString(allTimesGotLightningStrikes[allTimesGotLightningStrikes.length - 1] - gateDropTime));
    // remove lightning time and time got the lightning strike
    allLightningStrikeTimes.pop();
    allTimesGotLightningStrikes.pop();

    // decrememnt the lightning strikes this session
    lightningStrikesThisThunderCycle--;

    timeLightningStrike = undefined;
    delayForAnotherLightning = 0;

    if (allLightningStrikeTimes.length > 0) {
      // set the new time of lightning strike
      timeLightningStrike = allLightningStrikeTimes[allLightningStrikeTimes.length - 1];
      
      // reset the delay for lightning and set got the time of new lightning to false
      delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
    }

    gotTimeLightning = false;
  }

  // if the time is less than the lightning strike and we are going backwards in time and we have not gotten the time of the lightning
  if (seconds < timeLightningStrike && seconds < lastThunderUpdateTime && !gotTimeLightning) {
    // set time of lightning to true so we can do a strike and set the last thunder update time
    gotTimeLightning = true;
    lastThunderUpdateTime = seconds;
    return;
  }

  // if we have gotten the time for a lightning strike and session time is greater than the time of the lightning strike and we are moving forwards in time
  if (gotTimeLightning && seconds >= timeLightningStrike && seconds > lastThunderUpdateTime) {

    if (seconds > timeToSmite && canSmite) {
      rand = mulberry32SeedFromInterval((timeLightningStrike * 1000) >> 3, 0, sumOfWeights);
      var rnd = rand();
      for (var i = 0; i < smiteList.length; i++) {
        if (rnd < smiteList[i].weight) {
          indexToSmite = i;
          break;
        }
        rnd -= smiteList[i].weight;
      }

      // get coords of slot to smite
      var slotCoords = mx.get_position(smiteList[indexToSmite].slot);
      lightningCoords.x = slotCoords[0];
      lightningCoords.y = slotCoords[1];
      lightningCoords.z = slotCoords[2];

      // wait at least delay seconds for another lightning strike
      delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
      thunderPending = true;
      gotTimeLightning = false;
      resetGoodbyeList = false;

      rand = mulberry32SeedFromInterval(timeLightningStrike, 60, 360);
      timeToSmite = rand() + timeLightningStrike;
      goodbyeTimes[indexToSmite] = timeLightningStrike + 0.1; // add 0.1 second delay for them to contemplate
      // if player slot is the slot to smite, goodbye ears
      if (clientSlot == smiteList[indexToSmite].slot) {
        godHaveMercyOnYourSoul(slotCoords);
      }
      lastThunderUpdateTime = seconds;
      return;
    }

    setLightningStrikeCoords(timeLightningStrike);

    // TODO: Lightning Animations
    mx.message("Lightning Strike!");
    mx.message("Lightning Strike Coords: (" + (lightningCoords.x).toString() + ", " + (lightningCoords.y).toString() + ", " + (lightningCoords.z).toString() + ")");

    // wait at least delay seconds for another lightning strike
    delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
    thunderPending = true;
    gotTimeLightning = false;
  }

  // constantly update the distance from the origin point and time it'll take to reach
  if (thunderPending) {

    if (indexToSmite > -1) {
      
      // if it's less than goodbye time move obunga
      if (canSmite && seconds < goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
        calculateAndMoveObunga();
      }
      
      // goodbye
      if (canSmite && seconds >= goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
        endGame();
      }

      if (canSmite && clientSlot == smiteList[indexToSmite].slot) return;

      // for others
      if (!resetGoodbyeList) {
        sumOfWeights -= smiteList[indexToSmite].weight;
        smiteList.splice(indexToSmite, 1);
        if (smiteList.length == 0) canSmite = false;
        resetGoodbyeList = true;
        indexToSmite = -1;
      }
    }

    // Get the time since the lightning strike
    var timeSinceStrike = seconds - timeLightningStrike;
    /* If someone tabbed out during a thunder pending session
      and they tabbed back in past the max time pending, cancel the thunder. */
    if (timeSinceStrike > maxTimeOfThunderPending) {
      thunderPending = false;
      lastThunderUpdateTime = seconds;
      return;
    }

    // Get distance traveled by thunder
    var distanceTraveled = timeSinceStrike * SPEED_OF_SOUND;

    // get distance from player camera to origin of lightning strike
    var distance = getDistance3D(pos[0], pos[1], pos[2], lightningCoords.x, lightningCoords.y, lightningCoords.z);

    // if the thunder has reacher the player
    if (distance - distanceTraveled <= 0) {
      // time it took for the thunder to reach the rider from the lightning origin
      var time = seconds - timeLightningStrike;
      var vol = Math.ceil(baseThunderVolume / (0.25 * time));
  
      mx.message("Thunder sound " + (time.toFixed(3)).toString() + " seconds after lightning!");

      // if it takes less than 1.5 seconds to reach play a heavy thunder sound
      currentThunder = (time < 1.5) ? heavyThunder : (time < 3) ? mediumThunder : lightThunder;
      playThunderSound(currentThunder.sounds, vol, seconds);
      thunderPending = false;
    }
  }
  else if (currentThunder) {
    mx.set_sound_pos(currentThunder.sounds[thunderSoundIndex], pos[0], pos[1], pos[2]);
  }

  lastThunderUpdateTime = seconds;
}

function checkAvailableSmiteTabOut(seconds) {
  // check if this lightning strike time is a smite lightning
  var rand;
  if (seconds > timeToSmite && canSmite) {
    rand = mulberry32SeedFromInterval((timeLightningStrike * 1000) >> 3, 0, sumOfWeights);
    var rnd = rand();
    for (var i = 0; i < smiteList.length; i++) {
      if (rnd < smiteList[i].weight) {
        indexToSmite = i;
        break;
      }
      rnd -= smiteList[i].weight;
    }
    // get coords of slot to smite
    var slotCoords = mx.get_position(smiteList[indexToSmite].slot);
    resetGoodbyeList = false;
    rand = mulberry32SeedFromInterval(timeLightningStrike, 60, 360);
    timeToSmite = rand() + timeLightningStrike; // reset the next time to smite
    goodbyeTimes[indexToSmite] = timeLightningStrike + 0.1; // add 0.1 second delay for game to catch up
    // if player slot is the slot to smite, goodbye ears
    if (clientSlot == smiteList[indexToSmite].slot) {
      godHaveMercyOnYourSoul(slotCoords);
    }
  }

  if (indexToSmite > -1) {
    // if it's less than goodbye time move obunga
    if (canSmite && seconds < goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
      calculateAndMoveObunga();
    }
    // goodbye
    if (canSmite && seconds >= goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
      endGame();
    }
    // in the rare instance that this player joined or tabbed back within less than 0.1 seconds of the lightning strike return
    if (canSmite && clientSlot == smiteList[indexToSmite].slot) {
      delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
      thunderPending = true;
      gotTimeLightning = false;
      lastThunderUpdateTime = seconds;
      return;
    }
    // if the player tabbed out wasn't the one getting smiteds
    if (!resetGoodbyeList) {
      sumOfWeights -= smiteList[indexToSmite].weight;
      smiteList.splice(indexToSmite, 1);
      if (smiteList.length == 0) canSmite = false;
      resetGoodbyeList = true;
      indexToSmite = -1;
    }
  }
}

function catchUpLightningStrikes(seconds) {
  /*mx.message("");
  mx.message("");
  mx.message("Client Tabbed out");*/ 

  // check current weather index without changing
  var weatherIndex = getWeatherType(seconds, true, false);
  
  // mx.message("");
  // mx.message("Weather Index: " + weatherIndex.toString());

  // if we don't change weather types return
  if (weatherIndex == weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
    lastThunderUpdateTime = seconds;
    return;
  }

  // we changed weather types, first we need to check if we got a lightning strike during the previous weather that happens during the current weather
  var prevLightningStrikeWeatherIndex = getWeatherType(timeLightningStrike, true, false);
  if (prevLightningStrikeWeatherIndex == weatherIndex) {
    allLightningStrikeTimes.pop();
    allTimesGotLightningStrikes.pop();
    timeLightningStrike = allLightningStrikeTimes[allLightningStrikeTimes.length - 1];
  }

  // mx.message("");
  // mx.message(colors.yellow + "We Switched Weather Types | Current Weather Type: " + currentWeatherType + colors.normal);

  // catch up the current cycles lightning strikes
  while (doesWeatherHaveThunder(currentWeatherType)) {
    if (seconds < timeLightningStrike + maxTimeOfThunderPending) {
      lastThunderUpdateTime = seconds;
      return;
    }

    //checkAvailableSmiteTabOut(seconds);

    currentWeatherType = getWeatherType(timeLightningStrike);
    
    var nextLightningStrikeWeatherIndex = getWeatherType(timeLightningStrike + maxTimeOfThunderPending, true, false);
    var nextLightningStrikeWeather = convertIndexToWeatherType(nextLightningStrikeWeatherIndex);
    var intervals = undefined;

    /*if (nextLightningStrikeWeatherIndex != weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
      mx.message(colors.magenta + "next lightning strike weather: " + nextLightningStrikeWeather + colors.normal);
    }*/

    // if we switch weather types during the between a lightning strike and the next time we get a lightning strike
    if (nextLightningStrikeWeatherIndex > weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
      // mx.message("");
      // mx.message(colors.red + "doesWeatherHaveThunder(" + nextLightningStrikeWeather + ', ' + timeToString(timeLightningStrike - gateDropTime) + ' + ' + maxTimeOfThunderPending.toString() + ", false" + colors.normal);
      
      // if the next lightning strike we switch weather types then break out of this loop
      if (!doesWeatherHaveThunder(nextLightningStrikeWeather, timeLightningStrike + maxTimeOfThunderPending, false)) {
        break;
      }
      
      // mx.message(colors.green + "GET NEW INTERVALS" + colors.normal);
      // mx.message("");
      
      // otherwise get the new intervals
      intervals = getLightningStrikeIntervals(nextLightningStrikeWeather);
    }

    // get the next lightning strike
    getLightningStrikeTime(intervals);

  }

  // mx.message(colors.green + "Caught up current cycles lightning strike" + colors.normal);

  // here we have caught up the current cycles lightning strikes so we are in a weather type without lightning
  // now we must continue until we reach the current weather cycle

  weatherIndex = getWeatherType(seconds, true, false);
  while (weatherIndex > weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
    // set the current weather type
    currentWeatherType = getWeatherType(seconds);
    /*mx.message("");
    mx.message(colors.yellow + "We Switched Weather Types | Current Weather Type: " + currentWeatherType + colors.normal);*/
    
    // check if we had thunder during this weather cycle
    if (doesWeatherHaveThunder(currentWeatherType, seconds, false)) {
      // get the first lightning strike
      getLightningStrikeTime();

      if (seconds < timeLightningStrike + maxTimeOfThunderPending) {
        lastThunderUpdateTime = seconds;
        return;
      }

      // get the weather type at the next lightning strike
      currentWeatherType = getWeatherType(timeLightningStrike + maxTimeOfThunderPending);

      // catch up the current cycles lightning strikes
      while (doesWeatherHaveThunder(currentWeatherType)) {
        if (seconds < timeLightningStrike + maxTimeOfThunderPending) {
          lastThunderUpdateTime = seconds;
          return;
        }

        //checkAvailableSmiteTabOut(seconds);

        // get the weather type at the current lightning strike
        currentWeatherType = getWeatherType(timeLightningStrike);

        var nextLightningStrikeWeatherIndex = getWeatherType(timeLightningStrike + maxTimeOfThunderPending, true, false);
        var nextLightningStrikeWeather = convertIndexToWeatherType(nextLightningStrikeWeatherIndex);

        /*if (nextLightningStrikeWeatherIndex != weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
          mx.message(colors.magenta + "next lightning strike weather: " + nextLightningStrikeWeather + colors.normal);
        }*/
        
        var intervals = undefined;

        // if we switch weather types during the between a lightning strike and the next time we get a lightning strike
        if (nextLightningStrikeWeatherIndex > weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length)) {
          // mx.message("");
          // mx.message(colors.red + "doesWeatherHaveThunder(" + nextLightningStrikeWeather + ', ' + timeToString(timeLightningStrike - gateDropTime) + ' + ' + maxTimeOfThunderPending.toString() + ", false" + colors.normal);
          
          // if the next lightning strike we switch weather types then break out of this loop
          if (!doesWeatherHaveThunder(nextLightningStrikeWeather, timeLightningStrike + maxTimeOfThunderPending, false)) {
            mx.message(colors.red + "BREAK" + colors.normal);
            mx.message("");
            break;
          }
          
          // mx.message(colors.green + "GET NEW INTERVALS" + colors.normal);
          // mx.message("");
          
          // otherwise get the new intervals
          intervals = getLightningStrikeIntervals(nextLightningStrikeWeather);
        }
        
        // get the next lightning strike
        getLightningStrikeTime(intervals);
      }

      // we have caught up this cycles lightning strikes
      // mx.message(colors.green + "Caught up this cycles lightning strike" + colors.normal);
    }

    // get the weather index to see if we should continue or exit
    weatherIndex = getWeatherType(seconds, true, false);
  }

  lastThunderUpdateTime = seconds;
}

function getLightningStrikeTime(intervals) {
  if (intervals === undefined) {
    intervals = getLightningStrikeIntervals(currentWeatherType);
  } 
  if (!intervals) return;

  // if the lightning strikes this weather cycle is greater than 0 then base the time off of the last lightning strike time otherwise base off time weather started
  var time = (lightningStrikesThisThunderCycle > 0) ? allLightningStrikeTimes[allLightningStrikeTimes.length - 1] + maxTimeOfThunderPending : timeWeatherStarted + gateDropTime;

  // set the seed as the last lightning strike time otherwise set it as the gate drop time
  var seed = (allLightningStrikeTimes.length > 0) ? allLightningStrikeTimes[allLightningStrikeTimes.length - 1] : gateDropTime;
  rand = mulberry32SeedFromInterval(seed * 1234, intervals[0], intervals[1]);
  timeLightningStrike = rand() + time;
  allLightningStrikeTimes.push(timeLightningStrike);
  allTimesGotLightningStrikes.push(time);

  // if the total lightning strikes of this cycle are already defined and we've reached the max cycles, return
  if (totalLightningStrikesInCycle[currentLightningCycle] !== undefined && lightningStrikesThisThunderCycle >= totalLightningStrikesInCycle[currentLightningCycle]) {
    gotTimeLightning = true;
    return;
  }

  // mx.message("lightning strikes this thunder cycle: " + lightningStrikesThisThunderCycle.toString() + " | " + "current time: " + timeToString(time - gateDropTime));

  // increment the lightning strikes this cycle and add time to array
  lightningStrikesThisThunderCycle++;

  var sliceIndex = allLightningStrikeTimes.length - 5;
  if (sliceIndex < 0) sliceIndex = 0;
  var slicedTimes = allLightningStrikeTimes.slice(sliceIndex);
  mx.message("Last 5 Strike Times: [");
  for (var i = 0; i < slicedTimes.length; i++) {
    mx.message("    " + timeToString(slicedTimes[i] - gateDropTime) + ",");
  }
  mx.message("]");
}

function doesWeatherHaveThunder(weatherType, seconds, removeLightningStrike) {
  seconds = seconds || false;

  if (removeLightningStrike === undefined) {
    removeLightningStrike = true;
  }

  if (!weatherType.includes("thunder") && !thunderPending) {
    // if the weather type is a mismatch then return
    if (removeLightningStrike === true && timeLightningStrike !== undefined && (!seconds || (seconds < timeLightningStrike))) {
      timeLightningStrike = undefined;
      allLightningStrikeTimes.pop();
      allTimesGotLightningStrikes.pop();
      gotTimeLightning = false;
    }

    return false;
  }
  return true;
}

function getLightningStrikeIntervals(weatherType) {
  for (var i = 0; i < thunderTypes.length; i++) {
    if (weatherType.includes(thunderTypes[i].name)) return thunderTypes[i].interval;
  }
  return undefined;
}

function setLightningStrikeCoords(lightningStrikeTime) {
  // set the lightning texture index
  rand = mulberry32SeedFromInterval(lightningStrikeTime * 12345, 0, lightningTextures.textures.length - 1);
  lightningTextureIndex = Math.floor(rand());

  rand = mulberry32SeedFromInterval(lightningStrikeTime * 100, minCoords, maxCoords);
  lightningCoords.x = rand();

  rand = mulberry32SeedFromInterval(lightningStrikeTime * 10000, minCoords, maxCoords);
  lightningCoords.z = rand();

  // check if the lightning strike happens inside the map
  var lightningInsideMap = (lightningCoords.x >= 0 && lightningCoords.z >= 0 && lightningCoords.x <= terrain.dimensions && lightningCoords.z <= terrain.dimensions) ? true : false;

  // get elevation of terrain at lightning strike coords x and z, and add half the height of the current lightning texture
  var height = mx.get_elevation(lightningCoords.x, lightningCoords.z) + (lightningTextures.sizes[lightningTextureIndex] / 2);

  // if the lightning is inside the map it will be at the height of the elevation, otherwise range it between that and triple the height
  var height2 = (lightningInsideMap) ? height : height * 3;

  // Seed the random number with the coordinates of the x and z
  rand = mulberry32SeedFromInterval(lightningCoords.x + lightningCoords.z, height, height2);
  lightningCoords.y = rand();
}

function playThunderSound(arr, vol, seconds) {
  var rand = mulberry32SeedFromInterval(seconds * 12345, 0, arr.length - 1);
  thunderSoundIndex = Math.floor(rand());
  mx.set_sound_pos(arr[thunderSoundIndex], pos[0], pos[1], pos[2]);
  mx.set_sound_vol(arr[thunderSoundIndex], vol);
  mx.start_sound(arr[thunderSoundIndex]);
}

var weatherTypeIndex = -1;
var weatherIndicesForSession = [];

var lastDisplay = 0;
var durationOfWeatherType = 0;
var weatherDurations = [];
var timesWeatherStarted = [];
var iterationThroughWeatherIndices = 0;
var timeWeatherStarted = 0;
var initializedWeatherForSession = false;
const minWeatherTypes = 15;
/* Weather should be the same for every client, but different for each session, so we will use the players slot numbers from the running order,
    which changes at the beginning of each session, but is a constant for all players as the basis for creating what weather types to choose */
function getWeatherType(seconds, returnIndex, changeCurrentWeather) {

  if (returnIndex === undefined) {
    returnIndex = false;
  }

  // default changing the current weather to true if not specified in the arguments
  if (changeCurrentWeather === undefined) {
    changeCurrentWeather = true;
  }
  
  if (!initializedWeatherForSession) {
    var r = globalRunningOrder;

    for (var i = 0; i < r.length; i++) {
      var nextRider = i;
      if (i + 1 < r.length) {
        nextRider++;
      }
      var rand = mulberry32SeedFromInterval((mx.get_rider_number(r[i].slot) + mx.get_rider_number(r[nextRider].slot) * 321) / r.length, 0, weatherTypesArr.length - 1);
      weatherIndicesForSession[i] = Math.floor(rand());
    }

    // if we have less than the number of minimum weather types scheduled
    if (weatherIndicesForSession.length < minWeatherTypes) {

      // increase the size of the weather for sessions so it has at least min weather types
      const timesToDupeArray = Math.ceil(minWeatherTypes / weatherIndicesForSession.length);
      // hold our original array's length
      const originalArrLength = weatherIndicesForSession.length;

      var j = 0;
      var dupeIterations = 0;
      for (var i = (originalArrLength - 1); i < (originalArrLength * timesToDupeArray); i++) {
        // if we have one rider pick a random number, otherwise try to get a 'random' number that all clients will share
        var rand = mulberry32SeedFromInterval((mx.get_rider_number(r[j].slot) * 1234) * (dupeIterations + 1) / r.length, 0, weatherTypesArr.length - 1);
        weatherIndicesForSession[i] = Math.floor(rand());
        // if we reached the end of the running order reset j and increment the number of times we've duped the array
        j++;
        if (j == originalArrLength) {
          dupeIterations++;
          j = 0;
        }
      }
    }
    mx.message("First weather type: " + weatherTypesArr[weatherIndicesForSession[0]]);
    mx.message("Weather Types for Session: [");
    for (var i = 0; i < weatherIndicesForSession.length; i++) {
      mx.message("    " + weatherTypesArr[weatherIndicesForSession[i]] + ",");
    }
    mx.message("]");
    initializedWeatherForSession = true;
  }

  // Return the first weather index if the gate hasn't dropped
  if (!gateDropped) {
    if (weatherTypeIndex != -1) {
      durationOfWeatherType = 0;
      timeWeatherStarted = 0;
      weatherTypeIndex = -1;
    }
    // if we want to return the index instead of the weather type return the index
    if (returnIndex === true) {
      return 0;
    }
    return weatherTypesArr[weatherIndicesForSession[0]];
  }
  
  var weatherTimeLeft = durationOfWeatherType - (seconds - (timeWeatherStarted + gateDropTime));

  if (weatherTimeLeft <= 0) {
    if (!changeCurrentWeather) {
      var retIndex = weatherTypeIndex + 1;
      var returnIterations = iterationThroughWeatherIndices;
      if (retIndex == weatherIndicesForSession.length) {
        retIndex = 0;
        returnIterations++;
      }

      // if we want to return the index instead of the weather type return the index
      if (returnIndex === true) {
        return retIndex + (returnIterations * weatherIndicesForSession.length);
      }
      return weatherTypesArr[weatherIndicesForSession[retIndex]];
    }

    weatherTypeIndex++;
    // if we reach the end of the weather array, reset the index to the beginning
    if (weatherTypeIndex == weatherIndicesForSession.length) {
      weatherTypeIndex = 0;
      iterationThroughWeatherIndices++;
    }
    
    // Convert the weather type index to terms of lengths for the duration and times arrays
    var index = weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length);
    if (index == weatherDurations.length) {
      var seed = (gateDropTime * 1000) >> 3;
      var timeStarted = 0;
      if (index > 0) {
        timeStarted = weatherDurations[index - 1] + timesWeatherStarted[index - 1];
        seed = timeStarted * 12345;
      }
      // Pick a weather duration seeded by the time if we don't have one already gotten
      var rand = mulberry32SeedFromInterval(seed, 60, 90);
      weatherDurations.push(rand());
      // set the time that the new weather started, this and weatherDurations will have a 1:1 correlation
      timesWeatherStarted.push(timeStarted);
      mx.message("Weather Durations: " + weatherDurations.toString());
      mx.message("Times Started: " + timesWeatherStarted.toString());
    }
    // Get the index of our durations and times started and store the current duration and time started
    durationOfWeatherType = weatherDurations[index];
    timeWeatherStarted = timesWeatherStarted[index];
    mx.message("weather type changed to: " + weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]]);
    mx.message("duration of new weather: " + timeToString(durationOfWeatherType) + "s");
    mx.message("time weather started: " + timeToString(timeWeatherStarted));

    if (index > 0) {
      // get the current and previous weather types
      var currentWeather = weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]];
      var prevWeatherIndex = weatherTypeIndex - 1;
      if (prevWeatherIndex < 0) {
        prevWeatherIndex = weatherIndicesForSession.length - 1;
      }
      prevWeather = weatherTypesArr[weatherIndicesForSession[prevWeatherIndex]];
      // if the next weather is not thunder and the previous weather cycle did have thunder increment the current lightning cycle
      if (prevWeather.includes("thunder") && !currentWeather.includes("thunder")) {
        // only add the total if this lightning cycle is undefined
        if (totalLightningStrikesInCycle[currentLightningCycle] === undefined) {
          totalLightningStrikesInCycle.push(lightningStrikesThisThunderCycle);
        }
        // reset the lightning strikes for this thunder cycle
        lightningStrikesThisThunderCycle = 0;
        currentLightningCycle++;
        // mx.message("current lightning cycle: " + currentLightningCycle.toString());
      }
    }
  }

  // if we're in a demo and we went behind the time that the weather started we need to go back to the previous weather type and duration
  if (seconds < (timeWeatherStarted + gateDropTime)) {
    if (!changeCurrentWeather) {
      var retIndex = weatherTypeIndex - 1;
      var returnIterations = iterationThroughWeatherIndices;
      if (retIndex == -1) {
        retIndex = weatherIndicesForSession.length - 1;
        returnIterations--;
      }

      // if we want to return the index instead of the weather type return the index
      if (returnIndex === true) {
        return retIndex + (returnIterations * weatherIndicesForSession.length);
      }
      return weatherTypesArr[weatherIndicesForSession[retIndex]];
    }
    
    // Decrement the index
    weatherTypeIndex--;
    // If we were at the beginning set it to the top of the weather indices and go back in an iteration
    if (weatherTypeIndex == -1) {
      weatherTypeIndex = weatherIndicesForSession.length - 1;
      iterationThroughWeatherIndices--;
    }

    // Convert the weather type index to terms of lengths for the duration and times arrays
    var index = weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length);
    
    // if the previous weather cycle included thunder and the current one did not decrement the lightning cycle index
    
    if (index > 0) {
      var prevWeather = weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]];
      var currentWeatherIndex = weatherTypeIndex + 1;
      if (currentWeatherIndex == weatherIndicesForSession.length) {
        currentWeatherIndex = 0;
      }
      var currentWeather = weatherTypesArr[weatherIndicesForSession[currentWeatherIndex]];

      // if the previous weather has thunder and the current does not then do work
      if (prevWeather.includes("thunder") && !currentWeather.includes("thunder")) {
        // decrement the current lightning cycle and pop the last element of total lightning strikes in cycle
        currentLightningCycle--;
  
        // get the total lightning strikes in the previous cycle then remove it from the array
        lightningStrikesThisThunderCycle = totalLightningStrikesInCycle[currentLightningCycle];
  
        // get the previous time of lightning strike, reset the delay for another lighting, and set got time of lightning to true
        timeLightningStrike = allLightningStrikeTimes[allLightningStrikeTimes.length - 1];
        delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
        // mx.message("current lightning cycle: " + currentLightningCycle.toString());
      }
    }

    durationOfWeatherType = weatherDurations[index];
    timeWeatherStarted = timesWeatherStarted[index];

    mx.message("weather type changed to: " + weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]]);
    mx.message("duration of new weather: " + timeToString(durationOfWeatherType) + "s");
    mx.message("time weather started: " + timeToString(timeWeatherStarted));
  }

  // if we want to return the index instead of the weather type return the index
  if (returnIndex === true) {
    return weatherTypeIndex + (iterationThroughWeatherIndices * weatherIndicesForSession.length);
  }

  return weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]];
}

function convertIndexToWeatherType(index) {
  var convertedWeatherTypeIndex = index - (iterationThroughWeatherIndices * weatherIndicesForSession.length);
  return weatherTypesArr[weatherIndicesForSession[convertedWeatherTypeIndex]];
}

var currentRainSoundIndex = 0;
var isRaining = false;
var currentRainType;
// Hold the previous rain type so we can still move the position
var prevRainType;
var prevRainSoundIndex;

// FADE IN VARIABLES
var rainCurrentFadeInVolume = 0;
var rainTargetFadeInVolume;
const rainFadeInTime = 15; // in seconds
var rainFadeInVolPerSec;

// FADE OUT VARIABLES
var rainCurrentFadeOutVolume;
var rainStartFadeOutVolume;
// ## Target Fade Out is Constant 0 ##
const rainFadeOutTime = 15; // in seconds
var rainFadeOutVolPerSec;

// Hold the time at which we start a fade
var timeRainFadeStarted;

// booleans to hold fade values
var rainFadeHappening = false;
var rainFadeInDone = true;
var rainFadeOutDone = true;

function doRain(seconds) {
  if (currentWeatherType === undefined) return;

  // If the current weather is no rain or clear and it's raining
  if ((currentWeatherType.includes("no-rain") || currentWeatherType.includes("clear")) && isRaining) {

    // set the fade out start volume as the current rain types volume
    rainStartFadeOutVolume = currentRainType.vol;
    rainFadeOutVolPerSec = (0 - rainStartFadeOutVolume) / rainFadeOutTime;

    // previous rain type and sound index
    prevRainType = currentRainType;
    prevRainSoundIndex = currentRainSoundIndex;

    // Reinitialize rain type and index
    currentRainType = undefined;
    currentRainSoundIndex = undefined;

    isRaining = false;

    // If we are currently already in a fade cancel it and return
    if (rainFadeHappening) {
      cancelFade();
      return;
    }

    // set the time we're starting the fade in
    timeRainFadeStarted = seconds;

    // say that we're fading, and that the fade out is not done
    rainFadeHappening = true;
    rainFadeOutDone = false;
  }
  // If the current weather is rain and it is not raining
  else if (!isRaining && !currentWeatherType.includes("no-rain") && !currentWeatherType.includes("clear")) {
    // set the current rain sound as a random number between the indices at which the sounds are present in rain sounds
    currentRainType = setRainTypeByWeatherType(currentWeatherType);
    if (currentRainType == undefined) {
      mx.message("Error: Weather type Unrecognized");
      isRaining = true;
      return;
    }
    
    startRainSounds(currentRainType.sounds, seconds);

    prevRainType = undefined;
    prevRainSoundIndex = undefined;
  
    // set the rain fade in type, get the volume we're fading into
    rainCurrentFadeInVolume = 0;
    rainTargetFadeInVolume = currentRainType.vol;
    rainFadeInVolPerSec = (rainTargetFadeInVolume - rainCurrentFadeInVolume) / rainFadeInTime;

    isRaining = true;

    // If we are currently already in a fade cancel it and return
    if (rainFadeHappening) {
      cancelFade();
      return;
    }
    
    // get time we're starting the fade
    timeRainFadeStarted = seconds;
    // say that we're fading, and that the fade in is not done
    rainFadeHappening = true;
    rainFadeInDone = false;
  }

  if (isRaining) {
    // if we changed rain types
    var newRainIndex = checkForRainChange(currentWeatherType, currentRainType);
    if (newRainIndex !== -1) {
      changeRainType(rainTypes[newRainIndex], seconds);
    }

    // if it's raining we update the current rain sound position
    moveRainPosition(currentRainType, currentRainSoundIndex);
    
    // If there's not a fade happening we will need to move the rain billboards, if there is
    // we handle the moving in the fading section
    if (!rainFadeHappening) {
      moveRainBillboards(currentRainType, 1);
    }
  }

  if (rainFadeHappening) {
    // store time since fade started
    var t = seconds - timeRainFadeStarted;
    // If we go back in a demo between a fade we must reset
    if (t < 0) {
      cancelFade();
      return;
    }
    if (!rainFadeInDone) {
      // Calculate the current volume and set it
      // if the weather type index is -1 it's the start of the session so just instantly set volume and opacity
      rainCurrentFadeInVolume = (weatherTypeIndex != -1) ? (rainFadeInVolPerSec * t) : rainTargetFadeInVolume;

      setRainSoundVolume(currentRainType, currentRainSoundIndex, rainCurrentFadeInVolume);

      // Fade in rain animation
      var currentOpacity = (weatherTypeIndex != -1) ? (1 / rainFadeInTime * t) : 1;

      if (currentOpacity >= 0 && currentOpacity <= 1) {
        moveRainBillboards(currentRainType, currentOpacity);
      }
      
      // If our current volume is greater than or equal to the target volume and we've reached opacity
      if (rainCurrentFadeInVolume >= rainTargetFadeInVolume && currentOpacity >= 1) {
        // set the sound to the target volume just in case for demos
        setRainSoundVolume(currentRainType, currentRainSoundIndex, rainTargetFadeInVolume);

        // We're done with these variables, leave them undefined
        rainCurrentFadeInVolume = undefined;
        rainTargetFadeInVolume = undefined;
        rainFadeInVolPerSec = undefined;

        // We're done fading in
        rainFadeInDone = true;
      }
    }
    if (!rainFadeOutDone) {
      // If we have a fade out rain we still need to move it's position
      moveRainPosition(prevRainType, prevRainSoundIndex);

      // Calculate the current volume and set it
      rainCurrentFadeOutVolume = rainStartFadeOutVolume + (rainFadeOutVolPerSec * t);
      setRainSoundVolume(prevRainType, prevRainSoundIndex, rainCurrentFadeOutVolume);

      // Fade out rain animation
      var currentOpacity = 1 - (1 / rainFadeOutTime * t);
      if (currentOpacity >= 0 && currentOpacity <= 1) {
        moveRainBillboards(prevRainType, currentOpacity);
      }
      
      // If we've reached less than or equal to zero
      if (rainCurrentFadeOutVolume <= 0 && currentOpacity <= 0) {
        // set the sound to the target volume just in case for demos
        setRainSoundVolume(prevRainType, prevRainSoundIndex, 0);

        // Stop the sound
        stopRainSound(prevRainType, prevRainSoundIndex);

        // We're done with these variables for now, leave them undefined
        rainCurrentFadeOutVolume = undefined;
        rainStartFadeOutVolume = undefined;
        rainFadeOutVolPerSec = undefined;

        // We're done fading out
        rainFadeOutDone = true;
      }
    }
    if (rainFadeInDone && rainFadeOutDone) rainFadeHappening = false;
  }
}

function cancelFade() {
  rainFadeHappening = false;
  rainFadeInDone = true;
  rainFadeOutDone = true;
  if (currentRainType != undefined) {
    var vol = currentRainType.vol;
    setRainSoundVolume(currentRainType, currentRainSoundIndex, vol);
    moveRainBillboards(currentRainType, 1);
  }

  // Hide all the billboards and mute all rain sounds except the current rain just in case we're catching up on multiple weather cycles
  muteAllRainSounds(currentRainType);
  hideAllRainBillboards(currentRainType);
}

function changeRainType(newRainType, seconds) {

  // set the fade out volume before resetting the current rain type
  rainStartFadeOutVolume = currentRainType.vol;

  // set the previous rain type, and the previous rain sound index
  prevRainType = currentRainType;
  prevRainSoundIndex = currentRainSoundIndex;

  // reset rain type
  currentRainType = newRainType;

  // If we are currently already in a fade cancel it
  if (rainFadeHappening) {
    cancelFade();
  }
  
  // start a new rain sound for preparation of fading in
  startRainSounds(currentRainType.sounds, seconds);

  // set the fade in volume
  rainTargetFadeInVolume = currentRainType.vol;

  // initialize current fade volume and vol/sec variables
  rainCurrentFadeInVolume = 0;
  rainFadeInVolPerSec = rainTargetFadeInVolume / rainFadeInTime;
  rainFadeOutVolPerSec = (0 - rainStartFadeOutVolume) / rainFadeOutTime;

  // get time fade starting
  timeRainFadeStarted = seconds;

  rainFadeHappening = true;
  rainFadeInDone = false;
  rainFadeOutDone = false;
}

function startRainSounds(soundsArr, seconds) {
  var rand = mulberry32SeedFromInterval(seconds * 100, 0, soundsArr.length - 1);
  currentRainSoundIndex = Math.floor(rand());

  // initialize sound volume to zero and start it for the fade
  mx.set_sound_vol(soundsArr[currentRainSoundIndex], 0);
  mx.start_sound(soundsArr[currentRainSoundIndex]);
}

function setRainSoundVolume(rainType, index, vol) {
  mx.set_sound_vol(rainType.sounds[index], vol);
}

function muteAllRainSounds(rainType) {
  for (var i = 0; i < rainTypes.length; i++) {
    if (rainType === rainTypes[i]) continue;
    // mute all rain sounds except for the current rain type
    rainTypes[i].sounds.forEach(function(soundIndex){mx.set_sound_vol(soundIndex, 0)});
  }
}

function hideAllRainBillboards(rainType) {
  for (var i = 0; i < rainTypes.length; i++) {
    if (rainType == rainTypes[i]) continue;
    // hide all rain billboards except for the current rain type
    hideRainBillboards(rainTypes[i]);
  }
}

function stopRainSound(type, index) {
  mx.stop_sound(type.sounds[index]);
}

function moveRainPosition(type, index) {
  mx.set_sound_pos(type.sounds[index], pos[0], pos[1], pos[2]);
}

const grid = {
  size: 45, // How many feet between grid points
  count: 9, // How many grid points along each edge
  get area() {return this.count * this.count;}
};

var isEnoughBillboards = true;
for (var i = 0; i < rainTypes.length; i++) {
  if (!checkEnoughBillboards(rainTypes[i])) {
    isEnoughBillboards = false;
    break;
  }
}

if (isEnoughBillboards) {
  // hide every billboard
  hideAllRainBillboards(undefined);
  for (var i = 0; i < grid.area; i++) {
    for (j = 0; j < rainTypes.length; j++) {
      rainTypes[j].billboardArr.push({x: -1, y: -1, z: -1, alpha: -1});
    }
  }
}
function checkEnoughBillboards(type) {
  if (type.indexStart > -1) {
    var lastIndexFound = type.indexStart;
    var numRainBillboards = 1;
    isEnoughBillboards = true;
    for (var i = type.indexStart + 1; lastIndexFound == i - 1; i++) {
      lastIndexFound = mx.find_billboard(type.texture, i);
      if (lastIndexFound == -1) break;
      numRainBillboards++;
    }
  
    if (numRainBillboards < grid.area) {
      mx.message("Error...not enough rain sequence billboards in a row in billboards file | Missing Billboards: " + (grid.area - numRainBillboards).toString());
      return false;
    }
  
    if (numRainBillboards > grid.area) {
      mx.message("Warning...too many rain billboards | Excess billboards: " + (numRainBillboards - grid.area).toString());
    }
    return true;
  }
}

// takes the x and z coordinates and checks to see if the point is within a no-rain spot
function isBillboardInNoRainSpot(x, z) {
  for (var i = 0; i < noRainSpots.length; i++) {
    if (isPointInPolygon([x,z], noRainSpots[i].vertices)) {
      return i;
    }
  }
  return -1;
}

const rainBillboardMaxHeight = 80;

function moveRainBillboards(type, alphaStart) {
  if (!isEnoughBillboards) return;
  for (var z = 0; z < grid.count; z++) {
  	for (var x = 0; x < grid.count; x++) {
      var camx = pos[0], camy = pos[1], camz = pos[2];
  		var billboard_x = Math.floor((camx / grid.size) - (grid.count / 2.0) + 0.5 + x) * grid.size;
  		var billboard_z = Math.floor((camz / grid.size) - (grid.count / 2.0) + 0.5 + z) * grid.size;

      // probably a good idea to fade out to hide popping
  		var dx = billboard_x - camx;
  		var dz = billboard_z - camz;
  		var alpha = alphaStart - (Math.sqrt(dx * dx + dz * dz) / (grid.size * grid.count / 2));
      if (alpha > 1) alpha = 1;
      if (alpha < 0) alpha = 0;

      var index = x + z * grid.count;
      
      // Change the alpha of the rain billboards if we have a new alpha level
      if (type.billboardArr[index].alpha != alpha) {
        type.billboardArr[index].alpha = alpha;
        mx.color_billboard(type.indexStart + index, 1, 1, 1, type.billboardArr[index].alpha);
      }

      var billboardNoRainIndex = isBillboardInNoRainSpot(billboard_x, billboard_z);

      var camHeightAboveTerrain = camy - mx.get_elevation(camx, camz);
      var moveY = false;
      
      if (camHeightAboveTerrain <= (rainBillboardMaxHeight / 2)) {
        // move the billboard if it's in a no rain spot to the desired height
        if (billboardNoRainIndex > -1 && type.billboardArr[index].y !== noRainSpots[billboardNoRainIndex].billboardHeight) {
          type.billboardArr[index].y = noRainSpots[billboardNoRainIndex].billboardHeight;
          //mx.message(colors.yellow + "NO RAIN BILLBOARD: ["+type.billboardArr[index].x.toString() + ", " + type.billboardArr[index].y.toString() + ", " + type.billboardArr[index].z.toString()+"]" + colors.normal);
          moveY = true;
        }
        // otherwise if it's not in a no rain spot and the y level isn't zero set to zero
        else if (billboardNoRainIndex === -1 && type.billboardArr[index].y !== 0) {
          type.billboardArr[index].y = 0;
          moveY = true;
        }
      }

      /* Put the billboard Y level so it's centered in the middle of the billboard,
      so the billboard height is camheight - rainBillboardMaxHeight / 2 */

      if (camHeightAboveTerrain > rainBillboardMaxHeight / 2) {
        var newHeight = camHeightAboveTerrain - (rainBillboardMaxHeight / 2);
        
        // if the billboard is in a no rain spot
        if (billboardNoRainIndex > -1) {
          const noRainHeight = noRainSpots[billboardNoRainIndex].billboardHeight;
          // if the no rain spot desired height is above the new height set it
          if (newHeight < noRainHeight && type.billboardArr[index].y !== noRainHeight) {
            type.billboardArr[index].y = noRainHeight;
            moveY = true;
          } 
          // otherwise if the new height is greater than the no rain height set the billboard to the new height
          else if (newHeight > noRainHeight && type.billboardArr[index].y !== newHeight) {
            type.billboardArr[index].y = newHeight;
            moveY = true;
          }
        }
        // if the billboard is not in a no rain spot and the y value of the billboard isn't the new height set it
        else if (type.billboardArr[index].y !== newHeight) {
          type.billboardArr[index].y = newHeight;
          moveY = true;
        }
      }

      // If we need to move the grid point
      if (type.billboardArr[index].x != billboard_x || type.billboardArr[index].z != billboard_z || moveY) {
        type.billboardArr[index].x = billboard_x;
        type.billboardArr[index].z = billboard_z;
        mx.move_billboard(type.indexStart + index, type.billboardArr[index].x, type.billboardArr[index].y, type.billboardArr[index].z);
      }
      
  	}
  }
}

function hideRainBillboards(rainobj) {
  for (var i = rainobj.indexStart; i < rainobj.indexStart + grid.area; i++) {
    mx.color_billboard(i, 1, 1, 1, 0);
  }
}

function getGateDropTime(seconds) {
  if (seconds < gateDropTime && gateDropped) gateDropped = false;
  if (gateDropped) return;

  gateDropTime = mx.get_gate_drop_time();
  if (gateDropTime > 0) {
    gateDropped = true;
    fillSmiteList();
    if (smiteList.length == 0) canSmite = false;
    var rand = mulberry32SeedFromInterval((gateDropTime * 1000) >> 3, 10, 20);
    timeToSmite = rand() + gateDropTime;
  }
}

function frameHandler(seconds) {
  globalRunningOrder = mx.get_running_order();

  getGateDropTime(seconds);
  updateCamPosition();
  if (currentWeatherType === undefined) {
    currentWeatherType = getWeatherType(seconds);
  }
  try {
    doThunderAndLightning(seconds);
  }
  catch (e) {
    mx.message("lightning error: " + e.toString());
  }
  try {
    doRain(seconds);
  }
  catch (e) {
    mx.message("rain error: " + e.toString());
  }

  frameHandlerPrev(seconds);
}

var frameHandlerPrev = mx.frame_handler;
mx.frame_handler = frameHandler;

function getDistance3D(x1,y1,z1,x2,y2,z2) {return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));}

function mulberry32SeedFromInterval(a, min, max) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    var num = ((t ^ t >>> 14) >>> 0) / 4294967296;
    return (num * (max - min)) + min;
  }
}
// converts raw seconds to formatted time
function timeToString(t) {
  var s;

  t = breakTime(t);

  s = leftFillString(t.min.toString(), " ", 0) + ":";
  s += leftFillString(t.sec.toString(), "0", 2) + ".";
  s += leftFillString(t.ms.toString(), "0", 3);

  return s;
}
function breakTime(t) {
  var min, sec, ms;

  ms = Math.floor(t * 1000.0);
  sec = Math.floor(ms / 1000);
  min = Math.floor(sec / 60);

  ms -= sec * 1000;
  sec -= min * 60;

  return { min: min, sec: sec, ms: ms };
}

function leftFillString(s, pad, n) {
   n -= s.length;

  while (n > 0) {
    if (n & 1)
      s = pad + s;
    
    n >>= 1;
    pad += pad;
  }

  return s;
}
