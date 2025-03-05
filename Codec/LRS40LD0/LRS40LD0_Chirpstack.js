/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS40LD0 - occupancy sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs40ld0_events = ['heartbeat/button', 'rsvd', 'state_alert', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd']

// ChirpStack v4 wrapper
function decodeUplink(input) {
  var decoded = Decode(input.fPort, input.bytes);
  return { 
    data: decoded 
  };
}

// ChirpStack v3
function Decode(fPort, bytes, variables) {
  switch (fPort) {
    case 10: // sensor data
      switch (bytes[0]) {
        case 11: //LRS40LD0
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs40ld0_events[i];
              else
                evt=evt+","+lrs40ld0_events[i];
          };
          return {
            "event": evt,
            "battery": bytes[2],
            "distance": (bytes[3]<<8 | bytes[4])/10,
            "state": bytes[5]
          };
        default:
          return {
            "error": "unknown sensor type"
          }
      }
    case 8: // firmware version
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);
      return {
        "firmwareVersion": ver
      };
    case 12: // device settings
      switch (bytes[0]) {
        case 11: //LRS40LD0
          return { 
            "dataUploadInterval": (bytes[1]<<8 | bytes[2])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 13: // threshold settings
      switch (bytes[0]) {
        case 11: //LRS40LD0
          return { 
            "distanceThreshold": (bytes[1]<<8 | bytes[2])/10,
            "negativeDelta": (bytes[3]<<8 | bytes[4])/10,
            "positiveDelta": (bytes[5]<<8 | bytes[6])/10,
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes 
      }
    default:
      return {
        "error": "invalid port number"
      };
  }
}
