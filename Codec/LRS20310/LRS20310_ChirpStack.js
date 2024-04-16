
/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS20310 - water leak sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs20310_events = ['heartbeat', 'rsvd', 'water_leak_alert', 'cable_break_alert'];

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
        case 5: //LRS20310
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs20310_events[i];
              else
                evt=evt+","+lrs20310_events[i];
          };
          return { 
            "event": evt,
            "battery": bytes[2],
            "waterLeakLevel": bytes[3]
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
        case 5: //LRS20310
          return { 
            "dataUploadInterval": (bytes[1]<<8 | bytes[2]),
            "numAdditionalUploads": bytes[4],
            "additionalUploadsInterval": bytes[5]
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 13: // threshold settings
      switch (bytes[0]) {
        case 5: //LRS20310
          return { 
            "waterLeakAlertThreshold": bytes[1]
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
