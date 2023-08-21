/*
--------------
  Track Info
--------------
The trackInfo object is an object that holds the following properties:
  folderDir: the folder name of the current track with an @ symbol before to direct the API to the correct folder
  terrain_size: the terrain.png dimensions
  terrain_scale: the scale specified in the terrain.hf file
  dimensions: holds the track map dimensions by calculating the terrain size times the terrain scale
  center: gets the center coordinate of the dimensions of the map
*/

const trackInfo = {
  folderDir: "@tracktitanwet",
  terrain_size: 2049,
  terrain_scale: 1,
  get dimensions() {return (this.terrain_size - 1) * this.terrain_scale;},
  get center() {return this.dimensions / 2;}
};

/*
---------------
 No Rain Spots
---------------
Description - an array of objects with the following properties:
  vertices: holds the vertices of an imaginary polygon, the last vertex will 'draw' an edge to the first vertex
  billboardHeight: specifies the desired height to move a rain billboard if within the polygon

Function - if a rain billboard is in a no rain spot specified by the vertices, move the
billboard to at least a height specified by the billboardHeight property. If a rain billboard
overlays two no rain spots it will prioritize the first no rain spot.
*/
const noRainSpots = [
  {
    vertices: [[0,0],[290,0],[197,195],[0,250]],
    billboardHeight: 100
  },
];

/*
-------------------------
  Lightning/Rain Sounds
-------------------------
Each rain/lightning sound type will have:
  - An array of directories for the corresponding sounds
  - An array of frequencies for the corresponding sounds
*/

const lightRainSoundDirectories = [
  trackInfo.folderDir + "/sounds/weather/rain/lightrain.raw"
];
const lightRainSoundFreqs = [44100];

const medRainSoundDirectories = [
  trackInfo.folderDir + "/sounds/weather/rain/rain.raw"
];
const medRainSoundFreqs = [44100];

const heavyRainSoundDirectories = [
  trackInfo.folderDir + "/sounds/weather/rain/heavyrain.raw"
];
const heavyRainSoundFreqs = [44100];

// Distant ambient thunder sounds
const lightThunderDirectories = [
  trackInfo.folderDir + "/sounds/weather/distant-thunder/distant-thunder1.raw",
  trackInfo.folderDir + "/sounds/weather/distant-thunder/distant-thunder2.raw",
  trackInfo.folderDir + "/sounds/weather/distant-thunder/distant-thunder3.raw",
  trackInfo.folderDir + "/sounds/weather/distant-thunder/distant-thunder4.raw",
  trackInfo.folderDir + "/sounds/weather/distant-thunder/distant-thunder5.raw",
];
const lightThunderSoundFreqs = [44100,44100,44100,44100,44100];

// Basic thunder sounds
const medThunderDirectories = [
  trackInfo.folderDir + "/sounds/weather/thunder/thunder1.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder2.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder3.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder4.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder5.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder6.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder7.raw",
  trackInfo.folderDir + "/sounds/weather/thunder/thunder8.raw",
];
const medThunderSoundFreqs = [44100,44100,44100,44100,44100,44100,44100,44100];

// Heavy thunder sounds
const heavyThunderDirectories = [
  trackInfo.folderDir + "/sounds/weather/heavy-thunder/heavy-thunder1.raw",
  trackInfo.folderDir + "/sounds/weather/heavy-thunder/heavy-thunder2.raw",
  trackInfo.folderDir + "/sounds/weather/heavy-thunder/heavy-thunder3.raw",
  trackInfo.folderDir + "/sounds/weather/heavy-thunder/heavy-thunder4.raw",
  trackInfo.folderDir + "/sounds/weather/heavy-thunder/heavy-thunder5.raw",
];
const heavyThunderSoundFreqs = [44100,44100,44100,44100,44100];

/*
--------------
 Rain Objects
--------------
Each rain type will have an object with the following propeties:
  rainName: acts as an identifier for the weather type to point to this rain type
  vol: maximum volume of the rain sounds
  texture: the texture of the sequence file of rain
  size: holds the size for each rain billboard
  aspect: holds the aspect ratio for each rain billboard
  maxBillboardHeight: the maximum height of the billboard in feet before the it starts following the camera
  sounds: the respective rain sounds (leave empty)
  sounddirs: the sound directories for the desired rain type
  freqs: the sound frequencies for the desired rain type
  billboardArr: holds a list of objects that store each billboards [x,y,z] position, alpha, and billboard index
  gridsize: how many feet are in between each grid point (feet between each rain billboard)
  gridcount: how many grid points along each edge (how many rain billboards)
  gridarea: the total count of grid points (total rain billboard count)
*/

