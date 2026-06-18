// Script messages client every timing gate that is hit by a player
import { setCurrentTimingGates } from "./timing-gates";

const frameHandler = (seconds: number) => {
    setCurrentTimingGates();
    frameHandlerPrev(seconds);
}

// This syntax is for when you want to set multiple frame handlers
// If you wish to only have 1 frame handler you do not need frameHandlerPrev at all
const frameHandlerPrev = mx.frame_handler;
mx.frame_handler = frameHandler;

export { }; // Added to examples only to mark as module so doesn't conflict with any code you write
