/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS20600 - open close sensor payload decoder
 * ChirpStack v3 and v4
 *
*/

var lrs20600_events = ['heartbeat/button', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'nc, falling edge trigger',        'no, rising edge trigger',
                               'nc, rising/falling edge trigger', 'no, rising/falling edge trigger'];

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
          }
          if (bytes.length > 6) {
            var reading = ( bytes[6] << 24 | bytes[7] << 16 | bytes[8] << 8 | bytes[9] ) +
                          ( bytes[4] << 8  | bytes[5] ) / Math.pow( 10, bytes[10] );
            return {
              data: {
                event: evt,
                battery: bytes[2],
                inputStatus: bytes[3] ? "close" : "open",
                meterReading: reading
              }
            };
          }
          else {
            return {
              data: {
                event: evt,
                battery: bytes[2],
                inputStatus: bytes[3] ? "close" : "open",
                eventCount: bytes[4]<<8|bytes[5]
              }
            };
          }
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
    case 9: // version, battery & uplink count
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);
      return {
        "firmwareVersion": ver,
        "batteryLevel": bytes[4]<<8|bytes[5],
        "batteryPercentage": bytes[6],
        "uplinkCount": bytes[7]<<24|bytes[8]<<16|bytes[9]<<8|bytes[10]
      };
    case 12: // device settings
      switch (bytes[0]) {
        case 4: //LRS20600
          return {
            "dataUploadInterval": (bytes[1]<<8|bytes[2]),
            "triggerMode": (bytes[3]<5)?trigger_mode[bytes[3]]:trigger_mode[0],
            "triggerDeafTime": (bytes[4]<<8|bytes[5])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 13: // dry contact settings
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
      break;
    case 16: // pulse counter mode settings
      switch (bytes[0]) {
        case 4:
          return {
            data: {
              "pulseCountMode": bytes[1] ? 'enable' : 'disable',
              "maxDigit": bytes[2],
              "resolution": bytes[3],
              "initialReadingInteger": bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7],
              "initialReadingDecimal": bytes[8] << 8 | bytes[9]
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes
      };
    default:
      return {
        "error":"invalid port number"
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

function isNumber(value){
  return typeof value === 'number';
}

function encodeDownlink(input) {
  switch (input.fPort){
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
          bytes : [4, 0]
        };
      }
      else if (input.data.cmd === "getThresholdSettings"){
        return {
          bytes : [4, 1]
        };
      }
      break;
    case 22:
      if (input.data.cmd === "setDeviceSettings"){
        var ult = input.data.dataUploadInterval;
        var mode = input.data.triggerMode;
        var deaf = input.data.deafTime;
        var dack = 1;
        if (isNumber(ult) && isNumber(mode) && isNumber(deaf) && (mode > 0) && (mode < 5)) {
          return {
            bytes : [4,
                     mode,
                     (ult>>8)&0xff, ult&0xff,
                     (deaf>>8)&0xff, deaf&0xff,
                     dack]
          };
        }
      }
      break;
    case 23:
      if (input.data.cmd === "setInputConfiguration"){
        var en = input.data.inputEnable;
        if ((en === "enable") || (en === "disable")){
          en = en === "enable" ? 1 : 0;
          return {
            bytes : [04, en]
          };
        }
      }
  }
  // remarks: if error will be informed by the system if input is incorrect
}

