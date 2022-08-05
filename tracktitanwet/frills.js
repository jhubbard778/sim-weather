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
var distantThunderSounds = [];
const distantThunderDirectories = [
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder1.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder2.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder3.raw",
  "@" + trackFolderName + "/sounds/weather/distant-thunder/distant-thunder4.raw",
];

// Basic thunder sounds
var thunderSounds = [];
const thunderSoundDirectories = [
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
];

/*
======================================================================================
Choose which weather types you'd like on you map and throw them into the weather types
array and make sure they're separated by commas and are strings.

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

setUpWeatherSounds();

/*
Initialize sounds for later use.
*/
function setUpWeatherSounds() {

  addSound(lightRainSounds, lightRainSoundDirectories);
  addSound(medRainSounds, medRainSoundDirectories);
  addSound(heavyRainSounds, heavyRainSoundDirectories);
  setRainLoops();

  // Just add the sounds into game, we will change volumes later
  addSound(distantThunderSounds, distantThunderDirectories);
  addSound(thunderSounds, thunderSoundDirectories);
  addSound(heavyThunderSounds, heavyThunderDirectories);

}

function addSound(arr, directory) {
  // if adding a sound that's not set to this frequency, will cause sound to play incorrectly
  var soundFreq = 44100;
  for (var i = 0; i < directory.length; i++) {
    arr[i] = mx.add_sound(directory[i]);
    mx.set_sound_freq(arr[i], soundFreq);
  }
}

