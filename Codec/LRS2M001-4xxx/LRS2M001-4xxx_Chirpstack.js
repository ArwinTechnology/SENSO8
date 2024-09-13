/*
 * Copyright 2024 Arwin Technology Limited
 *
 * LRS2M001 - 3-phase power meter payload decoder
 * ChirpStack v3 and v4
 * 
*/

var lrs2m001_meter_events = ['heartbeat/button', 'backup power', 'ph_C_under_V', 'ph_C_over_V', 'ph_B_under_V', 'ph_B_over_V', 'ph_A_under_V', 'ph_A_over_V', 'backup_batt_low'];
var lrs2m001_phase_events = ['over_current','heartbeat/button'];
var decoded;

function hex2int22(hex) {
  var dec = hex&0x3fffff;
  if (dec & 0x200000)
    dec = -(0x400000-dec);
  return dec;
}

function decodePhaseData(bytes, channel, phase) {
  if (bytes[0] === 0x0a) { 
    var evt_amp = bytes[1]<<8 | bytes[2];
    var pow_pf = bytes[3]<<24 | bytes[4]<<16 | bytes[5]<<8 | bytes[6];
    var evt="";
    for (let i=0; i<2; i++) {
      if ((0x01<<i) & (evt_amp>>14))
        if (evt==="")
          evt=lrs2m001_phase_events[i];
        else
          evt=evt+","+lrs2m001_phase_events[i];
    }
    return {
      "channel": channel,
      "phase": phase,
      "event": evt,
      "current": (evt_amp & 0x3fff)/10,
      "active_pow": hex2int22(pow_pf>>10)/10,
      "power_factor": (pow_pf & 0x03ff)/1000,
      "active_energy": (bytes[7]<<24 | bytes[8]<<16 | bytes[9]<<8 | bytes[10])/10
    }
  }
  else {
    return {
      "error": 'unknown packet type'
    };
  }
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
    case 10: // meter data
      var freq_evt = bytes[7]<<16 | bytes[8]<<8 | bytes[9];      
      var evt="";
      for (let i=0; i<10; i++) {
        if ( (0x01<<i) & freq_evt ) 
          if (evt==="")
            evt=lrs2m001_meter_events[i];
          else
            evt=evt+","+lrs2m001_meter_events[i];
      }
      return {
        "event": evt,
        "phase_A_V": (bytes[1]<<8 | bytes[2])/10,
        "phase_B_V": (bytes[3]<<8 | bytes[4])/10,
        "phase_C_V": (bytes[5]<<8 | bytes[6])/10,
        "freq": freq_evt>>10,
        "backup_batt": bytes[10],
      };
    case 50:
      decoded = decodePhaseData(bytes, 1, 'A');
      return decoded;
    case 51:
      decoded = decodePhaseData(bytes, 1, 'B');
      return decoded;
    case 52:
      decoded = decodePhaseData(bytes, 1, 'C');
      return decoded;
    case 53:
      decoded = decodePhaseData(bytes, 2, 'A');
      return decoded;
    case 54:
      decoded = decodePhaseData(bytes, 2, 'B');
      return decoded;
    case 55:
      decoded = decodePhaseData(bytes, 2, 'C');
      return decoded;
    case 56:
      decoded = decodePhaseData(bytes, 3, 'A');
      return decoded;
    case 57:
      decoded = decodePhaseData(bytes, 3, 'B');
      return decoded;
    case 58:
      decoded = decodePhaseData(bytes, 3, 'C');
      return decoded;
    case 59:
      decoded = decodePhaseData(bytes, 4, 'A');
      return decoded;
    case 60:
      decoded = decodePhaseData(bytes, 4, 'B');
      return decoded;
    case 61:
      decoded = decodePhaseData(bytes, 4, 'C');
      return decoded;
    case 8: // version
      var ver = bytes[0]+"."+("00"+bytes[1]).slice(-2)+"."+("000"+(bytes[2]<<8|bytes[3])).slice(-3);    
      return {
        "firmwareVersion": ver,
      };
    case 16: // device settings
      if (bytes[0] === 0x0a) {    
        return {
          "dataUploadInterval": bytes[1]<<8 | bytes[2],
          "underVoltageLimit": bytes[3]<<8 | bytes[4],
          "overVoltageLimit": bytes[5]<<8 | bytes[6],
          "overCurrentLimit": (bytes[7]&0x80) ? ((bytes[7]&0x7F)<<8 | bytes[8])/10 
                                              :  bytes[7]<<8 | bytes[8],
        };  
      }
      else {
        return {
          "error": 'unknown packet type'
        };
      }      
      break;
    case 17: // device settings
      if (bytes[0] === 0x0a) {    
        return {
          "overCurrentLatency": bytes[1]<<8 | bytes[2],
          "normalCurrentLatency": bytes[3]<<8 | bytes[4],
          "uplinkAlertClear": bytes[5] ? "enabled" : "disabled",
        };  
      }
      else {
        return {
          "error": 'unknown packet type'
        };
      }      
      break;
    case 0: // MAC command
      return { // dummy return to avoid error on v4 event log
        "input": bytes 
      }  
    default:
      return {
        "error": "invalid port number"
      };
  }
}
