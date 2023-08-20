# Sim Weather
MX Simulator Interactive Rain Weather Project

The MX Simulator script file (frills.js) is only Javascript ES5 compatible, so the following project is coded with Javascript ES5 functionality.
<br>

# General Info

>The track script can be named either "nofrills.js" or "frills.js". The difference is "nofrills.js" is part of the track checksum, so if you want the script to be mandatory you need to name it "nofrills.js".

<br>

>Note: Matrices are stored as 1d arrays in OpenGL order. I.e for a 3x3 matrix the first column is elements 0,1,2, the second column is 3,4,5 and the third column is 6,7,8.

<br>

# Variables

>## **mx.max_slots**
>
>The maximum number of slots.

<br>

>## **mx.first_lap_length**
>
>The number of gates in the first lap.

<br>

>## **mx.normal_lap_length**
>
>The number of gates in any lap after lap 1.

<br>

>## **mx.seconds_per_tic**
>
>The number of seconds in a game tic. Currently 0.0078125 (1/128).

<br>

>## **mx.tics_per_second**
>
>The number of physics steps in a second. Currently 128.

<br>

>## **mx.seconds**
>
>The time since the session started in seconds.

<br>

# Callback Functions

>## **mx.frame_handler(seconds)**
>
>This is called once per frame. "seconds" is the time since the session started in seconds.

<br>

>## **mx.tic_handler(seconds)**
>
>This is called once per physics step. "seconds" is the time since the session started in seconds.

<br>

>## **mx.script_message_handler(msg)**
>
>This is called when a script message is received. "msg" is the message sent by mx.broadcast_script_message() with the player number prepended to it. The player number is the number of players with slot numbers that are less than the sender's slot number.

<br>

# Billboard Functions

>## **mx.find_billboard(texture, start)**
>
>Finds the index of the first billboard that matches the texture. "texture" is the texture filename. "start" is the billboard index to start the search at. Returns the billboard index if successful, otherwise -1.

<br>

>## **mx.add_billboard(x, y, z, size, aspect, texture)**
>
>Adds a billboard. "x", "y" and "z" are the billboard coordinates, with "y" relative to the ground. "size" is how tall the billboard will be. "aspect" is the aspect ratio. "texture" is the texture filename. The return value is the billboard index or -1 if the billboard couldn't be added.

<br>

>## **mx.size_billboard(index, size)**
>
>Sets billboard size. "index" is the billboard index. "size" is the new size for the billboard. Returns 1 if successful, otherwise 0.

<br>

>## **mx.color_billboard(index, r, g, b, a)**
>
>Sets billboard color. "index" is the billboard index. "r", "g", "b" and "a" are the color components. Returns 1 if successful, otherwise 0.

<br>

>## **mx.move_billboard(index, x, y, z)**
>
>Moves the billboard specified by "index" to the coordinates "x", "y", "z". The y coordinate is ground relative. Returns 1 if successful, otherwise 0.

<br>

>## **mx.move_billboard_absolute**
>
>Moves the billboard specified by "index" to the coordinates "x", "y", "z". Returns 1 if successful, otherwise 0.

<br>

# Statue Functions

>## **mx.add_statue(x, y, z, angle, model, texture, shape)**
>
>Adds a statue. "x", "y" and "z" are the statue coordinates, with "y" relative to the ground. "angle" is the yaw angle. "model" is the model filename. "texture" is the texture filename. "shape" is the collision/shape filename (currently ignored). This function only works during the initial load and will fail if called from a hook afterwards. Returns the statue index or -1 if the statue couldn't be added.

<br>

>## **mx.find_statue(model, texture, start)**
>
>Finds the index of the first statue that matches the model and texture. "model" is the model filename. "texture" is the texture filename. "start" is the statue index to start the search at. If you use an empty string for either "model" or "texture" it will match all models/textures. Returns the statue index if successful, otherwise -1.

<br>

>## **mx.move_statue(index, x, y, z, a)**
>
>Moves the statues specified by "index" to the coordinates "x", "y", "z" and sets the angle to "a". The y coordinate is ground relative. Statues with shp files are currently not movable. Returns 1 if successful, otherwise 0.

<br>

>## **mx.move_statue_absolute(index, x, y, z, r)**
>
>Moves the statues specified by "index" to the coordinates "x", "y", "z" and sets the rotation to "r", where "r" is a 3x3 matrix in a 9 element array. Statues with shp files are currently not movable. Returns 1 if successful, otherwise 0.

<br>

# Pose Functions