const lightRainVolume = 1;
const mediumRainVolume = 2;
const heavyRainVolume = 4;
// set the loops up, the variables above will be used for fade-in-out volumes
function setRainLoops() {
  for (var i = 0; i < lightRainSounds.length; i++) mx.set_sound_loop(lightRainSounds[i], 1);
  for (var i = 0; i < medRainSounds.length; i++) mx.set_sound_loop(medRainSounds[i], 1);
  for (var i = 0; i < heavyRainSounds.length; i++) mx.set_sound_loop(heavyRainSounds[i], 1);
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
var thunderPending = false;
var lightningCoords = {
  x: 0,
  y: 0,
  z: 0
};
var typeOfThunderPlaying;
var thunderSoundIndex = 0;
var delayForAnotherLightning = 10;
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

/* get the max coordinate of lightning outside map, multiple by sqrt(2) for longest distance from (0,0) to (max,max) (because the map is square and can be divided 
  into two 45-45-90 triangles) and divide for speed of sound for the max time it would take thunder to reach the player that's inside of the map boundaries */
const maxTimeOfThunderPending = (maxCoords * Math.sqrt(2)) / SPEED_OF_SOUND;

function doThunderAndLightning() {
  currentWeatherType = getWeatherType();
  if (!currentWeatherType.includes("thunder")) {
    // if we had a pending lightning strike cancel it
    if (timeLightningStrike) {
      timeLightningStrike = undefined;
      gotTimeLightning = false;
    }
    return;
  }

  var seconds = mx.seconds;
  var rand;
  // get time of a lightning strike
  if (!gotTimeLightning && seconds >= delayForAnotherLightning) {
    var intervals = getMinMaxLightningStrikes();
    if (!intervals) return;
    rand = mulberry32SeedFromInterval(seconds * 1234, intervals[0], intervals[1]);
    timeLightningStrike = rand() + seconds;
    mx.message("time of lightning strike: " + timeToString(timeLightningStrike));
    gotTimeLightning = true;
  }

  // If we are behind the delay for another lightning and we have already gotten a time we're going back in a demo prior to a strike
  if (seconds < delayForAnotherLightning && gotTimeLightning) {
    gotTimeLightning = false;
  }
  // If we're behind enough to the point where we could fit another strike in then decrement the delay
  if (seconds < delayForAnotherLightning - maxTimeOfThunderPending) {
    delayForAnotherLightning -= maxTimeOfThunderPending;
  }

  // get coords of lighning strike
  if (gotTimeLightning && seconds >= timeLightningStrike) {

    rand = mulberry32SeedFromInterval(timeLightningStrike * 100, minCoords, maxCoords);
    lightningCoords.x = rand();

    rand = mulberry32SeedFromInterval(timeLightningStrike * 10000, minCoords, maxCoords);
    lightningCoords.z = rand();

    // get elevation of terrain at lightning strike coords x and z, and the height of the strike will be between the elevation and double the height of the elevation
    var height = mx.get_elevation(lightningCoords.x, lightningCoords.z);

    // Seed the random number with the coordinates of the x and z, range it between the height and double the height
    rand = mulberry32SeedFromInterval(lightningCoords.x + lightningCoords.z, height, height * 2);
    lightningCoords.y = rand();

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

    // Get the time since the lightning strike
    var timeSinceStrike = seconds - timeLightningStrike;

    // Get distance traveled by thunder
    var distanceTraveled = timeSinceStrike * SPEED_OF_SOUND;

    // get distance from player camera to origin of lightning strike
    var x1 = pos[0], y1 = pos[1], z1 = pos[2], x2 = lightningCoords.x, y2 = lightningCoords.y, z2 = lightningCoords.z;
    var distance = getDistance3D(x1,y1,z1,x2,y2,z2);

    // if the thunder has reacher the player
    if (distance - distanceTraveled <= 0) {
      // time it took for the thunder to reach the rider from the lightning origin
      var time = seconds - timeLightningStrike;
      var vol = Math.ceil(baseThunderVolume / (1/4 * time));
  
      mx.message("Thunder sound " + (time.toFixed(3)).toString() + " seconds after lightning!");
  
      // if it takes less than 1.5 seconds to reach play a heavy thunder sound
      if (time < 1.5)  {
        playThunderSound(heavyThunderSounds, vol);
        typeOfThunderPlaying = "heavy";
      }
      // otherwise play a medium thunder sound if it took less than 3 seconds
      else if (time < 3) {
        playThunderSound(thunderSounds, vol);
        typeOfThunderPlaying = "med";
      }
      // otherwise play a distant thunder sound
      else {
        playThunderSound(distantThunderSounds, vol);
        typeOfThunderPlaying = "distant";
      }
      thunderPending = false;
    }
  }
  else if (typeOfThunderPlaying) {
    if (typeOfThunderPlaying === "heavy") {
      mx.set_sound_pos(heavyThunderSounds[thunderSoundIndex], pos[0], pos[1], pos[2]);
    } else if (typeOfThunderPlaying === "med") {
      mx.set_sound_pos(thunderSounds[thunderSoundIndex], pos[0], pos[1], pos[2]);
    } else if (typeOfThunderPlaying === "distant") {
      mx.set_sound_pos(distantThunderSounds[thunderSoundIndex], pos[0], pos[1], pos[2]);
    }
  }  
}

function getMinMaxLightningStrikes() {
  if (currentWeatherType.includes("light-thunder")) {return [10,60];}
  if (currentWeatherType.includes("med-thunder")) {return [5,30];}
  if (currentWeatherType.includes("heavy-thunder")) {return [0,15];}

  mx.message("Weather type unrecognized!");
  return undefined;
}

function playThunderSound(arr, vol) {
  var rand = mulberry32SeedFromInterval(mx.seconds * 12345, 0, arr.length - 1);
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
var iterationThroughWeatherIndices = 1;
var timeWeatherStarted = 0;
var weatherTimeLeft = 0;
var initializedWeatherForSession = false;
const minWeatherTypes = 10;
/* Weather should be the same for every client, but different for each session, so we will use the players slot numbers from the running order,
    which changes at the beginning of each session, but is a constant for all players as the basis for creating what weather types to choose */
function getWeatherType() {
  if (!initializedWeatherForSession) {
    var r = globalRunningOrder;

    for (var i = 0; i < r.length; i++) {
      var rand = mulberry32SeedFromInterval((mx.get_rider_number(r[i].slot) * 321) / r.length, 0, weatherTypesArr.length - 1);
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
    initializedWeatherForSession = true;
  }

  var seconds = mx.seconds;

  // if we're in a demo and we went behind the time that the weather started we need to go back to the previous weather type and duration
  if (seconds < timeWeatherStarted) {
    // If we're at the beginning set it to the top of the weather indices and go back in an iteration
    if (weatherTypeIndex == 0) {
      weatherTypeIndex = weatherIndicesForSession.length;
      iterationThroughWeatherIndices--;
    }
    // Decrement the index
    weatherTypeIndex--;

    // Convert the weather type index to terms of lengths for the duration and times arrays
    var index = weatherTypeIndex + ((iterationThroughWeatherIndices - 1) * weatherIndicesForSession.length);
    durationOfWeatherType = weatherDurations[index];
    timeWeatherStarted = timesWeatherStarted[index];
    mx.message("weather type changed to: " + weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]]);
    mx.message("duration of new weather: " + timeToString(durationOfWeatherType) + "s");
  }

  weatherTimeLeft = durationOfWeatherType - (mx.seconds - timeWeatherStarted);
  if (mx.seconds - lastDisplay > 64 / 128 || mx.seconds < lastDisplay) {
    //mx.message("Time Left: " + timeToString(weatherTimeLeft));
    lastDisplay = seconds;
  }

  if (weatherTimeLeft <= 0) {
    weatherTypeIndex++;
    // if we reach the end of the weather array, reset the index to the beginning
    if (weatherTypeIndex == weatherIndicesForSession.length) {
      weatherTypeIndex = 0;
      iterationThroughWeatherIndices++;
    }
    
    // Convert the weather type index to terms of lengths for the duration and times arrays
    var index = weatherTypeIndex + ((iterationThroughWeatherIndices - 1) * weatherIndicesForSession.length);
    if (index >= weatherDurations.length) {
      if (index > weatherDurations.length) mx.message("You fucking suck figure it out");
      // Pick a weather duration seeded by the time if we don't have one already gotten
      var rand = mulberry32SeedFromInterval(seconds * 12345, 60, 360);
      weatherDurations.push(rand());
      // set the time that the new weather started, this and weatherDurations will have a 1:1 correlation
      timesWeatherStarted.push(seconds);
      mx.message("Weather Durations: " + weatherDurations.toString());
      mx.message("Times Started: " + timesWeatherStarted.toString());
    }
    // Get the index of our durations and times started and store the current duration and time started
    durationOfWeatherType = weatherDurations[index];
    timeWeatherStarted = timesWeatherStarted[index];

    mx.message("weather type changed to: " + weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]]);
    mx.message("duration of new weather: " + timeToString(durationOfWeatherType) + "s");
  }



  return weatherTypesArr[weatherIndicesForSession[weatherTypeIndex]];
}

