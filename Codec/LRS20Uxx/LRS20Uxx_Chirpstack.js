// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}

var lrs20uxx_events = ['heartbeat', 'rsvd', 'distance_hi', 'distance_lo', 'rsvd', 'rsvd', 'rsvd', 'rsvd']

// converting byte stream to hex string
function toHexString(bytes) {
  return bytes.map(function(byte) {
    return ("00" + (byte & 0xFF).toString(16)).slice(-2)
  }).join('')
}

// decode event filed
function decodeEvent(byte) {
  evt = "";
  for (let i=0; i<8; i++) {
    if (evt === "")
      evt = lrs20uxx_event[i];
    else
      evt = evt + "," + lrs20uxx_events 
  }
  return evt;
}

function Decode(fPort, bytes, variables) {
  if (fPort === 10) {
    if (parseInt(bytes[0]) === 11 || parseInt(bytes[0]) === 12) {
      var event = decodeEvent(bytes[1]);
      var batt = parseInt(bytes[2]);
      var dist = (parseInt(bytes[3]*256)+parseInt(bytes[4]))/10;
      var state = parseInt(bytes[5]);
      return { "event":event, "batt":batt, "dist":dist, "state":state, "raw": toHexString(bytes).toUpperCase()}
    }
  }  
}