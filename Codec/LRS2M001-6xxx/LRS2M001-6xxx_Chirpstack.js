/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS2M001-6xxx - daul dry-contact input and output payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs2m001_6xxx_in_events = ['heartbeat/button', 'backup_batt_low', 'ch1_trigger', 'ch2_trigger', 'backup power', 'rsvd', 'rsvd', 'rsvd'];
var lrs2m001_6xxx_out_events = ['heartbeat/button', 'backup_batt_low', 'backup power', 'rsvd', 'rsvd', 'rsvd', 'rsvd', 'rsvd'];
var trigger_mode = ['unknown', 'NC, falling edge trigger',        'NO, rising edge trigger',
                               'NC, rising/falling edge trigger', 'NO, rising/falling edge trigger'];

// ChirpStack v4 wrapper
function decodeUplink(input) {
  var decoded = Decode(input.fPort, input.bytes);
  return { 
    data: decoded 
  };
}

// ChirpStack v3
function Decode(fPort, bytes) {
  switch (fPort) {
    case 10: // sensor data
      switch (bytes[0]) {
        case 7: //LRS2M001-6xxx inputs reading
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i) & bytes[1]) 
              if (evt==="")
                evt=lrs2m001_6xxx_in_events[i];
              else
                evt=evt+","+lrs2m001_6xxx_in_events[i];
          };
          return { 
            "event": evt,
            "battery": bytes[2],
            "input1Status": (bytes[3] ? "close" : "open"),
            "input1EventCount":(bytes[4]<<8 | bytes[5]),
            "input2Status": (bytes[6] ? "close" : "open"),
            "input2EventCount":(bytes[7]<<8 | bytes[8])
          };
        case 8: //LRS2M001-6xxx output report
          var evt="";
          for (var i=0; i<8; i++) {
            if ((0x01<<i) & bytes[1]) 
              if (evt==="")
                evt=lrs2m001_6xxx_out_events[i];
              else
                evt=evt+","+lrs2m001_6xxx_out_events[i];
          };
          return  {
            "event": evt,
            "battery": bytes[2],
            "outputState": (bytes[3] ? "close" : "open")
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 8: // firmware version
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);
      return {
        "firmwareVersion": ver
      };
    case 11: // output settings
      switch (bytes[0]) {
        case 8:
          return {
            "defaultOutputState": (bytes[1] ? "close" : "open"),
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 12: // device settings
      switch (bytes[0]) {
        case 7: // LRS2M001-6xxx inputs settings
          return {
            "dataUploadInterval": (bytes[1]<<8 | bytes[2]),
            "input1TriggerMode": (bytes[3] < 5) ? trigger_mode[bytes[3]] : trigger_mode[0],
            "input1TriggerDeafTime": (bytes[4]<<8|bytes[5]),
            "input2TriggerMode": (bytes[6] < 5) ? trigger_mode[bytes[6]] : trigger_mode[0],
            "input2TriggerDeafTime": (bytes[7]<<8 | bytes[8])
          };
        default:
          return {
            "error": "unknown sensor type"
          };
      }
    case 13: // alert settings
      switch (bytes[0]) {
        case 7: //LRS20600
          return { 
            "input1Enabled": (bytes[1] ? 'enable': 'disable'),
            "input2Enabled": (bytes[2] ? 'enable': 'disable')
          };
        default:
          return { 
            "error": "unknown sensor type"
          };
      }
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes 
      };
    default:
      return { 
        "error":"invalid port number"
      };
  }
}

function isNumber(value) {
  return typeof value === 'number';
}

function encodeDownlink(input) {
  var payload = [];

  switch (input.fPort){
    // ---------- //
    //  Port: 20  //
    // ---------- //
    case 20:
      if (input.data.cmd === 'getFirmwareVersion') {
        return {
       // fPort: 20,
          bytes: [0x00]
        };
      }
    // ---------- //
    //  Port: 21  //
    // ---------- //
    case 21:
      if (input.data.cmd === 'getDeviceInputSettings') {
        return {
       // fPort: 21,
          bytes: [0x07, 0x00]
        };
      }
      else if (input.data.cmd === 'getInputAlertSettings') {
        return {
       // fPort: 21,
          bytes: [0x07, 0x01]
        };
      }
      else if (input.data.cmd === 'getDeviceOutputSettings') {
        return {
       // fPort: 21,
          bytes: [0x08, 0x00]
        };
      }
    // ---------- //
    //  Port: 22  //
    // ---------- //
    case 22:
      if (input.data.cmd === 'setDeviceInputSettings') {
        var ult = input.data.dataUploadInterval;
        var dack = 1;
        if (isNumber(ult)) {
          return {
         // fPort: 22,
            bytes: payload.concat(0x07,
                                  (ult>>8)&0xff,ult&0xff,
                                  dack)
          };
        }
      }
      else if (input.data.cmd === 'setDeviceOutputSettings') {
        var dsts = input.data.defaultOutputState;
        var dack = 1;
        if ((dsts === 'close') | (dsts === 'open')) {
          return {
         // fPort: 22,
            bytes: payload.concat(0x08,
                                  (dsts === 'close')+0,
                                  dack)
          };
        }
      }
    // ---------- //
    //  Port: 23  //
    // ---------- //
    case 23:
      if (input.data.cmd === 'setInput1Settings') {
        var mode = input.data.triggerMode;
        var deaf = input.data.deafTime;
        if ((mode > 0) & (mode < 5) & isNumber(deaf)) {
          return {
         // fPort: 23,
            bytes: payload.concat(0x07,
                                  mode,
                                  (deaf>>8)&0xff,deaf&0xff)
          };
        }
      }
      else if (input.data.cmd === 'setOutputState') {
        var sts = input.data.outputState;
        if ((sts === 'close') | (sts === 'open')) {
          return {
         // fPort: 23,
            bytes: payload.concat(0x08, (sts === 'close')+0)
          };
        }
      }
    // ---------- //
    //  Port: 24  //
    // ---------- //
    case 24:
      if (input.data.cmd === 'setInput1AlertSettings') {
        var en = input.data.inputEnable;
        if ((en === 'enable') || (en === 'disable')) {
          return {
         // fPort: 24,
            bytes: payload.concat(0x07, (en === 'enable')+0)
          };
        }
      }
    // ---------- //
    //  Port: 27  //
    // ---------- //
    case 27:
      if (input.data.cmd === 'setInput2Settings') {
        var mode = input.data.triggerMode;
        var deaf = input.data.deafTime;
        if ((mode > 0) & (mode < 5) & isNumber(deaf)) {
          return {
         // fPort: 27,
            bytes: payload.concat(0x07,
                                  mode,
                                  (deaf>>8)&0xff,deaf&0xff)
          };
        }
      }
    // ---------- //
    //  Port: 28  //
    // ---------- //
    case 28:
      if (input.data.cmd === 'setInput2AlertSettings') {
        var en = input.data.inputEnable;
        if ((en === 'enable') || (en === 'disable')) {
          return {
         // fPort: 28,
            bytes: payload.concat(0x07, (en === 'enable')+0)
          };
        }
      }
  }
}