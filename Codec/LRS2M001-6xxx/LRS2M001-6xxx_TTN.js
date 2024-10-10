/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS2M001-6xxx - daul dry-contact input and output payload decoder
 * 
*/

var lrs2m001_6xxx_in_events = ['heartbeat/button', 'backup_batt_low', 'ch1_trigger', 'ch2_trigger', 'backup power', 'rsvd', 'rsvd', 'rsvd'];
var lrs2m001_6xxx_out_events = ['heartbeat/button', 'backup_batt_low', 'backup power', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'NC, falling edge trigger',        'NO, rising edge trigger',
                               'NC, rising/falling edge trigger', 'NO, rising/falling edge trigger'];

function decodeUplink(input) {
  switch (input.fPort) {
    case 10: // sensor data
      switch (input.bytes[0]) {
        case 7: //LRS2M001-6xxx inputs reading
          var evt= "";
          for (let i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1]) 
              if (evt==="")
                evt=lrs2m001_6xxx_in_events[i];
              else
                evt=evt+","+lrs2m001_6xxx_in_events[i];
          };
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              input1Status: input.bytes[3] ? "close" : "open",
              input1EventCount: (input.bytes[4]<<8 | input.bytes[5]),
              input2Status: input.bytes[6] ? "close" : "open",
              input2EventCount: (input.bytes[7]<<8 | input.bytes[8]),
            },
          };
        case 8: //LRS2M001-6xxx output report
          var evt= "";
          for (let i=0; i<8; i++) {
            if ((0x01<<i)&input.bytes[1]) 
              if (evt==="")
                evt=lrs2m001_6xxx_out_events[i];
              else
                evt=evt+","+lrs2m001_6xxx_out_events[i];
          };
          return {
            data: {
              event: evt,
              battery: input.bytes[2],
              outputState: input.bytes[3] ? "close" : "open",
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      break;
    case 8: // f/w version
      var ver = input.bytes[0]+"."+("00"+input.bytes[1]).slice(-2)+"."+("000"+(input.bytes[2]<<8|input.bytes[3])).slice(-3);    
      return {
        data: {
          firmwareVersion: ver
        }
      };
    case 11: // output settings
      switch (input.bytes[0]) {
        case 8:
          return {
            data: {
              defaultOutputState: (input.bytes[1] ? "close" : "open")
            };
          };
        default:
          return {
            errors: ['unknown sensor type']
          };          
      };
    case 12: // device settings
      switch (input.bytes[0]) {
        case 7:
          return {
            data: {
              dataUploadInterval: (input.bytes[1]<<8 | input.bytes[2]),
              input1TriggerMode: (input.bytes[3] < 5) ? trigger_mode[input.bytes[3]] : trigger_mode[0],
              input1TriggerDeafTime: (input.bytes[4]<<8 | input.bytes[5]),
              input2TriggerMode: (input.bytes[6] < 5) ? trigger_mode[input.bytes[6]] : trigger_mode[0],
              input2TriggerDeafTime: (input.bytes[7]<<8 | input.bytes[8]),
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
      case 13: // alert settings
      switch (input.bytes[0]) {
        case 7:
          return {
            data: {
              input1Enabled: (input.bytes[1] ? 'enable': 'disable'),
              input2Enabled: (input.bytes[2] ? 'enable': 'disable')
            }
          };
        default:
          return {
            errors: ['unknown sensor type']
          };
      }
    default:
      return {
        errors: ['unknown FPort'],
      };
  }
}

function isNumber(value) {
  return typeof value === 'number';
}

function encodeDownlink(input) {
  var payload = [];

  // ---------- //
  //  Port: 20  //
  // ---------- //
  if (input.data.cmd === 'getFirmwareVersion') {
    return {
      fPort: 20,
      bytes: [0x00]
    };
  }
  // ---------- //
  //  Port: 21  //
  // ---------- //
  else if (input.data.cmd === 'getDeviceInputSettings') {
    return {
      fPort: 21,
      bytes: [0x07, 0x00]
    };
  }
  else if (input.data.cmd === 'getInputAlertSettings') {
    return {
      fPort: 21,
      bytes: [0x07, 0x01]
    };
  }
  else if (input.data.cmd === 'getDeviceOutputSettings') {
    return {
      fPort: 21,
      bytes: [0x08, 0x00]
    };
  }
  // ---------- //
  //  Port: 22  //
  // ---------- //
  else if (input.data.cmd === 'setDeviceInputSettings') {
    var ult = input.data.dataUploadInterval;
    var dack = 1;
    if (isNumber(ult)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x07,
                              (ult>>8)&0xff,ult&0xff,
                              dack)
      };
    }
  }
  else if (input.data.cmd === 'setDeviceOutputSettings') {
    var dsts = input.data.defaultOutputState;
    var dack = 1;
    if ((dsts === 'close') || (dsts === 'open')) {
      return {
        fPort: 22,
        bytes: payload.concat(0x08,
                              (dsts === 'close')+0,
                              dack)
      };
    }
  }
  // ---------- //
  //  Port: 23  //
  // ---------- //
  else if (input.data.cmd === 'setInput1Settings') {
    var mode = input.data.triggerMode;
    var deaf = input.data.deafTime;
    if ((mode > 0) && (mode < 5) && isNumber(deaf)) {
      return {
        fPort: 23,
        bytes: payload.concat(0x07,
                              mode,
                              (deaf>>8)&0xff,deaf&0xff)
      };
    }
  }
  else if (input.data.cmd === 'setOutputState') {
    var sts = input.data.outputState;
    if ((sts === 'close') || (sts === 'open')) {
      return {
        fPort: 23,
        bytes: payload.concat(0x08, (sts === 'close')+0)
      };
    }
  }
  // ---------- //
  //  Port: 24  //
  // ---------- //
  else if (input.data.cmd === 'setInput1AlertSettings') {
    var en = input.data.inputEnable;
    if ((en === 'enable') || (en === 'disable')) {
      return {
        fPort: 24,
        bytes: payload.concat(0x07, (en === 'enable')+0)
      };
    }
  }
  // ---------- //
  //  Port: 27  //
  // ---------- //
  else if (input.data.cmd === 'setInput2Settings') {
    var mode = input.data.triggerMode;
    var deaf = input.data.deafTime;
    if ((mode > 0) && (mode < 5) && isNumber(deaf)) {
      return {
        fPort: 27,
        bytes: payload.concat(0x07,
                              mode,
                              (deaf>>8)&0xff,deaf&0xff)
      };
    }
  }
  // ---------- //
  //  Port: 28  //
  // ---------- //
  else if (input.data.cmd === 'setInput2AlertSettings') {
    var en = input.data.inputEnable;
    if ((en === 'enable') || (en === 'disable')) {
      return {
        fPort: 28,
        bytes: payload.concat(0x07, (en === 'enable')+0)
      };
    }
  }
}