var currentRainSoundIndex = 0;
var isRaining = false;
var rainType;

// FADE IN VARIABLES
var fadeInRainType;
// holds either light, med, or heavy sound arr depending on rain type
var fadeInSoundArr;
var currentFadeInVolume = 0;
var targetFadeInVolume;
// fade in time in seconds
const FADE_IN_TIME = 8;
var fadeInVolumePerSec;

// FADE OUT VARIABLES
var fadeOutRainType;
// holds either light, med, or heavy sound arr depending on rain type
var fadeOutSoundArr;
var currentFadeOutVolume;
var startFadeOutVolume;
// ## Target Fade Out is Constant 0 ##
// fade out time in seconds
const FADE_OUT_TIME = 8;
var fadeOutVolumePerSec;

// Hold the time at which we start a fade
var timeFadeStarted;

// booleans to hold fade values
var fadeHappening = false;
var fadeInDone = true;
var fadeOutDone = true;

// Hold the previous rain type so we can still move the position
var prevRainType;
var prevRainIndex;

function doRain() {
  // If the current weather is no rain or clear and it's raining
  if ((currentWeatherType.includes("no-rain") || currentWeatherType.includes("clear")) && isRaining) {

    // set the fade out start volume
    getFadeVolumes("out");
    fadeOutVolumePerSec = (0 - startFadeOutVolume) / FADE_OUT_TIME;

    // previous rain type and sound index
    prevRainType = rainType;
    prevRainIndex = currentRainSoundIndex;

    // Reinitialize rain type and index
    rainType = undefined;
    currentRainSoundIndex = undefined;

    // set the fade out rain time and the current volume we're starting at fading to zero
    fadeOutRainType = prevRainType;

    // set the time we're starting the fade in
    timeFadeStarted = mx.seconds;

    // say that we're fading, and that the fade out is not done
    fadeHappening = true;
    fadeOutDone = false;
    
    hideRainBillboards();

    isRaining = false;
  }
  // If the current weather is rain and it is not raining
  else if (!isRaining && !currentWeatherType.includes("no-rain") && !currentWeatherType.includes("clear")) {
    // set the current rain sound as a random number between the indices at which the sounds are present in rain sounds
    if (currentWeatherType.includes("light-rain")) {
      if (!rainType) {
        rainType = "light";
      }
      startRain(lightRainSounds);
    } else if (currentWeatherType.includes("med-rain")) {
      if (!rainType) {
        rainType = "med";
      }
      startRain(medRainSounds);
    } else if (currentWeatherType.includes("heavy-rain")) {
      if (!rainType) {
        rainType = "heavy";
      }
      startRain(heavyRainSounds);
    } else {
      mx.message("Error: Weather type Unrecognized");
      isRaining = true;
      return;
    }
  
    // set the rain fade in type, get the volume we're fading into
    fadeInRainType = rainType;
    currentFadeInVolume = 0;
    getFadeVolumes("in");
    fadeInVolumePerSec = (targetFadeInVolume - currentFadeInVolume) / FADE_IN_TIME;

    // get time we're starting the fade
    timeFadeStarted = mx.seconds;

    // say that we're fading, and that the fade in is not done
    fadeHappening = true;
    fadeInDone = false;
    isRaining = true;
  }

  if (isRaining) {
    // if we changed rain types
    if (currentWeatherType.includes("light-rain") && rainType !== "light") {
      changeRainType("light");
    } else if (currentWeatherType.includes("med-rain") && rainType !== "med") {
      changeRainType("med");
    } else if (currentWeatherType.includes("heavy-rain") && rainType !== "heavy") {
      changeRainType("heavy");
    }

    // if it's raining we update the current rain sound position
    moveRainPosition(rainType, currentRainSoundIndex);
    moveRainBillboards();
  }

  if (fadeHappening) {
    // store time since fade started
    var t = mx.seconds - timeFadeStarted;

    if (!fadeInDone) {
      // Calculate the current volume and set it
      currentFadeInVolume = (fadeInVolumePerSec * t);
      setRainSoundVolume(rainType, currentRainSoundIndex, currentFadeInVolume);

      // TODO: Fade in rain animation

      // If our current volume is greater than or equal to the target volume
      if (currentFadeInVolume >= targetFadeInVolume) {
        // set the sound to the target volume just in case for demos
        setRainSoundVolume(rainType, currentRainSoundIndex, targetFadeInVolume);

        // We're done with these variables, leave them undefined
        fadeInSoundArr = undefined;
        currentFadeInVolume = undefined;
        targetFadeInVolume = undefined;
        fadeInRainType = undefined;
        fadeInVolumePerSec = undefined;

        // We're done fading in
        fadeInDone = true;
      }
    }
    if (!fadeOutDone) {
      // If we have a fade out rain we still need to move it's position
      moveRainPosition(prevRainType, prevRainIndex);

      // Calculate the current volume and set it
      currentFadeOutVolume = startFadeOutVolume + (fadeOutVolumePerSec * t);
      setRainSoundVolume(prevRainType, prevRainIndex, currentFadeOutVolume);

      // TODO: Fade out rain animation

      // If we've reached less than or equal to zero
      if (currentFadeOutVolume <= 0) {
        // set the sound to the target volume just in case for demos
        setRainSoundVolume(prevRainType, prevRainIndex, 0);

        // Stop the sound
        stopRainSound(prevRainType, prevRainIndex);

        // We're done with these variables for now, leave them undefined
        prevRainType = undefined;
        prevRainIndex = undefined;
        fadeInSoundArr = undefined;
        fadeOutRainType = undefined;
        currentFadeOutVolume = undefined;
        startFadeOutVolume = undefined;
        fadeOutVolumePerSec = undefined;

        // We're done fading out
        fadeOutDone = true;
      }
    }
    if (fadeInDone && fadeOutDone) fadeHappening = false;
  }
}

