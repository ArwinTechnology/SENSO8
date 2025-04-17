/*
 * Copyright 2025 Arwin Technology Limited
 *
 * LRS20800 - weight sensor payload decoder
 * The Things Network
 * 
*/

var lsr20800_events = ['heartbeat/button', 'rsvd', 'state_alert', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var lrs20800_taken  = ['never_performed', 'success', 'not_success'];

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 13:
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1]) 
              if (evt==="")
                evt=lsr20800_events[i];
              else
                evt=evt+","+lsr20800_events[i];
          }
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              weight: (input.bytes[3]<<8 | input.bytes[4])/100
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 8: // version
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      return {
        data: {
          firmwareVersion: ver
        }
      };
    case 9: // status
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      var battery_level = (input.bytes[4]<<8 | input.bytes[5]);
      var battery_percentage = input.bytes[6];
      var uplink_count = input.bytes[7]<<24 | input.bytes[8]<< 16 | input.bytes[9]<<8 | input.bytes[10];
      return {
        data: {
          firmwareVersion: ver,
          batteryLevel: battery_level,
          batteryPercentage: battery_percentage,
          uplinkCount: uplink_count
        }
      };
    case 12: // device settings
      switch (input.bytes[0]) {
        case 13:
          return {
            data: {
              dataUploadInterval: input.bytes[1]<<8|input.bytes[2]
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 13: // threshold settings
      switch (input.bytes[0]) {
        case 13:
          return {
            data: {
              weightLowThreshold: (input.bytes[1]<<8 | input.bytes[2])/100
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 14: // delta mode settings
      switch (input.bytes[0]) {
        case 13:
          return {
            data: {
              downlinkTaring: lrs20800_taken[      input.bytes[1]],
              weightBefore:   (input.bytes[2]<<8 | input.bytes[3])/100,
              weightAfter:    (input.bytes[4]<<8 | input.bytes[5])/100
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    default:
      return {
        errors: ['unknown FPort']
      };
  }
}