function RainType(rainName, vol, texture, size, aspect, maxBillboardHeight, sounddirs, freqs, gridsize, gridcount) {
  this.rainName = rainName;
  this.vol = vol;
  this.texture = texture;
  this.size = size;
  this.aspect = aspect;
  this.maxBillboardHeight = maxBillboardHeight;
  this.sounds = [];
  this.sounddirs = sounddirs;
  this.freqs = freqs;
  this.billboardArr = [];
  this.gridsize = gridsize;
  this.gridcount = gridcount;
  this.gridarea = gridcount * gridcount;
}

var lightRain = new RainType("light-rain", 1, trackInfo.folderDir + "/billboard/rain/light-rain/lightrain.seq", 80, 1, 80, lightRainSoundDirectories, lightRainSoundFreqs, 45, 9);
var mediumRain = new RainType("med-rain", 2, trackInfo.folderDir + "/billboard/rain/med-rain/medrain.seq", 80, 1, 80, medRainSoundDirectories, medRainSoundFreqs, 45, 9);
var heavyRain = new RainType("heavy-rain", 4, trackInfo.folderDir + "/billboard/rain/heavy-rain/heavyrain.seq", 80, 1, 80, heavyRainSoundDirectories, heavyRainSoundFreqs, 45, 9);

const rainTypes = [
  lightRain,
  mediumRain,
  heavyRain
];

/* 
-----------------
 Thunder Objects
-----------------
Each thunder type will have an object with the following properties:
  name: acts as an identifier for the weather type to point to this thunder type
  sounds: an array of sound indices for the desired thunder type
  sounddirs: an array of sound directories for the desired thunder type
  freqs: an array of sound frequencies for the desired thunder type
  interval: a 2 element array of intervals between lightning strikes in seconds during this thunder type 
*/

function ThunderType(thunderName, sounddirs, freqs, interval) {
  this.thunderName = thunderName;
  this.sounds = [];
  this.sounddirs = sounddirs;
  this.freqs = freqs;
  this.interval = interval;
}

var lightThunder = new ThunderType("light-thunder", lightThunderDirectories, lightThunderSoundFreqs, [10,60]);
var mediumThunder = new ThunderType("med-thunder", medThunderDirectories, medThunderSoundFreqs, [7,30]);
var heavyThunder = new ThunderType("heavy-thunder", heavyThunderDirectories, heavyThunderSoundFreqs, [3,15]);

const thunderTypes = [
  lightThunder,
  mediumThunder,
  heavyThunder
];

addWeatherSounds();

var currentLightningIndex; // Holds the current index of the lightning texture we will be using
var lightningSize; // Holds the current lightning billboard size
var lightningBillboardIndices; // Holds the lightning billboard indices
const lightningTextureDirectory = trackInfo.folderDir + "/billboard/lightning/"; // the base lightning directory

/* 
---------------------
 Lightning Textures
---------------------
Each lightning texture will be an object with the following properties:
  texture: the texture directory string
  aspect: the aspect ratio of the lightning billboard
  delay: the delays between frames in 1/128 second units of the lightning sequence file (3rd number in header of sequence file)
  framecount: the total number of frames for the lightning sequence file (1st number in header of sequence file)
  sizeRange: a range of values for which the lightning billboard size should be if it strikes inside the map (this will be multiplied by a factor of 2.5 if outside the map)
  textureID: the texture ID from game so we can trigger the lightning animation
  index: the billboard index for the lightning (initialized to undefined then set when adding the billboards)
*/

function LightningTexture(textureDirectory, aspect, delay, framecount, sizeRange) {
  this.texture = textureDirectory;
  this.aspect = aspect;
  this.delay = delay;
  this.framecount = framecount;
  this.sizeRange = sizeRange;
  this.textureID = mx.read_texture(textureDirectory);
  this.index = undefined;
}

var lightningTexture1 = new LightningTexture(lightningTextureDirectory + "tex1/lightning1.seq", 1, 3, 14, [350, 500]);
var lightningTexture1Mirrored = new LightningTexture(lightningTextureDirectory + "tex1mirrored/lightning1mirrored.seq", 1, 3, 14, [350, 500]);
var lightningTexture2 = new LightningTexture(lightningTextureDirectory + "tex2/lightning2.seq", 1, 3, 15, [350, 500]);
var lightningTexture2Mirrored = new LightningTexture(lightningTextureDirectory + "tex2mirrored/lightning2mirrored.seq", 1, 3, 15, [350, 500]);

const lightningTextures = [
  lightningTexture1,
  lightningTexture1Mirrored,
  lightningTexture2,
  lightningTexture2Mirrored
];

addLightningBillboards();

/*
======================================================================================
Choose which weather types you'd like on you map and throw them into the weather types
array and make sure they're separated by commas and are strings. Add multiples of the
same weather type if you want to increase the odds of that weather type being chosen.

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 List of available weather types
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

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

======================================================================================
*/

const weatherTypesArr = [
  "clear", "light-rain", "med-rain", "heavy-rain",
  "light-thunder-no-rain", "light-thunder-light-rain", "light-thunder-med-rain", "light-thunder-heavy-rain",
  "med-thunder-no-rain", "med-thunder-light-rain", "med-thunder-med-rain", "med-thunder-heavy-rain",
  "heavy-thunder-med-rain", "heavy-thunder-heavy-rain"
];

