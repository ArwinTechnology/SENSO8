/*
 * Copyright 2025 Arwin Technology Limited
 *
 * LRS20800 - weight sensor payload decoder
 * The Things Network
 * 
*/

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
      bytes: [0x0d, 0x00]
    };
  }
  else if (input.data.cmd === 'getAlertThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x0d, 0x01]
    };
  }
  else if (input.data.cmd === 'getDownlinkTaringResults') {
    return {
      fPort: 21,
      bytes: [0x0d, 0x02]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult  = input.data.dataUploadInterval;
    var dack = 1;
    if (isNumber(ult)) {
      return {
        fPort: 22,
        bytes: payload.concat(0x0d,
                              (ult>>8)&0xff,ult&0xff,
                              dack)
      };
    }
  }
  else if (input.data.cmd === 'setAlertThresholdSettings') {
    var weightlowth = input.data.weightLowThreshold;
    if (isFloat(weightlowth)) {
      weightlowth = Math.floor(parseFloat(weightlowth) * 100);
      return {
        fPort: 23,
        bytes: payload.concat(0x0d,
                              (weightlowth >> 8) & 0xff,weightlowth & 0xff)
      };
    }
  }
  else if (input.data.cmd === 'setDownlinkTaring') {
    return {
      fPort: 24,
      bytes: [0x0d, 0x00]
    };
  }
}