function changeRainType(newRainType) {

  // get the fade out volume
  getFadeVolumes("out");

  // set the previous rain type, and the previous rain sound index
  prevRainType = rainType;
  prevRainIndex = currentRainSoundIndex;

  // fade in rain type is the new rain type, fade out is previous rain type
  fadeInRainType = newRainType;
  fadeOutRainType = prevRainType;

  // reset rain type
  rainType = newRainType;
  
  // start a new rain sound for preparation of fading in
  if (rainType === "light") {
    startRain(lightRainSounds);
  } else if (rainType === "med") {
    startRain(medRainSounds);
  } else if (rainType === "heavy") {
    startRain(heavyRainSounds);
  }

  // get the fade in volume
  getFadeVolumes("in");

  // initialize current fade volume and vol/sec variables
  currentFadeInVolume = 0;
  fadeInVolumePerSec = targetFadeInVolume / FADE_IN_TIME;
  fadeOutVolumePerSec = (0 - startFadeOutVolume) / FADE_OUT_TIME;

  // get time fade starting
  timeFadeStarted = mx.seconds;

  fadeHappening = true;
  fadeInDone = false;
  fadeOutDone = false;
}

function startRain(sound_arr) {
  var rand = mulberry32SeedFromInterval(mx.seconds * 100, 0, sound_arr.length - 1);
  currentRainSoundIndex = Math.floor(rand());

  // initialize sound volume to zero and start it for the fade
  mx.set_sound_vol(sound_arr[currentRainSoundIndex], 0);
  mx.start_sound(sound_arr[currentRainSoundIndex]);
}