/*
-------------
  Constants
-------------
Below are constants you may want to change:

minWeatherTypes: the minimum amount of weather types to go through before cycling back to the first weather type
baseThunderVolume: the base volume value at a thunder sound 4 seconds after a lightning strike
mapScalarForLightning: value multiplied by the size of the map, the bounds for lightning strikes. Ex: 1 would mean lightning can only strike inside themap
rainFadeInTime: the amount of time it takes in seconds for a new rain type to fade to full opacity and volume
rainFadeOutTime: the amount of time it takes in seconds for a previous rain type to fade out to 0 opacity and mute.
*/

const minWeatherTypes = 15;
const baseThunderVolume = 5;
const mapScalarForLightning = 3;
const rainFadeInTime = 15;
const rainFadeOutTime = 15;

/*
--------------------------------------------
  Death Screen Properties for Smiting List
--------------------------------------------
The death screen properties object is an object that will hold all the necessities for what happens
to a client should they be struck by lightning. The properties include:
  bbsize: billboard size
  bbtexture: billboard texture directory
  bbaspect: billboard aspect ratio
  sounddir: sound directory
  soundfreq: sound frequency
  soundvol: sound volume
*/
const deathScreenProperties = {
  bbsize: 7,
  bbtexture: trackInfo.folderDir + "/billboard/rain/donotworry/obunga.png",
  bbaspect: 1,
  sounddir: trackInfo.folderDir + "/sounds/weather/heavy-thunder/ears.raw",
  soundfreq: 44100,
  soundvol: 10
}

/*
-----------------
 People to Smite
-----------------
The people to smite variable is an array of objects that holds the following properties:
  re: the regular expression for the name of the person to smite
  weight: the weight of chance that person is going to be smited over another person
*/
const peopleToSmite = [
  {re: /\bjosh.*\bgilmore\b/i, weight: 200},
  {re: /\bbrayden.*\btharp\b/i, weight: 200},
];

// ANSI color codes for debugging
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


var lightningBillboardIndicesString = "[";
var lightningTextureIDsString = "[";
for (var i = 0; i < lightningTextures.length; i++) {
  lightningBillboardIndicesString += lightningTextures[i].index.toString() + ',';
  lightningTextureIDsString += lightningTextures[i].textureID.toString() + ',';
}
lightningBillboardIndicesString += "]";
lightningTextureIDsString += "]";

