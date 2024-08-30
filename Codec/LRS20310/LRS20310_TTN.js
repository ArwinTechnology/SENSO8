var lrs20310_events = ['heartbeat/button', 'rsvd', 'water_leak_alert', 'cable_break_alert', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];

function hex2dec(hex) {
  var dec = hex&0xFFFF;
  if (dec & 0x8000)
    dec = -(0x10000-dec)
  return dec;
}

function isNumber(value) {
  return typeof value === 'number';
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 5:
          var evt="";
          for (let i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1]) 
              if (evt==="")
                evt=lrs20310_events[i];
              else
                evt=evt+","+lrs20310_events[i];
          }
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              waterLeakLevel: input.bytes[3],
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
        case 5:
          return {
            data: {
              dataUploadInterval: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              numAdditionalUploads: input.bytes[4],
              additionalUploadsInterval: input.bytes[5],
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          }
      }
      case 13: // threshold settings
      switch (input.bytes[0]) {
        case 5:
          return {
            data: {
              waterLeakAlertThreshold: input.bytes[1],
            }
          }
        default:
          return {
            errors: ['unknown sensor type']
          }
      }
    default:
      return {
        errors: ['unknown FPort'],
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
      bytes: [0x05, 0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x05, 0x01]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var mode = 0;
    var ult  = input.data.dataUploadInterval;
    var rpt  = input.data.repeatUpload;
    var rpi  = input.data.repeatInterval;
    var dack = 1;
    if (isNumber(ult) & isNumber(rpt) & isNumber(rpi)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x05,
                              mode,
                              (ult>>8)&0xff,ult&0xff,
                                            rpt&0xff,
                                            rpi&0xff,
                              dack)
      }
    }
  }
  else if (input.data.cmd === 'setAlertThresholds') {
    var lvth = input.data.alertThreshold;
    if (isNumber(lvth)) {
      if ((lvth >= 15) & (lvth <= 100)) {
        return {
          fPort: 23,
          bytes: [0x05, lvth]
        }
      }
    }
  }
}
