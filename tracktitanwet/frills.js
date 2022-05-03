
var track_folder_name = "tracktitanwet";
// stores terrain.hf info
var terrain = {
    // terrain.png dimensions
    size: 2049,
    // track scale
    scale: 1,
    // max height
    max: 102.878342,
};

// Different rain sounds depending on weather type.
var rain_sounds = [];
var rain_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/rain/rain.raw",
  "@" + track_folder_name + "/sounds/weather/rain/rain2.raw",
];

// Distant ambient thunder sounds
var distant_thunder = [];
var distant_thunder_directories = [
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder2.raw",
];

// Basic thunder sounds
var thunder_sounds = [];
var thunder_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/thunder/thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder2.raw",
];

// Heavy thunder sounds
var heavy_thunder_sounds = [];
var heavy_thunder_directories = [
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder2.raw",
];

var weather_types = [
  "clear", "light-rain", "rain", "heavy-rain",
  "light-thunder-no-rain", "light-thunder-rain", "light-thunder-heavy-rain",
  "med-thunder-no-rain", "med-thunder-rain", "med-thunder-heavy-rain",
  "heavy-thunder-rain", "heavy-thunder-heavy-rain"
];

set_up_weather_sounds();

/*
Initialize sounds for later use.
*/
function set_up_weather_sounds() {

  // Right now only set up and play a base rain sound.  We can set up rain to play with weather types later.
  add_sound(rain_sounds, rain_sound_directories);
  mx.set_sound_vol(rain_sounds[0], 5);
  mx.set_sound_loop(rain_sounds[0], 1);
  mx.start_sound(rain_sounds[0]);

  // Just adding the sounds into the game, we will add volumes later
  add_sound(distant_thunder, distant_thunder_directories);
  add_sound(thunder_sounds, thunder_sound_directories);
  add_sound(heavy_thunder_sounds, heavy_thunder_directories);

}

function add_sound(arr, directory) {
  // if adding a sound that's not set to this frequency, will cause sound to play incorrectly
  var sound_freq = 44100;
  for (var i = 0; i < directory.length; i++) {
    arr[i] = mx.add_sound(directory[i]);
    mx.set_sound_freq(arr[i], sound_freq);
  }
}

// Camera Position Array holds position of camera in 3 element array [x,y,z]
// Camera Rotation Matrix holds rotation of camera in a 3x3 matrix stored as a 9 element array.
var cam_pos_arr = [], cam_rotation_matrix = [];

