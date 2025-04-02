/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS20600 - open close sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs20600_events = ['heartbeat/button', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'NC, falling edge trigger',        'NO, rising edge trigger',
                               'NC, rising/falling edge trigger', 'NO, rising/falling edge trigger'];
// ChirpStack v4 wrapper
function decodeUplink(input) {
  var decoded = Decode(input.fPort, input.bytes);
  return { 
    data: decoded
  };
}

// ChirpStack v3
function Decode(fPort, bytes) {
  switch (fPort) {
    case 10: // sensor data
      switch (bytes[0]) {
        case 4: //LRS20600
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs20600_events[i];
              else
                evt=evt+","+lrs20600_events[i];
          };
          return { 
            "event": evt,
            "battery": bytes[2],
            "inputStatus": (bytes[3]?"close":"open"),
            "eventCount":(bytes[4]<<8|bytes[5])
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
        case 4: //LRS20600
          return {
            "dataUploadInterval": (bytes[1]<<8|bytes[2]),
            "triggerMode": (bytes[3] < 5) ? trigger_mode[bytes[3]] : trigger_mode[0],
            "triggerDeafTime": (bytes[4]<<8|bytes[5])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 13: // alert settings
      switch (bytes[0]) {
        case 4: //LRS20600
          var state = bytes[1] ? 'enable': 'disable';
          return { 
            "inputEnabled":state
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
        "error":"invalid port number"
      };
  }
}
