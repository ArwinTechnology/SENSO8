/*
 * Copyright 2025 Arwin Technology Limited
 *
 * LRS20800 - weight sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs20800_events = ['heartbeat/button', 'rsvd', 'weight_low_alert', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var lrs20800_taken  = ['never_performed', 'success', 'not_success'];

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
        case 13: //LRS20800
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs20800_events[i];
              else
                evt=evt+","+lrs20800_events[i];
          }
          return {
            "event": evt,
            "battery": bytes[2],
            "weight": (bytes[3]<<8 | bytes[4])/100
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 8: // firmware version
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);
      return {
        "firmwareVersion": ver
      };
    case 9: // device status
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);
      var battery_level = (bytes[4]<<8 | bytes[5]);
      var battery_percentage = bytes[6];
      var uplink_count = bytes[7]<<24 | bytes[8]<< 16 | bytes[9]<<8 | bytes[10];
      return {
        "firmwareVersion": ver,
        "batteryLevel": battery_level,
        "batteryPercentage": battery_percentage,
        "uplinkCount": uplink_count
      };      
    case 12: // device settings
      switch (bytes[0]) {
        case 13: //LRS20800
          return { 
            "dataUploadInterval": (bytes[1]<<8 | bytes[2])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 13: // threshold settings
      switch (bytes[0]) {
        case 13: //LRS20800
          return { 
            "weightLowThreshold": (bytes[1]<<8 | bytes[2])/100
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 14: // taring settings
      switch (bytes[0]) {
        case 13: //LRS20800
          return { 
            "taringState": lrs20800_taken[bytes[1]],
            "weightBeforeTaring":   (bytes[2]<<8 | bytes[3])/100,
            "weightAfterTaring":    (bytes[4]<<8 | bytes[5])/100
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes 
      };
    default:
      return {
        "error": "invalid port number"
      };
  }
}

// Encode downlink function.
//
// Input is an object with the following fields:
// - data = Object representing the payload that must be encoded.
// - variables = Object containing the configured device variables.
//
// Output must be an object with the following fields:
// - bytes = Byte array containing the downlink payload.

function isNumber(num){
  return typeof num === 'number';
}

function isFloat(value) {
  if (typeof value === 'string') {
    for (var i = 0; i < value.length; i++) {
      if (!("0123456789.".includes(value[i]))) {
         return false;
      }   
    }   
    return true;
  }
  return false;
}

function encodeDownlink(input) {
  switch (input.fPort) {
    case 20: 
      if (input.data.cmd === "getFirmwareVersion"){
        return {
          bytes : [0]
        };
      }
      break;
     
    case 21: 
      if (input.data.cmd === "getDeviceSettings"){
        return {
          bytes : [0x0d, 0]
        };
      }
      else if (input.data.cmd === "getAlertThresholdSettings"){
        return {
          bytes : [0x0d, 1]
        };
      }
      else if (input.data.cmd === "getDownlinkTaringResults"){
        return {
          bytes : [0x0d, 2]
        };
      }
      break;
      
    case 22: 
      if (input.data.cmd === "setDeviceSettings"){
        var ult = input.data.dataUploadInterval;
        var dack = 1;
        if (isNumber(ult)){
          return {
            bytes : [0x0d, 
                     (ult>>8)&0xff, ult&0xff,
                     dack]
          };
        }
      }
      break;
      
    case 23:
      if (input.data.cmd === "setAlertThresholdSettings"){
        var weightlowth = input.data.weightLowThreshold;
        if (isFloat(weightlowth)){
          weightlowth = Math.floor(parseFloat(weightlowth) * 100);
          return {
            bytes: [0x0d,
                    (weightlowth>>8)&0xff, weightlowth&0xff]
          };
        }
      }
      break;
      
    case 24:
      if (input.data.cmd === "setDownlinkTaring"){
        return {
          bytes : [0x0d, 0]
        };
      }
  }
}

