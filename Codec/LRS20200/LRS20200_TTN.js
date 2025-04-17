var lrs20200_events = ['heartbeat/button', 'rsvd', 'temperature_high', 'temperature_low', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];

function hex2dec(hex) {
  var dec = hex&0xFFFF;
  if (dec & 0x8000)
    dec = -(0x10000-dec);
  return dec;
}

function isNumber(value) {
  return typeof value === 'number';
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 2: // LRS20200
          var evt="";
          for (var i=0; i<8; i++) {
          if ((0x01<<i)&input.bytes[1]) 
            if (evt==="")
              evt=lrs20200_events[i];
            else
              evt=evt+","+lrs20200_events[i];
          }
          if (bytes.length < 9) {
            return {
              data: {
                event: evt,
                battery: input.bytes[2],
                temperature: hex2dec(input.bytes[3]<<8|input.bytes[4])/10
              }
            };  
          }
          else {      // uplink count introduced in 1.06.000
            return {
              data: {
                event: evt,
                battery: input.bytes[2],
                temperature: hex2dec(input.bytes[3]<<8|input.bytes[4])/10,
                uplinkCount: hex2int16(bytes[7]<<8 | bytes[8])
              }
            }; 
          }
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
    case 9: // device status
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);
      var batt_level = input.bytes[4]<<8 | input.bytes[5];
      var batt_percent = input.bytes[6];
      var uplink_count = input.bytes[7]<<24 | input.bytes[8]<< 16 | input.bytes[9]<<8 | input.bytes[10];
      return {
        data: {
          firmwareVersion: ver,
          batteryLevel: batt_level,
          batteryPercentage: batt_percent,
          uplinkCount: uplink_count
        }
      };
    case 12: // device settings
      switch (input.bytes[0]) {
        case 2:
          return {
            data: {
              dataUploadInterval: hex2dec(input.bytes[1]<<8|input.bytes[2])
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
        case 2:
          return {
            data: {
              highTemperatureThreshold: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              lowTemperatureThreshold:  hex2dec(input.bytes[3]<<8|input.bytes[4])
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 16: // delta mode settings
      switch (input.bytes[0]) {
        case 2:
          return {
            data: {
              maximumSilentTime: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              deltaTemperature:  hex2dec(input.bytes[3]<<8|input.bytes[4])/10,
              samplingTime:      hex2dec(input.bytes[5]<<8|input.bytes[6]),
              repeat:            hex2dec(input.bytes[7])
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

function encodeDownlink(input) {
  var payload = [];

  if (input.data.cmd === 'getFirmwareVersion') {
    return {
      fPort: 20,
      bytes: [0x00]
    };
  }
  else if (input.data.cmd === 'getDeviceSettings') {
    return {
      fPort: 21,
      bytes: [0x02, 0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x02, 0x01]
    };
  }
  else if (input.data.cmd === 'getDeltaModeSettings') {
    return {
      fPort: 21,
      bytes: [0x02, 0x03]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var mode = 0;
    var ult  = input.data.dataUploadInterval;
    var dack = 1;
    if (isNumber(ult)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x02,
                              mode,
                              (ult>>8)&0xff,ult&0xff,
                              dack)
      };
    }
  }
  else if (input.data.cmd === 'setThresholdSettings') {
    var htth = input.data.highTemperatureThreshold;
    var ltth = input.data.lowTemperatureThreshold;
    if (isNumber(htth) && isNumber(ltth)) {
      return {
        fPort: 23,
        bytes: payload.concat(0x02,
                              (htth>>8)&0xff,htth&0xff,
                              (ltth>>8)&0xff,ltth&0xff)
      };
    }
  }
  else if (input.data.cmd === 'setDeltaModeSettings') {
    var mst     = input.data.maximumSilentTime;
    var delta_t = input.data.deltaTemperature*10;
    var sample  = input.data.samplingTime;
    var rpt     = input.data.repeat;
    if (isNumber(mst) && isNumber(delta_t) && isNumber(sample) && isNumber(rpt) && (rpt >= 0) && (rpt <= 10)) {
      return {
        fPort: 26,
        bytes: payload.concat(0x02,
                              (mst    >>8)&0xff,mst    &0xff,
                              (delta_t>>8)&0xff,delta_t&0xff,
                              (sample >>8)&0xff,sample &0xff,
                              rpt)
      };
    }
  }
}


