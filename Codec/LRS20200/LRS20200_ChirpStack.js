/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS20200 - temperature sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs20200_events = ['heartbeat/button', 'rsvd', 'temperature_high', 'temperature_low', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];

function hex2int16(hex) {
  var dec = hex&0xFFFF;
  if (dec & 0x8000)
    dec = -(0x10000-dec);
  return dec;
}

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
        case 2: //LRS20200
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs20200_events[i];
              else
                evt=evt+","+lrs20200_events[i];
          }
          return {
            "event": evt,
            "battery": bytes[2],
            "temperature": hex2int16(bytes[3]<<8 | bytes[4])/10
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
    case 12: // device settings
      switch (bytes[0]) {
        case 2: //LRS20200
          return {
            "dataUploadInterval": hex2int16(bytes[1]<<8 | bytes[2])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
      break;
    case 13: // threshold settings
      switch (bytes[0]) {
        case 2: //LRS20200
          return { 
            "highTemperatureThreshold": hex2int16(bytes[1]<<8 | bytes[2]),
            "lowTemperatureThreshold":  hex2int16(bytes[3]<<8 | bytes[4])
          };
        default:
          return { 
            "error": "unknown sensor type"
          };
      }
      break;
    case 16: // delta mode settings
      switch (bytes[0]) {
        case 2: //LRS20200
          return { 
            "maximumSilentTime": hex2int16(bytes[1]<<8 | bytes[2]),
            "deltaTemperature":  hex2int16(bytes[3]<<8 | bytes[4])/10,
            "samplingTime":      hex2int16(bytes[5]<<8 | bytes[6]),
            "repeat":            hex2int16(bytes[7])
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
  if (input.fPort === 20){
    if (input.data.cmd === "getFirmwareVersion"){
      return {
        bytes : [0]
      };
    }
  }

  else if (input.fPort === 21){
    if (input.data.cmd === "getDeviceSettings"){
      return {
        bytes : [2, 0]
      };
    }
    else if (input.data.cmd === "getThresholdSettings"){
      return {
        bytes : [2, 1]
      };
    }
    else if (input.data.cmd === "getDeltaModeSettings"){
      return {
        bytes : [2, 3]
      };
    }
  }

  else if (input.fPort === 22){
    if (input.data.cmd === "setDeviceSettings"){
      var mode = 0;
      var ult = input.data.dataUploadInterval;
      var dack = 1;
      if (isNumber(ult)){
        return {
          bytes : [2,
                   mode,
                   (ult>>8)&0xff, ult&0xff,
                   dack]
        };
      }
    }
  }

  else if (input.fPort === 23){
    if (input.data.cmd === "setThresholdSettings"){
      var htth = input.data.highTemperatureThreshold;
      var ltth = input.data.lowTemperatureThreshold;
      if (isNumber(htth) && isNumber(ltth)){
        return {
          bytes : [2,
                   (htth>>8)&0xff, htth&0xff,
                   (ltth>>8)&0xff, ltth&0xff]
        };
      }
    }
  }

  else if (input.fPort === 26){
    if (input.data.cmd === "setDeltaModeSettings"){
      var mst     = input.data.maximumSilentTime;
      var delta_t = input.data.deltaTemperature*10;
      var sample  = input.data.samplingTime;
      var rpt     = input.data.repeat;
      if (isNumber(mst) && isNumber(delta_t) && isNumber(sample) && isNumber(rpt) && (rpt >= 0) && (rpt <= 10)) {
        return {
          bytes : [2,
                   (mst    >>8)&0xff, mst    &0xff,
                   (delta_t>>8)&0xff, delta_t&0xff,
                   (sample >>8)&0xff, sample &0xff,
                   rpt]
        };
      }
    }
  }
}


