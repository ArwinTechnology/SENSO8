var lrs40ld0_events = ['heartbeat/button', 'rsvd', 'state_alert', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd']

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
        case 11: // LRS40LD0
          var evt="";
          for (let i=0; i<8; i++) {
          if ((0x01<<i)&input.bytes[1]) 
            if (evt==="")
              evt=lrs40ld0_events[i];
            else
              evt=evt+","+lrs40ld0_events[i];
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
    case 12: // device settings
      switch (input.bytes[0]) {
        case 11: // LRS40LD0
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
        case 11: // LRS40LD0
          return {
            data: {
              distanceThreshold: (input.bytes[1]<<8|input.bytes[2])/10,
              negativeDelta: (input.bytes[3]<<8|input.bytes[4])/10,
              positiveDelta: (input.bytes[5]<<8|input.bytes[6])/10,
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
      bytes: [0x0b, 0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x0b, 0x01]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult  = input.data.dataUploadInterval;
    var dack = 1;
    if (isNumber(ult)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x0b,
                              (ult>>8)&0xff,ult&0xff,
                              dack)
      }
    };
  }
  else if (input.data.cmd === 'setAlertThresholds') {
    var distth    = input.data.distanceThreshold;
    var delta_neg = input.data.distanceNegativeDelta;
    var delta_pos = input.data.distancePositiveDelta;
    if (isFloat(distth) & isFloat(delta_neg) & isFloat(delta_pos)) {
      distth = Math.floor(parseFloat(distth) * 10);
      delta_neg = Math.floor(parseFloat(delta_neg) * 10);
      delta_pos = Math.floor(parseFloat(delta_pos) * 10);
      return {
        fPort: 23,
        bytes: payload.concat(0x0b,
                              (distth   >>8)&0xff,distth   &0xff,
                              (delta_neg>>8)&0xff,delta_neg&0xff,
                              (delta_pos>>8)&0xff,delta_pos&0xff)
      }
    }
  }
}