function updateCamPosition() {
  // stores camera location into the cam_pos_arr and cam_rotation_matrix array variables
  mx.get_camera_location(cam_pos_arr, cam_rotation_matrix);

	// Rain sound position
	mx.set_sound_pos(rain_sounds[0], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
}


var got_time_lighning = false;
var time_lighning_strike;
var weather_type;
var time_thunder = -1;
var thunder_pending = false;
var lightning_coords = {
  x: 0,
  y: 0,
  z: 0
};
var type_of_thunder_playing;
var thunder_sound_index = 0;
// speed of sound in ft/s
const speed_of_sound = 1117.2;
const delay = 8;
const time_for_another_lightning = 10;
const base_thunder_vol = 50;

// multiplied by the size of the map, it's where the lightning can strike outside the map
// We will allow lightning to happen outside the map at 3x scale
var map_size_for_lightning = 3;
var distance_from_rider_to_lightning_origin;

function do_thunder_and_lightning() {
  weather_type = get_weather_type();
  if (!weather_type.includes("thunder")) return;

  var seconds = mx.seconds;

  // get time of a lightning strike
  if (!got_time_lighning && seconds >= time_for_another_lightning) {
    time_lighning_strike = randomNumFromInterval(0, 60) + seconds;
    got_time_lighning = true;
    playedthunder = false;
  }

  // get coords of lighning strike
  if (got_time_lighning && seconds >= time_lighning_strike) {
    // Max and Min Coordinates of x and z where lightning can strike
    var max, min;
    min = -(1/2 * (((terrain.size - 1) * terrain.scale) * map_size_for_lightning) - (1/2 * ((terrain.size - 1) * terrain.scale)));
    max = (1/2 * (((terrain.size - 1) * terrain.scale) * map_size_for_lightning) - (1/2 * ((terrain.size - 1) * terrain.scale))) + (terrain.size - 1);

    lightning_coords.x = randomIntFromInterval(min, max);
    lightning_coords.y = randomIntFromInterval(terrain.max, terrain.max * 2);
    lightning_coords.z = randomIntFromInterval(min, max);

    // TODO: Lightning Animations
    mx.message("Lightning Strike!");
    mx.message("Lightning Strike Coords: X - " + (lightning_coords.x).toString() + " Y - " + (lightning_coords.y).toString() + " Z - " + (lightning_coords.z).toString());

    // wait at least delay seconds for another lightning strike
    time_for_another_lightning = time_lighning_strike + delay;
    thunder_pending = true;
    got_time_lighning = false;
  }

  // constantly update the distance from the origin point and time it'll take to reach
  if (thunder_pending) {

    // Get the time since the lightning strike
    var time_since_strike = seconds - time_lighning_strike;

    // Get distance traveled by thunder
    var distance_traveled = time_since_strike * speed_of_sound;

    // get distance from player camera to origin of lightning strike
    var x1 = cam_pos_arr[0], y1 = cam_pos_arr[1], z1 = cam_pos_arr[2], x2 = lightning_coords.x, y2 = lightning_coords.y, z2 = lightning_coords.z;
    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));

    // if the thunder has reacher the player
    if (distance - distance_traveled <= 0) {
      // time it took for the thunder to reach the rider from the lightning origin
      var time = seconds - time_lighning_strike;
      var vol = Math.ceil(base_thunder_vol / (1/50 * time));
  
      mx.message("Thunder sound " + (time.toFixed(3)).toString() + " seconds after lightning!");
  
      // if it takes less than 1.5 seconds to reach play a heavy thunder sound
      if (time < 1.5)  {
        play_thunder_sound(heavy_thunder_sounds, vol);
        type_of_thunder_playing = "heavy";
      }
      // otherwise play a medium thunder sound if it took less than 3 seconds
      else if (time < 3) {
        play_thunder_sound(thunder_sounds, vol);
        type_of_thunder_playing = "med";
      }
      // otherwise play a distant thunder sound
      else {
        play_thunder_sound(distant_thunder, vol);
        type_of_thunder_playing = "distant";
      }
      thunder_pending = false;
    }
  }
  else if (type_of_thunder_playing) {
      switch (type_of_thunder_playing) {
        case "heavy":
          mx.set_sound_pos(heavy_thunder_sounds[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
          break;
        case "med":
          mx.set_sound_pos(thunder_sounds[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
          break;
        case "distant":
          mx.set_sound_pos(distant_thunder[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
          break;
    }
  }  
}

function play_thunder_sound(arr, vol) {
  thunder_sound_index = randomIntFromInterval(0, arr.length - 1);
  mx.set_sound_pos(arr[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
  mx.set_sound_vol(arr[thunder_sound_index], vol);
  mx.start_sound(arr[thunder_sound_index]);
}

function get_weather_type() {
  return "thunder-rain";
}

function frame_handler(seconds) {
  updateCamPosition();
  try {
    do_thunder_and_lightning();
  }
  catch (e) {
    mx.message("Error: " + e);
  }
  frame_handler_prev(seconds);
}

var frame_handler_prev = mx.frame_handler;
mx.frame_handler = frame_handler;

function randomIntFromInterval(min, max) {return Math.floor(Math.random() * (max - min) + min);}
function randomNumFromInterval(min,max) {return Math.random() * (max - min) + min;}