var rain = mx.add_sound("@tracktitanwet/billboard/rain.raw");
mx.set_sound_freq(rain, 44100);
mx.set_sound_vol(rain, 100);
mx.set_sound_loop(rain, 1);
mx.start_sound(rain);

var p = [], r = [];
// Update Cam Positioning for Constant crowd sounds
function updateCamPosition(seconds) {
  // Updates crash sounds to the position of the rider if the track is in a stadium
  // gets and stores the camera location into the p and r array variables
  mx.get_camera_location(p, r);
  mx.message("P: [X: " + p[0].toFixed(3) + " Y: " + p[1].toFixed(3) + " Z: " + p[2].toFixed(3) + "]");
	// Constant crowd sound
	mx.set_sound_pos(rain, p[0], p[1], p[2]);
  updateCamPrev(seconds);
}

var updateCamPositionPrev = mx.frame_handler;
mx.frame_handler = updateCamPosition;