function getFadeVolumes(key) {
  if (key === "in") {
    if (rainType === "light") {
      targetFadeInVolume = lightRainVolume;
    } else if (rainType === "med") {
      targetFadeInVolume = mediumRainVolume;
    } else if (rainType === "heavy") {
      targetFadeInVolume = heavyRainVolume;
    }
  }
  else if (key === "out")  {
    if (rainType === "light") {
      startFadeOutVolume = lightRainVolume;
    } else if (rainType === "med") {
      startFadeOutVolume = mediumRainVolume;
    } else if (rainType === "heavy") {
      startFadeOutVolume = heavyRainVolume;
    }
  }
  else mx.message("Error: key unrecognized");
}

function setRainSoundVolume(type, index, vol) {
  if (type === "light") {
    mx.set_sound_vol(lightRainSounds[index], vol);
  } else if (type === "med") {
    mx.set_sound_vol(medRainSounds[index], vol);
  } else if (type === "heavy") {
    mx.set_sound_vol(heavyRainSounds[index], vol);
  } 
}

function stopRainSound(type, index) {
  if (type === "light") {
    mx.stop_sound(lightRainSounds[index]);
  } else if (type === "med") {
    mx.stop_sound(medRainSounds[index]);
  } else if (type === "heavy") {
    mx.stop_sound(heavyRainSounds[index]);
  }
}

