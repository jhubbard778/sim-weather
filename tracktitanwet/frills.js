
const track_folder_name = "tracktitanwet";
const terrain = {
    // terrain.png dimensions
    size: 2049,
    // track scale
    scale: 1
};

// Different rain sounds depending on weather type.
var light_rain_sounds = [];
const light_rain_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/rain/rain2.raw"
];

var med_rain_sounds = [];
const med_rain_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/rain/rain.raw"
];

var heavy_rain_sounds = [];
const heavy_rain_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/rain/rain.raw"
];

// Distant ambient thunder sounds
var distant_thunder = [];
const distant_thunder_directories = [
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder2.raw",
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder3.raw",
  "@" + track_folder_name + "/sounds/weather/distant-thunder/distant-thunder4.raw",
];

// Basic thunder sounds
var thunder_sounds = [];
const thunder_sound_directories = [
  "@" + track_folder_name + "/sounds/weather/thunder/thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder2.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder3.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder4.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder5.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder6.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder7.raw",
  "@" + track_folder_name + "/sounds/weather/thunder/thunder8.raw",
];

// Heavy thunder sounds
var heavy_thunder_sounds = [];
const heavy_thunder_directories = [
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder1.raw",
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder2.raw",
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder3.raw",
  "@" + track_folder_name + "/sounds/weather/heavy-thunder/heavy-thunder4.raw",
];

const weather_types_arr = [
  "clear", "light-rain", "med-rain", "heavy-rain",
  "light-thunder-no-rain", "light-thunder-light-rain", "light-thunder-med-rain", "light-thunder-heavy-rain",
  "med-thunder-no-rain", "med-thunder-light-rain", "med-thunder-med-rain", "med-thunder-heavy-rain",
  "heavy-thunder-med-rain", "heavy-thunder-heavy-rain"
];

const first_lap_length = mx.first_lap_length;
const normal_lap_length = mx.normal_lap_length;

var g_running_order;

set_up_weather_sounds();