mx.message(colors.cyan + "Lightning Billboard Indices: " + lightningBillboardIndicesString);
mx.message(colors.cyan + "Lightning Texture IDs: " + lightningTextureIDsString);

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
  for (var i = 0; i < vertices.length; i++) {
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

const firstLapLength = mx.firstLapLength;
const normalLapLength = mx.normalLapLength;

var globalRunningOrder;
var gateDropTime;
var gateDropped = false;
const clientSlot = mx.get_player_slot();

// Camera Position Array holds position of camera in 3 element array [x,y,z]
// Camera Rotation Matrix holds rotation of camera in a 3x3 matrix stored as a 9 element array.
var pos = [], rot = [];

var timeToSmite;
var smiteList = [];
var goodbyeTimes = [];

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

var deathBillboard = mx.find_billboard(deathScreenProperties.bbtexture, 0);
if (deathBillboard === -1) {
  deathBillboard = mx.add_billboard(0, 0, 0, deathScreenProperties.bbsize, 1, deathScreenProperties.bbtexture);
} else { // make sure the death billboard is the correct size
  mx.size_billboard(deathBillboard, deathScreenProperties.bbsize);
}
mx.color_billboard(deathBillboard, 1, 1, 1, 0);

function godHaveMercyOnYourSoul(coords) {
  var deathSound = mx.add_sound(deathScreenProperties.sounddir);
  mx.set_sound_freq(deathSound, deathScreenProperties.soundfreq);
  mx.set_sound_pos(deathSound, coords[0], coords[1], coords[2]);
  mx.set_sound_vol(deathSound, deathScreenProperties.soundvol);
  mx.set_sound_loop(deathSound, 1);
  mx.start_sound(deathSound);

  calculateAndMoveDeathScreen();
  mx.color_billboard(deathBillboard, 1, 1, 1, 1);
}

function endGame() {
  while (true) {
    // lmao goodbye
  }
}

function calculateAndMoveDeathScreen() {
  var adjustmentMatrix = [
    -1, 0, 0,
    0, 1, 0,
    0, 0, -1
  ];

  var adjustedRotationMatrix = multiplyOneDimMatrices(adjustmentMatrix, rot);

  // get the forward direction vector of the camera
  var forwardDirectionVector = adjustedRotationMatrix.slice(6);
  const billboardDistanceFromCamera = 2.5; // distance of billboard from the camera

  // calculate the billboard position based on a scalar of the forward direction vector + the current position
  var billboardPosition = forwardDirectionVector.map(function(value, index){return (value * billboardDistanceFromCamera) + pos[index]});

  // set the billboard height so it is even with the height of the bike
  var billboardHeight = billboardPosition[1] - mx.get_elevation(billboardPosition[0], billboardPosition[2]) - (deathScreenProperties.bbsize / 1.5);

  mx.move_billboard(deathBillboard, billboardPosition[0], billboardHeight, billboardPosition[2]);
}

function multiplyOneDimMatrices(a, b) {
  
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

function addWeatherSounds() {
  // Add rain sounds
  for (var i = 0; i < rainTypes.length; i++) {
    addSoundsToArr(rainTypes[i].sounds, rainTypes[i].sounddirs, rainTypes[i].freqs);
    
    // set rain sounds to loop
    for (var j = 0; j < rainTypes[i].sounds.length; j++) {
      mx.set_sound_loop(rainTypes[i].sounds[j], 1);
    }
  }

  // Add thunder sounds
  for (var i = 0; i < thunderTypes.length; i++) {
    addSoundsToArr(thunderTypes[i].sounds, thunderTypes[i].sounddirs, thunderTypes[i].freqs);
  }
}

function addSoundsToArr(arr, directory, freqs) {
  for (var i = 0; i < directory.length; i++) {
    arr[i] = mx.add_sound(directory[i]);

    if (freqs[i] === undefined) {
      mx.message(colors.red + "Error: Missing sound frequency value for sound " + directory[i] + colors.normal);
      continue;
    }

    mx.set_sound_freq(arr[i], freqs[i]);
  }
}

function addLightningBillboards() {
  var xoffset = trackInfo.dimensions;
  var zoffset = 10;
  const maxTexturesPerRow = Math.floor(Math.sqrt(lightningTextures.length));
  var texturesInRow = 0;

  for (var i = 0; i < lightningTextures.length; i++) {
    if (texturesInRow === maxTexturesPerRow) {
      zoffset += (lightningTextures[i - 1].sizeRange[0] / 1.5);
      xoffset = trackInfo.dimensions;
    }

    // find the billboard, if it cannot be found, add it
    var billboardIndex = mx.find_billboard(lightningTextures[i].texture, 0);
    if (billboardIndex === -1) {
      billboardIndex = mx.add_billboard(xoffset, 0, zoffset, lightningTextures[i].sizeRange[0], lightningTextures[i].aspect, lightningTextures[i].texture);
      if (billboardIndex === -1) {
        mx.message(colors.red + "Error: Could not add lightning billboard: " + lightningTextureDirectory[i].texture + colors.normal);
        continue;
      }
    } else {
      // if we found the billboard make sure its the correct size and position
      mx.size_billboard(billboardIndex, lightningTextures[i].sizeRange[0]);
      mx.move_billboard(billboardIndex, xoffset, 0, zoffset);
    }

    // hide the billboard
    mx.color_billboard(billboardIndex, 1, 1, 1, 0);

    // set the billboard index
    lightningTextures[i].index = billboardIndex;

    // if there's excess billboards hide them
    billboardIndex = mx.find_billboard(lightningTextures[i].texture, billboardIndex + 1);
    while (billboardIndex !== -1) {
      mx.color_billboard(billboardIndex, 1, 1, 1, 0);
      billboardIndex = mx.find_billboard(lightningTextures[i].texture, billboardIndex + 1);
    }

    xoffset -= (lightningTextures[i].sizeRange[0] / 1.5);
    texturesInRow++;
  }
}

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

// stores camera location into the pos and rot array variables
function updateCamPosition() {
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

// Max and Min Coordinates of x and z where lightning can strike, algorithm keeps original center point constant.
const lightningMapSize = mapScalarForLightning * trackInfo.dimensions;
const minCoords = trackInfo.center - (1/2 * lightningMapSize);
const maxCoords = trackInfo.center + (1/2 * lightningMapSize);

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
  if (seconds < lastThunderUpdateTime + 1.25 || !gateDropped) {
    // if the weathertypeindex is -1 we will still grab it anyways to check if we can switch it to zero
    currentWeatherType = getWeatherType(seconds);
    
    // if we passed into the first weather type and it doesnt include thunder update the last thunder update time
    if (!doesWeatherHaveThunder(currentWeatherType, seconds)) {
      if (weatherTypeIndex > -1) {
        lastThunderUpdateTime = seconds;
      }
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
      mx.message(colors.cyan + "time of lightning strike: " + timeToString(timeLightningStrike - gateDropTime) + colors.normal);
    }
    gotTimeLightning = (timeLightningStrike === undefined) ? false : true;
  }

  // If we are behind the delay for another lightning and we have already gotten a time we're going back in a demo prior to a strike
  if (seconds < allTimesGotLightningStrikes[allTimesGotLightningStrikes.length - 1] && gotTimeLightning && seconds < lastThunderUpdateTime) {
    // stop the lightning animation if we have one
    if (lightningAnimationHappening === true) {
      stopLightningAnimation(currentLightningIndex);
    }

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

      if (clientSlot !== indexToSmite) {
        triggerLightningAnimation();
      }

      // wait at least delay seconds for another lightning strike
      delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
      thunderPending = true;
      gotTimeLightning = false;
      resetGoodbyeList = false;

      rand = mulberry32SeedFromInterval(timeLightningStrike, 120, 360);
      timeToSmite = rand() + timeLightningStrike;
      goodbyeTimes[indexToSmite] = timeLightningStrike + 0.1; // add 0.1 second delay for them to contemplate
      
      // if player slot is the slot to smite, send my regards
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
   
    triggerLightningAnimation();

    // wait at least delay seconds for another lightning strike
    delayForAnotherLightning = timeLightningStrike + maxTimeOfThunderPending;
    thunderPending = true;
    gotTimeLightning = false;
  }

  // constantly update the distance from the origin point and time it'll take to reach
  if (thunderPending) {

    if (indexToSmite > -1) {
      // if it's less than goodbye time move death screen
      if (canSmite && seconds < goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
        calculateAndMoveDeathScreen();
      }
      
      // goodbye
      if (canSmite && seconds >= goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
        endGame();
      }

      if (canSmite && clientSlot == smiteList[indexToSmite].slot) return;

      // move the lightning strike coordinates to match the player
      if (seconds <= goodbyeTimes[indexToSmite]) {
        var slotCoords = mx.get_position(smiteList[indexToSmite].slot);
        lightningCoords.x = slotCoords[0];
        lightningCoords.y = slotCoords[1];
        lightningCoords.z = slotCoords[2];
      }

      // for others
      if (!resetGoodbyeList && seconds > goodbyeTimes[indexToSmite]) {
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
    if (distance <= distanceTraveled) {
      // time it took for the thunder to reach the rider from the lightning origin
      var time = seconds - timeLightningStrike;
      var vol = Math.ceil(baseThunderVolume / (0.25 * time));
  
      mx.message("Thunder sound " + (time.toFixed(3)).toString() + " seconds after lightning!");

      // if it takes less than 1.5 seconds to reach play a heavy thunder sound
      currentThunder = (time < 1.25) ? heavyThunder : (time < 2.5) ? mediumThunder : lightThunder;
      thunderSoundIndex = playThunderSound(currentThunder.sounds, vol, seconds);
      thunderPending = false;
    }
  }
  else if (currentThunder) {
    mx.set_sound_pos(currentThunder.sounds[thunderSoundIndex], pos[0], pos[1], pos[2]);
  }

  lightningAnimation(seconds, currentLightningIndex);
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
    rand = mulberry32SeedFromInterval(timeLightningStrike, 120, 360);
    timeToSmite = rand() + timeLightningStrike; // reset the next time to smite
    goodbyeTimes[indexToSmite] = timeLightningStrike + 0.1; // add 0.1 second delay for game to catch up
    // if player slot is the slot to smite, goodbye ears
    if (clientSlot == smiteList[indexToSmite].slot) {
      godHaveMercyOnYourSoul(slotCoords);
    }
  }

  if (indexToSmite > -1) {
    // if it's less than goodbye time move death screen
    if (canSmite && seconds < goodbyeTimes[indexToSmite] && clientSlot == smiteList[indexToSmite].slot) {
      calculateAndMoveDeathScreen();
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

    // move the lightning strike coordinates to match the player
    if (seconds <= goodbyeTimes[indexToSmite]) {
      var slotCoords = mx.get_position(smiteList[indexToSmite].slot);
      lightningCoords.x = slotCoords[0];
      lightningCoords.y = slotCoords[1];
      lightningCoords.z = slotCoords[2];
    }

    // if the player tabbed out wasn't the one getting smiteds
    if (!resetGoodbyeList && seconds > goodbyeTimes[indexToSmite]) {
      sumOfWeights -= smiteList[indexToSmite].weight;
      smiteList.splice(indexToSmite, 1);
      if (smiteList.length == 0) canSmite = false;
      resetGoodbyeList = true;
      indexToSmite = -1;
    }
  }
}

var lightningAnimationHappening = false;
var lastLightningAnimationUpdate = 0;
var currentLightningFrame = 0;
var timeStartedLightningAnimation = 0;
var lightningHidden = true;
var lightningAnimationProperties = {
  x: 0,
  y: 0,
  z: 0,
  size: 0
}

function lightningAnimation(seconds, currentTextureIndex) {

  if (!lightningAnimationHappening) return;

  var lightingTextureID = lightningTextures[currentTextureIndex].textureID;
  var lightningTextureMaxFrames = lightningTextures[currentTextureIndex].framecount;
  var lightningFrameDelay = lightningTextures[currentTextureIndex].delay;

  // if we go backwards in the demo and we are before the trigger of the lightning we want to hide it
  if (seconds < timeStartedLightningAnimation) {
    stopLightningAnimation(currentTextureIndex);
    return;
  }
  
  if (seconds - lastLightningAnimationUpdate < lightningFrameDelay / mx.tics_per_second && seconds >= lastLightningAnimationUpdate) return;

  // if the animation coordinates do not equal the lightning strike coordinates move it
  if (lightningAnimationProperties.x != lightningCoords.x || lightningAnimationProperties.y != lightningCoords.y || lightningAnimationProperties.z != lightningCoords.z) {
    lightningAnimationProperties.x = lightningCoords.x;
    lightningAnimationProperties.y = lightningCoords.y;
    lightningAnimationProperties.z = lightningCoords.z;

    var billboardIndex = lightningTextures[currentTextureIndex].index;
    mx.move_billboard(billboardIndex, lightningAnimationProperties.x, lightningAnimationProperties.y, lightningAnimationProperties.z);
  }

  // if the animation size does not equal the lightning size set it
  if (lightningAnimationProperties.size != lightningSize) {
    lightningAnimationProperties.size = lightningSize;

    var billboardIndex = lightningTextures[currentTextureIndex].index;
    mx.size_billboard(billboardIndex, lightningAnimationProperties.size);
  }

  if (lightningHidden) {
    toggleLightningTexture(currentTextureIndex, 1);
  }

  lastLightningAnimationUpdate = seconds;

  currentLightningFrame = Math.round((seconds - timeStartedLightningAnimation) / (lightningFrameDelay / mx.tics_per_second));

  if (currentLightningFrame >= lightningTextureMaxFrames) {
    stopLightningAnimation(currentTextureIndex);
    return;
  }

  mx.begin_custom_frame(lightingTextureID);
  mx.paste_custom_frame(lightingTextureID, currentLightningFrame, 0, 0, 0, 0, 1, 1);
  mx.end_custom_frame(lightingTextureID);
}

function toggleLightningTexture(textureIndex, value) {
  var billboardIndex = lightningTextures[textureIndex].index;
  mx.color_billboard(billboardIndex, 1, 1, 1, value);

  lightningHidden = false;
  if (value === 0) {
    lightningHidden = true;
  }
}

function triggerLightningAnimation() {
  lightningHidden = true;
  currentLightningFrame = 0;
  lastLightningAnimationUpdate = 0;
  lightningAnimationHappening = true;
  timeStartedLightningAnimation = timeLightningStrike;

  mx.message("");
  mx.message(colors.yellow + "Lightning Size: " + lightningSize.toString());
  mx.message(colors.yellow + "Lightning Index: " + currentLightningIndex.toString());
}

function stopLightningAnimation(currentTextureIndex) {
  toggleLightningTexture(currentTextureIndex, 0);
  currentLightningFrame = 0;
  lightningAnimationHappening = false;
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

    checkAvailableSmiteTabOut(seconds);
    
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

        checkAvailableSmiteTabOut(seconds);
        
        // get the weather type at the current lightning strike
        currentWeatherType = getWeatherType(timeLightningStrike);
        if (currentWeatherType === undefined) {
          mx.message(colors.red + timeToString(timeLightningStrike) + colors.normal);
        }

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

  try {
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
  } catch (e) {
    mx.message(colors.magenta + "Exception Here 1: " + e.toString() + colors.normal);
  }
  
  return true;
}

function getLightningStrikeIntervals(weatherType) {
  try {
    for (var i = 0; i < thunderTypes.length; i++) {
      if (weatherType.includes(thunderTypes[i].thunderName)) return thunderTypes[i].interval;
    }
  } catch (e) {
    mx.message(colors.cyan + "Exception Here 2: " + e.toString() + colors.normal);
  }

  return undefined;
}

function setLightningStrikeCoords(lightningStrikeTime) {
  // set the lightning texture index
  var rand = mulberry32SeedFromInterval(lightningStrikeTime * 123, 0, lightningTextures.length - 1);
  currentLightningIndex = Math.floor(rand());

  rand = mulberry32SeedFromInterval(lightningStrikeTime * 321, lightningTextures[currentLightningIndex].sizeRange[0], lightningTextures[currentLightningIndex].sizeRange[1]);
  lightningSize = +rand().toFixed(6); // use plus sign to implicitly change the .toFixed() return string back into a number

  rand = mulberry32SeedFromInterval(lightningStrikeTime * 100, minCoords, maxCoords);
  lightningCoords.x = +rand().toFixed(6);

  rand = mulberry32SeedFromInterval(lightningStrikeTime * 1234, minCoords, maxCoords);
  lightningCoords.z = +rand().toFixed(6);

  // check if the lightning strike happens inside the map
  var lightningInsideMap = (lightningCoords.x >= 0 && lightningCoords.z >= 0 && lightningCoords.x <= trackInfo.dimensions && lightningCoords.z <= trackInfo.dimensions) ? true : false;

  if (lightningInsideMap === false) {
    lightningSize *= 2.5;
  }

  // set the initial height to zero
  var groundLevel = 0;

  // if the lightning is inside the map it will be at ground level, otherwise range it between the ground level and the elevation height
  var maxHeight = (lightningInsideMap === true) ? groundLevel : (mx.get_elevation(lightningCoords.x, lightningCoords.z) * 2);

  // Seed the random number with the coordinates of the x and z
  rand = mulberry32SeedFromInterval((lightningCoords.x + lightningCoords.z), groundLevel, maxHeight);
  lightningCoords.y = +rand().toFixed(6);
}

function playThunderSound(arr, vol, seconds) {
  var rand = mulberry32SeedFromInterval(seconds * 12345, 0, arr.length - 1);
  var currentIndex = Math.floor(rand());
  mx.set_sound_pos(arr[currentIndex], pos[0], pos[1], pos[2]);
  mx.set_sound_vol(arr[currentIndex], vol);
  mx.start_sound(arr[currentIndex]);
  return currentIndex;
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
    var seed = (mx.get_rider_number(r[0].slot) * 321);
    for (var i = 0; i < minWeatherTypes; i++) {
      var rand = mulberry32SeedFromInterval(seed, 0, weatherTypesArr.length - 1);
      weatherIndicesForSession.push(Math.floor(rand()));
      seed = (weatherIndicesForSession[weatherIndicesForSession.length - 1] * weatherIndicesForSession.length * 1234);
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

    /* somehow I ran into a bug where the gate dropped and the weather type returned undefined when joining a server on gate drop 
      so I have no idea if this'll fix it or not */
    if (weatherTypeIndex === -1) {
      weatherTypeIndex = 0;
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
      //mx.message("Weather Durations: " + weatherDurations.toString());
      //mx.message("Times Started: " + timesWeatherStarted.toString());
    }
    // Get the index of our durations and times started and store the current duration and time started
    durationOfWeatherType = weatherDurations[index];
    timeWeatherStarted = timesWeatherStarted[index];
    mx.message("weather type changed to: " + weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]]) + " | index: " + weatherTypeIndex.toString();
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
    
    if (index >= 0) {
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
  if (convertedWeatherTypeIndex === weatherIndicesForSession.length) {
    convertedWeatherTypeIndex = 0;
  }
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

var rainFadeInVolPerSec;

// FADE OUT VARIABLES
var rainCurrentFadeOutVolume;
var rainStartFadeOutVolume;
// ## Target Fade Out is Constant 0 ##
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

// add rain billboards then hide each billboard
addRainBillboards();
hideAllRainBillboards(undefined);

function addRainBillboards() {
  
  var zoffset = 10;
  for (var i = 0; i < rainTypes.length; i++) {
    var xoffset = 0;
    var numberBillboards = 0;
    var lastBillboardIndex = -1;
    var rainType = rainTypes[i];

    // find billboards and add if necessary
    do {
      // find the last billboard index that matches the texture
      lastBillboardIndex = mx.find_billboard(rainType.texture, lastBillboardIndex + 1);
      
      // reset x offset and increment the z offset
      if (xoffset === rainType.gridsize * rainType.gridcount) {
        xoffset = 0;
        zoffset += rainType.gridsize;
      }

      // if we couldn't find one add it
      if (lastBillboardIndex === -1) {
        lastBillboardIndex = mx.add_billboard(xoffset, 0, zoffset, rainType.size, rainType.aspect, rainType.texture);
        if (lastBillboardIndex === -1) {
          mx.message(colors.red + "Error: Could not add billboard: " + rainType.texture + colors.normal);
          break;
        }
      } else { // otherwise resize the one we found to make sure it's the correct size and move it
        mx.size_billboard(lastBillboardIndex, rainType.size);
        mx.move_billboard(lastBillboardIndex, xoffset, 0, zoffset);
      }
      numberBillboards++;

      // add billboard object that store location, alpha, and index properties of this billboard
      rainType.billboardArr.push({x: -1, y: -1, z: -1, alpha: -1, index: lastBillboardIndex});

      // increase the offset
      xoffset += rainType.gridsize;

    } while (numberBillboards < rainType.gridarea);

    // if we exited the loop before we could add enough billboards go to next iteration
    if (numberBillboards < rainType.gridarea) {
      continue;
    }

    var billboardIndicesString = colors.green + rainType.rainName + " Billboard Map [";
    for (var j = 0; j < rainType.billboardArr.length; j++) {
      billboardIndicesString += rainType.billboardArr[j].index.toString() + ',';
    }
    billboardIndicesString += "]" + colors.normal;

    mx.message(billboardIndicesString);

    // hide any excess billboards
    do {
      lastBillboardIndex = mx.find_billboard(rainType.texture, lastBillboardIndex + 1);
      mx.color_billboard(lastBillboardIndex, 1, 1, 1, 0);
    } while (lastBillboardIndex !== -1);

    zoffset += rainType.gridsize * 1.5;
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

function moveRainBillboards(rainType, alphaStart) {
  for (var z = 0; z < rainType.gridcount; z++) {
  	for (var x = 0; x < rainType.gridcount; x++) {
      var camx = pos[0], camy = pos[1], camz = pos[2];
  		var billboard_x = Math.floor((camx / rainType.gridsize) - (rainType.gridcount / 2.0) + 0.5 + x) * rainType.gridsize;
  		var billboard_z = Math.floor((camz / rainType.gridsize) - (rainType.gridcount / 2.0) + 0.5 + z) * rainType.gridsize;

      // probably a good idea to fade out to hide popping
  		var dx = billboard_x - camx;
  		var dz = billboard_z - camz;
  		var alpha = alphaStart - (Math.sqrt(dx * dx + dz * dz) / (rainType.gridsize * rainType.gridcount / 2));
      if (alpha > 1) alpha = 1;
      if (alpha < 0) alpha = 0;

      var index = x + z * rainType.gridcount;
      var billboardIndex = rainType.billboardArr[index].index;
      
      // Change the alpha of the rain billboards if we have a new alpha level
      if (rainType.billboardArr[index].alpha != alpha) {
        rainType.billboardArr[index].alpha = alpha;
        mx.color_billboard(billboardIndex, 1, 1, 1, rainType.billboardArr[index].alpha);
      }

      var noRainSpotIndex = isBillboardInNoRainSpot(billboard_x, billboard_z);
      var camHeightAboveTerrain = camy - mx.get_elevation(camx, camz);
      var moveY = false;
      
      if (camHeightAboveTerrain <= (rainType.maxBillboardHeight / 2)) {
        // move the billboard if it's in a no rain spot to the desired height
        if (noRainSpotIndex > -1 && rainType.billboardArr[index].y !== noRainSpots[noRainSpotIndex].billboardHeight) {
          rainType.billboardArr[index].y = noRainSpots[noRainSpotIndex].billboardHeight;
          //mx.message(colors.yellow + "NO RAIN BILLBOARD: ["+rainType.billboardArr[index].x.toString() + ", " + rainType.billboardArr[index].y.toString() + ", " + rainType.billboardArr[index].z.toString()+"]" + colors.normal);
          moveY = true;
        }
        // otherwise if it's not in a no rain spot and the y level isn't zero set to zero
        else if (noRainSpotIndex === -1 && rainType.billboardArr[index].y !== 0) {
          rainType.billboardArr[index].y = 0;
          moveY = true;
        }
      }

      /* Put the billboard Y level so it's centered in the middle of the billboard,
      so the billboard height is camheight - rainType.maxBillboardHeight / 2 */

      if (camHeightAboveTerrain > rainType.maxBillboardHeight / 2) {
        var newHeight = camHeightAboveTerrain - (rainType.maxBillboardHeight / 2);
        
        // if the billboard is in a no rain spot
        if (noRainSpotIndex > -1) {
          const noRainHeight = noRainSpots[noRainSpotIndex].billboardHeight;
          // if the no rain spot desired height is above the new height set it
          if (newHeight < noRainHeight && rainType.billboardArr[index].y !== noRainHeight) {
            rainType.billboardArr[index].y = noRainHeight;
            moveY = true;
          } 
          // otherwise if the new height is greater than the no rain height set the billboard to the new height
          else if (newHeight > noRainHeight && rainType.billboardArr[index].y !== newHeight) {
            rainType.billboardArr[index].y = newHeight;
            moveY = true;
          }
        }
        // if the billboard is not in a no rain spot and the y value of the billboard isn't the new height set it
        else if (rainType.billboardArr[index].y !== newHeight) {
          rainType.billboardArr[index].y = newHeight;
          moveY = true;
        }
      }

      // If we need to move the grid point
      if (rainType.billboardArr[index].x != billboard_x || rainType.billboardArr[index].z != billboard_z || moveY) {
        rainType.billboardArr[index].x = billboard_x;
        rainType.billboardArr[index].z = billboard_z;
        mx.move_billboard(billboardIndex, rainType.billboardArr[index].x, rainType.billboardArr[index].y, rainType.billboardArr[index].z);
      }
  	}
  }
}

function hideRainBillboards(rainType) {
  for (var i = 0; i < rainType.billboardArr.length; i++) {
    mx.color_billboard(rainType.billboardArr[i].index, 1, 1, 1, 0);
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
    var rand = mulberry32SeedFromInterval((gateDropTime * 1000) >> 3, 120, 360);
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
    min = Math.ceil(min);
    max = Math.floor(max);
    if (min === max) {
      return min;
    }

    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    var num = ((t ^ t >>> 14) >>> 0) / 4294967296;
    return (num * (max - min + 1)) + min;
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
