/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS10701 - indoor air quality sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs10701_events = ['heartbeat/button', 'rsvd', 'T/H', 'CO2', 'EC1', 'EC2', 'TVOC', 'PMx'];
var sensor_list = ['T/H', 'TVOC', 'CO2', 'PMx', 'Gas1', 'Gas2'];
var gas_sensor_type = ['None', 'NH3', 'H2S', 'NO2', 'CO', 'HCHO', 'Custom'];

function hex2dec(hex) {
  var dec = hex&0xffff;
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
      var evt="";
      for (var i=0; i<8; i++) {
        if ((0x01<<i)&bytes[0]) 
          if (evt==="")
            evt=lrs10701_events[i];
          else
            evt=evt+","+lrs10701_events[i];
      }      
      var aqi_co2_t = bytes[1]<<24|bytes[2]<<16|bytes[3]<<8|bytes[4];
      var aqi    = (aqi_co2_t>>23)&0x1ff;
      var co2    = (aqi_co2_t>>10)&0x1fff;
      var temp   = (hex2dec(aqi_co2_t&0x3ff)-300)/10;
      var hum    = bytes[5]*0.5;
      var ec_res = bytes[10]>>7;
      var batt   = bytes[10]&0x7f;
      if (ec_res === 1) {
        var gas1 = (bytes[6]<<8|bytes[7])/10;
        var gas2 = (bytes[8]<<8|bytes[9])/10;
      } 
      else {
        var gas1 = (bytes[6]<<8|bytes[7])/1000;
        var gas2 = (bytes[8]<<8|bytes[9])/1000;
      }
      return {
        "event": evt,
        "aqi": aqi,
        "co2": co2,
        "temperature": temp,
        "humidity": hum,
        "gas1": gas1,
        "gas2": gas2,
        "battery":batt
      };
    case 11: // sensor data
      var tvoc = bytes[0]<<8|bytes[1];
      var pm1_0 = (bytes[2]<<16|bytes[3]<<8|bytes[4])/1000;
      var pm2_5 = (bytes[5]<<16|bytes[6]<<8|bytes[7])/1000;
      var pm10  = (bytes[8]<<16|bytes[9]<<8|bytes[10])/1000;
      return {
        "tvoc": tvoc,
        "pm1.0": pm1_0,
        "pm2.5": pm2_5,
        "pm10": pm10
      }
    case 8: // version
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);    
      return { 
        "firmwareVersion": ver
      }
    case 12: // device settings
      var sensor_type="";
      var sensor_ok="";
      for (var i=0; i<8; i++) {
        if ((0x01<<i)&bytes[3]) 
          if (sensor_ok==="")
            sensor_type=sensor_list[i];
          else
            sensor_type=sensor_type+","+sensor_list[i];
        if ((0x01<<i)&bytes[4]) 
          if (sensor_ok==="")
            sensor_ok=sensor_list[i];
          else
            sensor_ok=sensor_ok+","+sensor_list[i];
      }
      var ult = bytes[0]<<8|bytes[1];
      var led = bytes[2] === 1 ? "on" : "off"
      var typ = sensor_type
      var sts = sensor_ok
      var g1t = bytes[5] < 6 ? gas_sensor_type[bytes[5]] : "unknown";
      var g2t = bytes[6] < 6 ? gas_sensor_type[bytes[6]] : "unknown";
      return {
        "dataUploadInterval": ult,
        "statusLED": led,
        "sensorType": typ,
        "sensorStatus": sts,
        "gas1Type": g1t,
        "gas2Type": g2t
      }
    case 13: // threshold settings
      switch (bytes[0]) {
        case 0:
          var htth = hex2dec(bytes[1]<<8 | bytes[2]);
          var ltth = hex2dec(bytes[3]<<8 | bytes[4]);
          var hhth = bytes[5];
          var lhth = bytes[6];          
          return {
            "highTemperatureThreshold": htth,
            "lowTemperatureThreshold": ltth,
            "highHumidityThreshold": hhth,
            "lowHumidityThreshold": lhth
          };
        case 1:
          var co2th  = bytes[1]<<8 | bytes[2];
          var tvocth = bytes[3]<<8 | bytes[4];
          var g1th   = (bytes[5]<<8 | bytes[6])/1000;
          var g2th   = (bytes[7]<<8 | bytes[8])/1000;
          return {
            "co2Threshold": co2th,
            "tvocThreshold": tvocth,
            "gas1Threshold": g1th,
            "gas2Threshold": g2th 
          };
        case 2:
          var pm1p0th = bytes[1]<<16 | bytes[2]<<8 | bytes[3];
          var pm2p5th = bytes[4]<<16 | bytes[5]<<8 | bytes[6];
          var pm10th  = bytes[7]<<16 | bytes[8]<<8 | bytes[9];
          return {
            'pm1.0 Threshold': pm1p0th,
            'pm2.5 Threshold': pm2p5th,
            'pm10 Threshold': pm10th 
          };
        case 3:
          var co2th  = bytes[1]<<8 | bytes[2];
          var tvocth = bytes[3]<<8 | bytes[4];
          var g1th   = (bytes[5]<<8 | bytes[6])/10;
          var g2th   = (bytes[7]<<8 | bytes[8])/10;
          return {
            "co2Threshold": co2th,
            "tvocThreshold": tvocth,
            "gas1Threshold": g1th,
            "gas2Threshold": g2th
          };         
        default:
          return {
            "error": "unknown packet type"
          }
        };
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes 
      }  
    default:
      return {
        "error": "invalid port number"
      }
  }
}