/*
Initialize sounds for later use.
*/
function set_up_weather_sounds() {

  add_sound(light_rain_sounds, light_rain_sound_directories);
  add_sound(med_rain_sounds, med_rain_sound_directories);
  add_sound(heavy_rain_sounds, heavy_rain_sound_directories);
  set_rain_loops();

  // Just add the sounds into game, we will change volumes later
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

const light_rain_vol = 0.5;
const med_rain_vol = 2;
const heavy_rain_vol = 4;
// set the loops up, the variables above will be used for fade-in-out volumes
function set_rain_loops() {
  for (var i = 0; i < light_rain_sounds.length; i++)  mx.set_sound_loop(light_rain_sounds[i], 1);
  for (var i = 0; i < med_rain_sounds.length; i++) mx.set_sound_loop(med_rain_sounds[i], 1);
  for (var i = 0; i < heavy_rain_sounds.length; i++) mx.set_sound_loop(heavy_rain_sounds[i], 1);
}

function determine_if_server() {
  var num_players = 0;
  for (var i = 0; i <g_running_order.length; i++) {
    if (mx.get_rider_name(g_running_order[i].slot) != "Roborider") {
      num_players++;
      if (num_players > 1) return true;
    }
  }
  return false;
}

// Camera Position Array holds position of camera in 3 element array [x,y,z]
// Camera Rotation Matrix holds rotation of camera in a 3x3 matrix stored as a 9 element array.
var cam_pos_arr = [], cam_rotation_matrix = [];

function updateCamPosition() {
  // stores camera location into the cam_pos_arr and cam_rotation_matrix array variables
  mx.get_camera_location(cam_pos_arr, cam_rotation_matrix);
}


var got_time_lighning = false;
var time_lighning_strike;
var current_weather_type;
var thunder_pending = false;
var lightning_coords = {
  x: 0,
  y: 0,
  z: 0
};
var type_of_thunder_playing;
var thunder_sound_index = 0;
var time_for_another_lightning = 10;
// speed of sound in ft/s
const speed_of_sound = 1117.2;
const base_thunder_vol = 10;

// multiplied by the size of the map, it's where the lightning can strike outside the map
// We will allow lightning to happen outside the map at 3x scale
const map_size_for_lightning = 3;

// Max and Min Coordinates of x and z where lightning can strike, algorithm keeps original center point constant.
const min_coords = -(1/2 * (((terrain.size - 1) * terrain.scale) * map_size_for_lightning) - (1/2 * ((terrain.size - 1) * terrain.scale)));
const max_coords = (1/2 * (((terrain.size - 1) * terrain.scale) * map_size_for_lightning) - (1/2 * ((terrain.size - 1) * terrain.scale))) + (terrain.size - 1);

/* get the max coordinate of lightning outside map, multiple by sqrt(2) for longest distance from (0,0) to (max,max) (because the map is square and can be divided 
  into two 45-45-90 triangles) and divide for speed of sound for the max time it would take thunder to reach the player that's inside of the map boundaries */
const max_time_of_thunder_pending = (max_coords * Math.sqrt(2)) / speed_of_sound;

mx.message("max time thunder can pend: " + (max_time_of_thunder_pending.toFixed(3)).toString());

function do_thunder_and_lightning() {
  current_weather_type = get_weather_type();
  if (!current_weather_type.includes("thunder")) {
    // if we had a pending lightning strike cancel it
    if (time_lighning_strike) {
      time_lighning_strike = undefined;
      got_time_lighning = false;
    }
    return;
  }

  var seconds = mx.seconds;

  // get time of a lightning strike
  if (!got_time_lighning && seconds >= time_for_another_lightning) {
    time_lighning_strike = randomNumFromInterval(0, 60) + seconds;
    got_time_lighning = true;
  }

  // get coords of lighning strike
  if (got_time_lighning && seconds >= time_lighning_strike) {

    lightning_coords.x = randomIntFromInterval(min_coords, max_coords);
    lightning_coords.z = randomIntFromInterval(min_coords, max_coords);

    // get elevation of terrain at lightning strike coords x and z, and the height of the strike will be between the elevation and double the height of the elevation
    var height = mx.get_elevation(lightning_coords.x, lightning_coords.z);
    lightning_coords.y = randomIntFromInterval(height, height * 2);

    // TODO: Lightning Animations
    mx.message("Lightning Strike!");
    mx.message("Lightning Strike Coords: X - " + (lightning_coords.x).toString() + " Y - " + (lightning_coords.y).toString() + " Z - " + (lightning_coords.z).toString());

    // wait at least delay seconds for another lightning strike
    time_for_another_lightning = time_lighning_strike + max_time_of_thunder_pending;
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
      var vol = Math.ceil(base_thunder_vol / (1/4 * time));
  
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
    if (type_of_thunder_playing == "heavy") mx.set_sound_pos(heavy_thunder_sounds[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
    else if (type_of_thunder_playing == "med") mx.set_sound_pos(thunder_sounds[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
    else if (type_of_thunder_playing == "distant") mx.set_sound_pos(distant_thunder[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
  }  
}

function play_thunder_sound(arr, vol) {
  thunder_sound_index = randomIntFromInterval(0, arr.length - 1);
  mx.set_sound_pos(arr[thunder_sound_index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
  mx.set_sound_vol(arr[thunder_sound_index], vol);
  mx.start_sound(arr[thunder_sound_index]);
}

var weather_type_index = -1;
var weather_indices_for_session = [];

var duration_of_weather_type = 0;
var time_weather_started = 0;
var initialized_weather_for_session = false;
const min_weather_types = 10;
var dupe_iterations = 0;
var is_server_session = false;
/* Weather should be the same for every client, but different for each session, so we will use the players slot numbers from the running order,
    which changes at the beginning of each session, but is a constant for all players as the basis for creating what weather types to choose */
function get_weather_type() {
  if (!initialized_weather_for_session) {
    var r = g_running_order;
    is_server_session = determine_if_server();
    if (r.length <= 1 || !is_server_session) {
      for (var i = 0; i < min_weather_types; i++)
        weather_indices_for_session[i] = randomIntFromInterval(0, weather_types_arr.length - 1);
    }
    else {
      for (var i = 0; i < r.length; i++) {
        weather_indices_for_session[i] = (r[i].slot % weather_types_arr.length);
      }

      // if we have less than the number of minimum weather types scheduled
      if (weather_indices_for_session.length < min_weather_types) {
        // increase the size of the weather for sessions so it has at least min weather types
        const times_to_dupe_array = Math.ceil(min_weather_types / weather_indices_for_session.length);
        // hold our original array's length
        const original_arr_length = weather_indices_for_session.length;

        var j = 0;
        for (var i = (original_arr_length - 1); i < (original_arr_length * times_to_dupe_array); i++) {
          // if we have one rider pick a random number, otherwise try to get a 'random' number that all clients will share
          weather_indices_for_session[i] = ((r[j].slot + (dupe_iterations + 1)) % weather_types_arr.length);
          // if we reached the end of the running order reset j and increment the number of times we've duped the array
          j++;
          if (j == original_arr_length) {
            dupe_iterations++;
            j = 0;
          }
        }
      }
    }
    initialized_weather_for_session = true;
  }
  if (mx.seconds >= duration_of_weather_type + time_weather_started) {
    weather_type_index++;
    // set the time that the new weather started
    time_weather_started = mx.seconds;
    // if we reach the end of the weather array, reset the index to the beginning
    if (weather_type_index == weather_indices_for_session.length - 1) weather_type_index = 0;
    // if we have one rider pick a random time between 1-6 mins, otherwise get a 'random' number that all clients will share
    if (g_running_order.length == 1 || !is_server_session) duration_of_weather_type = randomIntFromInterval(60, 360);
    else {
      var num;
      // if first's timing gate is greater than zero make the number the running order position, otherwise make it first's slot
      if (mx.get_running_order_position(0) > 0) num = mx.get_running_order_position(0);
      else num = mx.get_running_order_slot(0);
      duration_of_weather_type = ((num % normal_lap_length) + 4) * (2 * normal_lap_length / 3);
    }
    mx.message("weather type changed to: " + weather_types_arr[weather_indices_for_session[weather_type_index]]);
    mx.message("duration of new weather: " + duration_of_weather_type.toString() + "s");
  }
  return weather_types_arr[weather_indices_for_session[weather_type_index]];
}

var current_rain_sound = 0;
var is_raining = false;
var rain_type;

// FADE IN VARIABLES
var fade_in_rain_type;
// holds either light, med, or heavy sound arr depending on rain type
var fade_in_sound_arr;
var current_fade_in_vol = 0;
var target_fade_in_vol;
// fade in time in seconds
const fade_in_time = 8;
var fade_in_vol_per_sec;

// FADE OUT VARIABLES
var fade_out_rain_type;
// holds either light, med, or heavy sound arr depending on rain type
var fade_out_sound_arr;
var current_fade_out_vol;
var start_fade_out_vol;
// ## Target Fade Out is Constant 0 ##
// fade out time in seconds
const fade_out_time = 8;
var fade_out_vol_per_sec;

// Hold the time at which we start a fade
var time_fade_started;

// booleans to hold fade values
var fade_happening = false;
var fade_in_done = true;
var fade_out_done = true;

// Hold the previous rain type so we can still move the position
var prev_rain_type;
var prev_rain_index;

function do_rain() {
  // If the current weather is no rain or clear and it's raining
  if ((current_weather_type.includes("no-rain") || current_weather_type.includes("clear")) && is_raining) {
   
    // TODO: Stop rain animation

    // set the fade out start volume
    get_fade_volumes("out");
    fade_out_vol_per_sec = (0 - start_fade_out_vol) / fade_out_time;

    // previous rain type and sound index
    prev_rain_type = rain_type;
    prev_rain_index = current_rain_sound;

    // Reinitialize rain type and index
    rain_type = undefined;
    current_rain_sound = undefined;

    // set the fade out rain time and the current volume we're starting at fading to zero
    fade_out_rain_type = prev_rain_type;

    // set the time we're starting the fade in
    time_fade_started = mx.seconds;

    // say that we're fading, and that the fade out is not done
    fade_happening = true;
    fade_out_done = false;
    
    is_raining = false;
  }
  // If the current weather is rain and it is not raining
  else if (!is_raining && !current_weather_type.includes("no-rain") && !current_weather_type.includes("clear")) {
    // set the current rain sound as a random number between the indices at which the sounds are present in rain sounds
    if (current_weather_type.includes("light-rain")) start_rain(light_rain_sounds, "light");
    else if (current_weather_type.includes("med-rain")) start_rain(med_rain_sounds, "med");
    else if (current_weather_type.includes("heavy-rain")) start_rain(heavy_rain_sounds, "heavy");
    else {
      mx.message("Error: Weather type Unrecognized");
      is_raining = true;
      return;
    }
    
    // TODO: Start rain animation
  
    // set the rain fade in type, get the volume we're fading into
    fade_in_rain_type = rain_type;
    current_fade_in_vol = 0;
    get_fade_volumes("in");
    fade_in_vol_per_sec = (target_fade_in_vol - current_fade_in_vol) / fade_in_time;

    // get time we're starting the fade
    time_fade_started = mx.seconds;

    // say that we're fading, and that the fade in is not done
    fade_happening = true;
    fade_in_done = false;
    is_raining = true;
  }

  if (is_raining) {
    // if we changed rain types
    if (current_weather_type.includes("light-rain") && rain_type !== "light") change_rain_type("light");
    else if (current_weather_type.includes("med-rain") && rain_type !== "med") change_rain_type("med");
    else if (current_weather_type.includes("heavy-rain") && rain_type !== "heavy") change_rain_type("heavy");

    // if it's raining we update the current rain sound position
    move_rain_pos(rain_type, current_rain_sound);
  }

  if (fade_happening) {
    // store time since fade started
    var t = mx.seconds - time_fade_started;

    if (!fade_in_done) {
      // Calculate the current volume and set it
      current_fade_in_vol = (fade_in_vol_per_sec * t);
      set_rain_sound_vol(rain_type, current_rain_sound, current_fade_in_vol);

      // If our current volume is greater than or equal to the target volume
      if (current_fade_in_vol >= target_fade_in_vol) {
        // set the sound to the target volume just in case for demos
        set_rain_sound_vol(rain_type, current_rain_sound, target_fade_in_vol);

        // We're done with these variables, leave them undefined
        fade_in_sound_arr = undefined;
        current_fade_in_vol = undefined;
        target_fade_in_vol = undefined;
        fade_in_rain_type = undefined;
        fade_in_vol_per_sec = undefined;

        // We're done fading in
        fade_in_done = true;
      }
    }
    if (!fade_out_done) {
      // If we have a fade out rain we still need to move it's position
      move_rain_pos(prev_rain_type, prev_rain_index);

      // Calculate the current volume and set it
      current_fade_out_vol = start_fade_out_vol + (fade_out_vol_per_sec * t);
      set_rain_sound_vol(prev_rain_type, prev_rain_index, current_fade_out_vol);

      // If we've reached less than or equal to zero
      if (current_fade_out_vol <= 0) {
        // set the sound to the target volume just in case for demos
        set_rain_sound_vol(prev_rain_type, prev_rain_index, 0);

        // Stop the sound
        stop_rain_sound(prev_rain_type, prev_rain_index);

        // We're done with these variables for now, leave them undefined
        prev_rain_type = undefined;
        prev_rain_index = undefined;
        fade_in_sound_arr = undefined;
        fade_out_rain_type = undefined;
        current_fade_out_vol = undefined;
        start_fade_out_vol = undefined;
        fade_out_vol_per_sec = undefined;

        // We're done fading out
        fade_out_done = true;
      }
    }
    if (fade_in_done && fade_out_done) fade_happening = false;
  }
}

function change_rain_type(new_rain_type) {

  // get the fade out volume
  get_fade_volumes("out");

  // set the previous rain type, and the previous rain sound index
  prev_rain_type = rain_type;
  prev_rain_index = current_rain_sound;

  // fade in rain type is the new rain type, fade out is previous rain type
  fade_in_rain_type = new_rain_type;
  fade_out_rain_type = prev_rain_type;

  // reset rain type
  rain_type = new_rain_type;
  
  // start a new rain sound for preparation of fading in
  if (rain_type == "light") start_rain(light_rain_sounds, "light");
  else if (rain_type == "med") start_rain(med_rain_sounds, "med");
  else if (rain_type == "heavy") start_rain(heavy_rain_sounds, "heavy");

  // get the fade in volume
  get_fade_volumes("in");

  // initialize current fade volume and vol/sec variables
  current_fade_in_vol = 0;
  fade_in_vol_per_sec = target_fade_in_vol / fade_in_time;
  fade_out_vol_per_sec = (0 - start_fade_out_vol) / fade_out_time;

  // get time fade starting
  time_fade_started = mx.seconds;

  fade_happening = true;
  fade_in_done = false;
  fade_out_done = false;
}

function start_rain(sound_arr, type) {
  current_rain_sound = randomIntFromInterval(0, sound_arr.length - 1);
  rain_type = type;

  // initialize sound volume to zero and start it for the fade
  mx.set_sound_vol(sound_arr[current_rain_sound], 0);
  mx.start_sound(sound_arr[current_rain_sound]);
}

function get_fade_volumes(key) {
  if (key === "in") {
    if (rain_type == "light") target_fade_in_vol = light_rain_vol;
    else if (rain_type == "med") target_fade_in_vol = med_rain_vol;
    else if (rain_type == "heavy") target_fade_in_vol = heavy_rain_vol;
  }
  else if (key === "out")  {
    if (rain_type == "light") start_fade_out_vol = light_rain_vol;
    else if (rain_type == "med") start_fade_out_vol = med_rain_vol;
    else if (rain_type == "heavy") start_fade_out_vol = heavy_rain_vol;
  }
  else mx.message("Error: key unrecognized");
}

function set_rain_sound_vol(type, index, vol) {
  if (type == "light") mx.set_sound_vol(light_rain_sounds[index], vol);
  else if (type == "med") mx.set_sound_vol(med_rain_sounds[index], vol);
  else if (type == "heavy") mx.set_sound_vol(heavy_rain_sounds[index], vol);
}

function stop_rain_sound(type, index) {
  if (type == "light") mx.stop_sound(light_rain_sounds[index]);
  else if (type == "med") mx.stop_sound(med_rain_sounds[index]);
  else if (type == "heavy") mx.stop_sound(heavy_rain_sounds[index]);
}

function move_rain_pos(type, index) {
  if (type == "light") mx.set_sound_pos(light_rain_sounds[index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
  else if (type == "med") mx.set_sound_pos(med_rain_sounds[index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
  else if (type == "heavy") mx.set_sound_pos(heavy_rain_sounds[index], cam_pos_arr[0], cam_pos_arr[1], cam_pos_arr[2]);
}

function frame_handler(seconds) {
  g_running_order = mx.get_running_order();
  updateCamPosition();
  do_thunder_and_lightning();
  do_rain();
  frame_handler_prev(seconds);
}

var frame_handler_prev = mx.frame_handler;
mx.frame_handler = frame_handler;

function randomIntFromInterval(min, max) {return Math.floor(Math.random() * (max - min) + min);}
function randomNumFromInterval(min,max) {return Math.random() * (max - min) + min;}