>## **mx.cache_pose_sequence(anim)**
>
>Creates a pose sequence and returns the sequence index. "anim" is an object with these properties:
>
>     {
>       frame_count: 1, /* The number of frames in the pose sequence */
>       bone_count: 1, /* The number of bones */
>       rest_centers: [
>         /*
>          The rest positions of the bones.
>          This is an array of bone_count * 3.
>         */
>         0.0, 0.0, 0.0
>       ],
>       poses: [
>         /*
>          Array of frame_count poses.
>         */
>         {
>           centers: [
>             /*
>              The positions of the bones for this pose.
>              This is an array of bone_count * 3.
>             */
>             0.0, 0.0, 0.0
>           ],
>           rotations: [
>             /*
>              The orientations of the bones for this pose.
>              This is an array of bone_count * 3 * 3.
>             */
>             1.0, 0.0, 0.0,
>             0.0, 1.0, 0.0,
>             0.0, 0.0, 0.0
>           ]
>         }
>       ]
>     }
>
>The easy way to make this is with the [pose export script](https://forum.mxsimulator.com/viewtopic.php?f=7&t=53316) in Blender.

<br>

>## **mx.pose_statue(index, nbones, c, t, r)**
>
>Poses the statue specified by "index". "nbones" is the number of bones. "c" is a "nbones" * 3 element array that gives the rest positions of the bones. "t" is a "nbones" * 3 element array that gives the translated positions of the bones. "r" is a "nbones" * 3 * 3 element array that gives the rotations of the bones. Returns 1 if successful, otherwise 0.

<br>

>## **mx.pose_statue_from_sequence(index, sequence, frame)**
>
>Poses the state specified by "index". "sequence" is a sequence cache index obtained from mx.cache_pose_sequence(). "frame" is the frame number in the sequence to set the pose to. If "frame" is not an integer it will interpolate between the two closest frames. Returns 1 if successful, otherwise 0.

<br>

# Texture Rendering Functions

>## **mx.begin_custom_frame(tid)**
>
>Clears and prepares an animated texture for drawing. "tid" is the texture ID of the animated texture. Returns 1 if successful, otherwise 0.

<br>

>## **mx.end_custom_frame(tid)**
>
>Uploads a custom frame to the texture.

<br>

>## **mx.paste_custom_frame(tid, frame, sx, sy, dx, dy, w, h)**
>
>This copies a subsection from a frame of an animated texture to its target texture. "w" and "h" are the width and height of the area to copy. "sx" and "sy" are the source coordinates and "dx" and "dy" are the destination coordinates. All coordinates are in whole image units where 0 is the minimum and 1 is the maximum. Returns 1 if successful, otherwise 0.

<br>

# Sound Functions

>## **mx.add_sound(filename)**
>
>Adds a sound. "filename" is the filename for the sound samples which should be in headerless signed 16 bit format. Returns the sound index or -1 if the sound couldn't be added.

<br>

>## **mx.set_sound_freq(index, freq)**
>
>Sets the sound frequency. "index" is the sound index. "freq" is the frequency in samples per second. Returns 1 if successful, otherwise 0.

<br>

>## **mx.set_sound_loop(index, loop)**
>
>Sets sound looping. "index" is the sound index. "loop" is 1 for a repeating loop or 0 to play once and stop. Returns 1 if successful, otherwise 0.

<br>

>## **mx.set_sound_pos(index, x, y, z)**
>
>Sets sound position. "index" is the sound index. "x", "y" and "z" are the coordinates for the sound. Returns 1 if successful, otherwise 0.

<br>

>## **mx.set_sound_vel(index, x, y, z)**
>
>Sets sound velocity. "index" is the sound index. "x", "y" and "z" are the new components of the velocity vector of the sound. Returns 1 if successful, otherwise 0.

<br>

>## **mx.set_sound_vol(index, volume)**
>
>Sets the sound volume. "index" is the sound index. "volume" is the new volume. Returns 1 if successful, otherwise 0.

<br>

>## **mx.start_sound(index)**
>
>Starts a sound. "index" is the sound index. Returns 1 if successful, otherwise 0.

<br>

>## **mx.stop_sound(index)**
>
>Stops a sound. "index" is the sound index. Returns 1 if successful, otherwise 0.

<br>

# Misc Functions

>## **mx.gate_from_timing_position(timing_index)**
>
>Returns the gate number associated with "timing_index".

<br>

>## **mx.get_bike_model(slot)**
>
>Returns the bike model for "slot". (Not a 3d mesh but rather a model number like "yz125".) Returns an empty string if the slot is invalid.

<br>

>## **mx.get_camera_location(p, r)**
>
>Stores the camera position in "p" and the camera orientation in "r". The position is a 3 element array and the orientation is a 3x3 matrix stored as a 9 element array.

<br>

>## **mx.get_elevation(x, z)**
>
>Returns the terrain height at location "x", "z".

<br>

>## **mx.get_finish_laps()**
>
>Returns the number of laps in the race. (Meaning the number of laps to complete after the finish time expires.)

<br>

>## **mx.get_finish_time()**
>
>Returns the finish time in seconds. (Meaning the amount of time before it starts counting finish laps.)

<br>

>## **mx.get_front_contact_depth(slot)**
>
>Returns the contact depth of the front tire for slot number "slot" or 0 if the slot is not valid.

<br>

>## **mx.get_front_contact_position(slot, p)**
>
>Stores the contact patch position for the front tire. "slot" is the slot number. "p" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_front_contact_slip(slot, v)**
>
>Stores the velocity of the tire at the front tire's contact patch. "slot" is the slot number. "v" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_front_contact_velocity(slot, v)**
>
>Stores the velocity of the front tire's contact patch. "slot" is the slot number. "v" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_gate_drop_time()**
>
>Returns the gate drop time in seconds. If the gate has not dropped yet, returns -1.

<br>

>## **mx.get_player_slot()**
>
>Returns the player's slot number.

<br>

>## **mx.get_rear_contact_depth(slot)**
>
>Returns the contact depth of the rear tire for slot number "slot" or 0 if the slot is not valid.

<br>

>## **mx.get_rear_contact_position(slot, p)**
>
>Stores the contact patch position for the rear tire. "slot" is the slot number. "p" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_rear_contact_slip(slot, v)**
>
>Stores the velocity of the tire at the rear tire's contact patch. "slot" is the slot number. "v" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_rear_contact_velocity(slot, v)**
>
>Stores the velocity of the front tire's contact patch. "slot" is the slot number. "v" is the array where the 3 element vector will be stored. Returns 1 if successful, otherwise 0.

<br>

>## **mx.get_rider_down(slot)**
>
>Returns 1 if the rider in "slot" is causing a yellow flag, otherwise 0.

<br>

>## **mx.get_rider_name(slot)**
>
>Returns the rider's name for "slot" or an empty string if there is no rider for that slot.

<br>

>## **mx.get_rider_number(slot)**
>
>Returns the rider's number for "slot" as a string or an empty string if there is no rider for that slot.

<br>

>## **mx.get_running_count()**
>
>Returns the number of riders.

<br>

>## **mx.get_running_order_position(n)**
>
>Returns the number of timing gates passed by the rider in the position specified by "n" in the running order. If "n" is out of range returns 0.

<br>

>## **mx.get_running_order_slot(n)**
>
>Returns the slot number of the rider in the position specified by "n" in the running order. If "n" is out of range returns 0.

<br>

>## **mx.get_running_order_time(n)**
>
>Returns the time in tics when the rider in the position specified by "n" in the running order passed the last timing gate. If "n" is out of range returns 0.

<br>

>## **mx.get_tile_number(x, z)**
>
>Returns the tile number at position "x", "z".

<br>

>## **mx.get_timing(slot, timing_index)**
>
>Returns the time in seconds when the rider hit the gate specified by "timing_index" or -1 on error.

<br>

>## **mx.get_timing_position(slot)**
>
>Returns the number of gates passed by "slot" or -1 if the slot is invalid.

<br>

>## **mx.message(msg)**
>
>Writes "msg" to the console.

<br>

>## **mx.read_texture(filename)**
>
>Reads the texture from "filename" and returns the texture ID. Returns 0 on failure.

<br>

>## **mx.broadcast_script_message(message)**
>
>Sends a script message to the server. By default, the server will prepend the player number of the sender to the message and send the resulting message to all clients. The player number is the number of players with slot numbers that are less than the sender's slot number.

<br>

>## **mx.index_to_lap(timing_index)**
>
>Returns the zero based lap number for "timing_index", where "timing_index" is the number of gates passed.

<br>

>## **mx.lap_to_index(lap)**
>
>Returns the timing index at the start of the specified lap.

<br>

>## **mx.get_position(slot)**
>
>Returns the position of the bike in the specified slot in a 3 element array. Returns null for an invalid slot.

<br>

>## **mx.get_velocity(slot)**
>
>Returns the velocity of the bike in the specified slot in a 3 element array. Returns null for an invalid slot.

<br>

>## **mx.get_running_order()**
>
>Returns an array of objects representing the running order. Each object has the following properties: "slot" - the slot number, "position" - the number of gates passed, "time" - the time when the last gate was hit in seconds.