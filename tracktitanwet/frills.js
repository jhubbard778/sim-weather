
var track_folder_name = "tracktitanwet";

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
  "thunder-no-rain", "thunder-rain", "thunder-heavy-rain",
  "heavy-thunder-rain", "heavy-thunder-heavy-rain"
];

set_up_weather_sounds();

/*
Initialize sounds for later use.
*/
function set_up_weather_sounds() {

  // Right now only set up and play a base rain sound.  We can set up rain to play with weather types later.
  add_sound(rain_sounds, rain_sound_directories);
  mx.set_sound_vol(rain_sounds[0], 20);
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

function frame_handler(seconds) {
  updateCamPosition();
  frame_handler_prev(seconds);
}

var frame_handler_prev = mx.frame_handler;
mx.frame_handler = frame_handler;