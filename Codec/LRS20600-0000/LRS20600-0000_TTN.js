
var lrs20600_events = ['heartbeat/button', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'NC, falling edge trigger',        'NO, rising edge trigger',
                               'NC, rising/falling edge trigger', 'NO, rising/falling edge trigger'];

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
        case 4:
          var evt= "";
          for (var i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1])
              if (evt==="")
                evt=lrs20600_events[i];
              else
                evt=evt+","+lrs20600_events[i];
          }
          if (input.bytes.length > 6) {
            var reading = ( input.bytes[6] << 24 | input.bytes[7] << 16 | input.bytes[8] << 8 | input.bytes[9] ) +
                          ( input.bytes[4] << 8  | input.bytes[5] ) / Math.pow( 10, input.bytes[10] );
            return {
              data: {
                event: evt,
                battery: input.bytes[2],
                inputStatus: input.bytes[3] ? "close" : "open",
                meterReading: reading
              }
            };
          }
          else {
            return {
              data: {
                event: evt,
                battery: input.bytes[2],
                inputStatus: input.bytes[3] ? "close" : "open",
                eventCount: input.bytes[4]<<8|input.bytes[5]
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
    case 9: // version, battery & uplink count
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);
      return {
        data: {
          firmwareVersion: ver,
          batteryLevel: input.bytes[4]<<8|input.bytes[5],
          batteryPercentage: input.bytes[6],
          uplinkCount: input.bytes[7]<<24|input.bytes[8]<<16|input.bytes[9]<<8|input.bytes[10]
        }
      };
    case 12: // device settings
      switch (input.bytes[0]) {
        case 4:
          return {
            data: {
              dataUploadInterval: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              triggerMode: (input.bytes[3] < 5) ? trigger_mode[input.bytes[3]] : trigger_mode[0],
              triggerDeafTime: hex2dec(input.bytes[4]<<8|input.bytes[5])
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 13: // dry contact settings
      switch (input.bytes[0]) {
        case 4:
          var state = input.bytes[1] ? 'enable': 'disable';
          return {
            data: {
              inputEnabled: state
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 16: // pulse counter mode settings
      switch (input.bytes[0]) {
        case 4:
          return {
            data: {
              pulseCountMode: input.bytes[1] ? 'enable' : 'disable',
              maxDigit: input.bytes[2],
              resolution: input.bytes[3],
              initialReadingInteger: input.bytes[4] << 24 | input.bytes[5] << 16 | input.bytes[6] << 8 | input.bytes[7],
              initialReadingDecimal: input.bytes[8] << 8 | input.bytes[9]
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
      bytes: [0x04, 0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x04, 0x01]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult  = input.data.dataUploadInterval;
    var mode = input.data.triggerMode;
    var deaf = input.data.deafTime;
    var dack = 1;
    if (isNumber(ult) && isNumber(mode) && isNumber(deaf) && (mode > 0) && (mode < 5)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x04,
                              mode,
                              (ult >>8)&0xff,ult &0xff,
                              (deaf>>8)&0xff,deaf&0xff,
                              dack)
      };
    }
  }
  else if (input.data.cmd === 'setInputConfiguration') {
    var en = input.data.inputEnable;
    if ((en === 'enable') || (en === 'disable')) {
      return {
        fPort: 23,
        bytes: payload.concat(0x04, (en === 'enable'))
      };
    }
  }
}