function moveRainPosition(type, index) {
  if (type === "light") {
    mx.set_sound_pos(lightRainSounds[index], pos[0], pos[1], pos[2]);
  } else if (type === "med") {
    mx.set_sound_pos(medRainSounds[index], pos[0], pos[1], pos[2]);
  } else if (type === "heavy") {
    mx.set_sound_pos(heavyRainSounds[index], pos[0], pos[1], pos[2]);
  } 
}

const gridsize = 45; // How many feet between grid points
const gridcount = 9; // How many grid points along each edge
const gridarea = gridcount * gridcount;
var rain = [];
for (var i = 0; i < gridarea; i++) {rain.push({x: undefined, z: undefined, alpha: undefined});}

const rainTexture = "@" + trackFolderName + "/billboard/rain/rain/rain.seq";
const rainBillboardStartIndex = mx.find_billboard(rainTexture, 0);
var isEnoughBillboards = false;
if (rainBillboardStartIndex > -1) {
  var lastIndexFound = rainBillboardStartIndex;
  var numRainBillboards = 1;
  isEnoughBillboards = true;
  for (var i = rainBillboardStartIndex + 1; lastIndexFound == i - 1; i++) {
    lastIndexFound = mx.find_billboard(rainTexture, i);
    if (lastIndexFound == -1) break;
    numRainBillboards++;
  }

  if (numRainBillboards < gridarea) {
    mx.message("Error...not enough rain sequence billboards in a row in billboards file | Missing Billboards: " + (gridarea - numRainBillboards).toString());
    isEnoughBillboards = false;
  }

  if (numRainBillboards > gridarea) {
    mx.message("Warning...too many rain billboards | Excess billboards: " + (numRainBillboards - gridarea).toString());
  }
} 

hideRainBillboards();

function moveRainBillboards() {
  if (!isEnoughBillboards) return;
  for (var z = 0; z < gridcount; z++) {
  	for (var x = 0; x < gridcount; x++) {
      var camx = pos[0], camz = pos[2];
  		var billboard_x = Math.floor((camx / gridsize) - (gridcount / 2.0) + 0.5 + x) * gridsize;
  		var billboard_z = Math.floor((camz / gridsize) - (gridcount / 2.0) + 0.5 + z) * gridsize;

      var index = x + z * gridcount;

      // probably a good idea to fade out to hide popping
  		var dx = rain[index].x - camx;
  		var dz = rain[index].z - camz;
  		var alpha = 1 - (Math.sqrt(dx * dx + dz * dz) / (gridsize * gridcount / 2));
      if (alpha > 1) alpha = 1;
      if (alpha < 0) alpha = 0;

      // Change the alpha of the rain billboards if we have a new alpha level
      if (rain[index].alpha != alpha) {
        rain[index].alpha = alpha;
        mx.color_billboard(rainBillboardStartIndex + index, 1, 1, 1, rain[index].alpha);
      }
      
      // If we need to move the grid point
      if (rain[index].x != billboard_x || rain[index].z != billboard_z) {
        rain[index].x = billboard_x;
        rain[index].z = billboard_z;
        mx.move_billboard(rainBillboardStartIndex + index, rain[index].x, 0, rain[index].z);
      }
  	}
  }
}

function hideRainBillboards() {
  for (var i = rainBillboardStartIndex; i < rainBillboardStartIndex + gridarea; i++) {
    mx.color_billboard(i, 1, 1, 1, 0);
  }
}

function frameHandler(seconds) {
  globalRunningOrder = mx.get_running_order();
  updateCamPosition();
  try {
    doThunderAndLightning();
  }
  catch (e) {
    mx.message("lightning error: " + e.toString());
  }
  try {
    doRain();
  }
  catch (e) {
    mx.message("rain error: " + e.toString());
  }
  
  frameHandlerPrev(seconds);
}

var frameHandlerPrev = mx.frame_handler;
mx.frame_handler = frameHandler;

function randomIntFromInterval(min, max) {return Math.floor(Math.random() * (max - min + 1) + min);}
function randomNumFromInterval(min,max) {return Math.random() * (max - min) + min;}
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
