var lrs20600_events = ['heartbeat/button', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'NC, falling edge trigger',        'NO, rising edge trigger',
                               'NC, rising/falling edge trigger', 'NO, rising/falling edge trigger'];

function hex2dec(hex) {
  var dec = hex&0xFFFF;
  if (dec & 0x8000)
    dec = -(0x10000-dec)
  return dec;
}

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 4:
          var evt= "";
          for (let i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1]) 
              if (evt==="")
                evt=lrs20600_events[i];
              else
                evt=evt+","+lrs20600_events[i];
          }
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              inputStatus: input.bytes[3] ? "close" : "open",
              eventCount: hex2dec(input.bytes[4]<<8|input.bytes[5]),
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
        case 4:
          return {
            data: {
              dataUploadInterval: hex2dec(input.bytes[1]<<8|input.bytes[2]),
              triggerMode: (input.bytes[3] < 5) ? trigger_mode[input.bytes[3]] : trigger_mode[0],
              triggerDeafTime: hex2dec(input.bytes[4]<<8|input.bytes[5]),
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          }
      }
      case 13: // threshold settings
      switch (input.bytes[0]) {
        case 4:
          var state = input.bytes[1] ? 'enable': 'disable'
          return {
            data: {
              inputEnabled: state,
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
