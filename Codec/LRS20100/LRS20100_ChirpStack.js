/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS20100 - temperature and humitidy sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs20100_events = ['heartbeat/button', 'rsvd', 'temperature_high', 'temperature_low', 'humidity_high', 'humidity_low', 'rsvd', 'rsvd'];

function hex2int16(hex) {
  var dec = hex&0xFFFF;
  if (dec & 0x8000)
    dec = -(0x10000-dec)
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
        case 1: //LRS20100
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&bytes[1]) 
              if (evt==="")
                evt=lrs20100_events[i];
              else
                evt=evt+","+lrs20100_events[i];
          };
          return {
            "event": evt,
            "battery": bytes[2],
            "temperature": hex2int16(bytes[3]<<8 | bytes[4])/10,
            "humidity": (bytes[5]<<8 | bytes[6])/10
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
        case 1: //LRS20100
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
        case 1: //LRS20100
          return { 
            "highTemperatureThreshold": hex2int16(bytes[1]<<8 | bytes[2]),
            "lowTemperatureThreshold": hex2int16(bytes[3]<<8 | bytes[4]),
            "highHumidityThreshold": (bytes[5]),
            "lowHumidityThreshold": (bytes[6])
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
