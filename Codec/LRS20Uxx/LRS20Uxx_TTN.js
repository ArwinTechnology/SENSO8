var lrs20uxx_events = ['heartbeat/button', 'rsvd', 'distance_hi', 'distance_lo', 'rsvd', 'rsvd', 'rsvd', 'rsvd']

function isNumber(value) {
  return typeof value === 'number';
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
function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 12: // LRS20Uxx
          var evt="";
          for (let i=0; i<8; i++) {
          if ((0x01<<i)&input.bytes[1]) 
            if (evt==="")
              evt=lrs20uxx_events[i];
            else
              evt=evt+","+lrs20uxx_events[i];
          };
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              distance: (input.bytes[3]<<8|input.bytes[4])/10,
              state: input.bytes[5],
            },
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
          firmwareVersion: ver,
        }
      };
    case 9: // status
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      var battery_level = (bytes[4]<<8 | bytes[5]);
      var battery_percentage = bytes[6];
      var uplink_count = bytes[7]<<24 | bytes[8]<< 16 | bytes[9]<<8 | bytes[10];
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
        case 12: // LRS20Uxx
          return {
            data: {
              dataUploadInterval: (input.bytes[1]<<8|input.bytes[2]),
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          }
      }
      case 13: // threshold settings
      switch (input.bytes[0]) {
        case 12: // LRS20Uxx
          return {
            data: {
              distanceHighThreshold: hex2dec(input.bytes[1]<<8|input.bytes[2])/10,
              distanceLowThreshold: hex2dec(input.bytes[3]<<8|input.bytes[4])/10,
            }
          }
        default:
          return {
            errors: ['unknown sensor type']
          }
      }
    default:
      return {
        errors: ['unknown fPort'],
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
      bytes: [0x0c, 0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x0c, 0x01]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult  = input.data.dataUploadInterval;
    var dack = 1;
    if (isNumber(ult)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x0c,
                              (ult>>8)&0xff,ult&0xff,
                              dack)
      }
    };
  }
  else if (input.data.cmd === 'setAlertThresholds') {
    var thhi = input.data.thresholdHi;
    var thlo = input.data.thresholdLo;
    if (isFloat(thhi) & isFloat(thlo)) {
      thhi = Math.floor(parseFloat(thhi) * 10);
      thlo = Math.floor(parseFloat(thlo) * 10);
      return {
        fPort: 23,
        bytes: payload.concat(0x0c,
                              (thhi>>8)&0xff,thhi&0xff,
                              (thlo>>8)&0xff,thlo&0xff)
      }
    }
  }
}
