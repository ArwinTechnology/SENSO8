//
// LRS30100 - environment sensor payload decoder
//

function readUint16BE(bytes, offset) {
  if (offset + 1 >= bytes.length) {
     // Return a value indicating error or default. 0 is used here.
     return 0;
  }
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readInt16BE(bytes, offset) {
  var value = readUint16BE(bytes, offset);
  if ((value & 0x8000) !== 0) {
    value = value - 0x10000;
  }
  return value;
}

function readUint32BE(bytes, offset) {
    if (offset + 3 >= bytes.length) {
        return null;
    }
    return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

function getActiveEventsPort10(byte) {
  var events = [];
  if ((byte & 0x01) !== 0) events.push("heartbeat/button");
  if ((byte & 0x02) !== 0) events.push("temperature_high");
  if ((byte & 0x04) !== 0) events.push("temperature_low");
  if ((byte & 0x08) !== 0) events.push("humidity_high");
  if ((byte & 0x10) !== 0) events.push("humidity_low");
  if ((byte & 0x20) !== 0) events.push("th_change");
  if ((byte & 0x80) !== 0) events.push("redundant_payload");
  return events;
}

function getActiveEventsPort11(byte) {
  var events = [];
  if ((byte & 0x01) !== 0) events.push("heartbeat/button");
  if ((byte & 0x02) !== 0) events.push("co2_high");
  if ((byte & 0x04) !== 0) events.push("tvoc_high");
  return events;
}

function getInstalledSensors(byte) {
  var installed = {};
  if ((byte & 0x01) !== 0) installed.temp_humidity = true;
  if ((byte & 0x02) !== 0) installed.tvoc = true;
  if ((byte & 0x04) !== 0) installed.co2 = true;
  if ((byte & 0x10) !== 0) installed.occupancy = true;
  if ((byte & 0x20) !== 0) installed.light = true;
  return installed;
}

function getFunctionalSensors(byte) {
  var functional = {};
  if ((byte & 0x01) !== 0) functional.temp_humidity = true;
  if ((byte & 0x02) !== 0) functional.tvoc = true;
  if ((byte & 0x04) !== 0) functional.co2 = true;
  if ((byte & 0x10) !== 0) functional.occupancy = true;
  if ((byte & 0x20) !== 0) functional.light = true;
  return functional;
}

// ChirpStack v3 Entry Point
function decodeUplink(input) {
  var decoded = {};

  if (input.bytes === null || typeof input.bytes === 'undefined') {
      decoded.error = "Invalid input: bytes are null or undefined.";
      return decoded;
  }
   if (typeof input.fPort !== 'number') {
      decoded.error = "Invalid input: fPort is not a number.";
      return decoded;
   }

  switch (input.fPort) {
    // === Data Reporting ===
    case 10:
       if (input.bytes.length !== 8) {
            decoded.error = "Port 10: Invalid payload length: " + input.bytes.length + " (expected 8)";
            return decoded;
        }
        decoded.data = {};
        decoded.data.event = getActiveEventsPort10(input.bytes[0]);
        decoded.data.temperature = readInt16BE(input.bytes, 1) / 10.0;
        decoded.data.humidity = readUint16BE(input.bytes, 3) / 10.0;
        decoded.data.uplinkID = input.bytes[7];
        break;

    case 11:
        // *** CORRECTED LENGTH CHECK ***
        if (input.bytes.length !== 10) {
            decoded.error = "Port 11: Invalid payload length: " + input.bytes.length + " (expected 10)";
            return decoded;
        }
        decoded.data = {};
        decoded.data.event = getActiveEventsPort11(input.bytes[0]);
        decoded.data.co2 = readUint16BE(input.bytes, 1);
        decoded.data.tvoc = readUint16BE(input.bytes, 3);
        var occ_raw = input.bytes[5];
        decoded.data.occupancy = (occ_raw === 1) ? "Occupied" : "Unoccupied";
        decoded.data.lightIntensity = readUint16BE(input.bytes, 6); // Bytes 6-7
        // Bytes 8-9 are Reserved and ignored
        break;

    // === Configuration/Status Reporting ===
    case 8:
        if (input.bytes.length !== 4) {
            decoded.error = "Port 8: Invalid payload length: " + input.bytes.length + " (expected 4)";
            return decoded;
        }
        var xx  = ("00"  +              input.bytes[ 0]).slice(-2);
        var yy  = ("00"  +              input.bytes[ 1]).slice(-2);
        var zzz = ("000" + readUint16BE(input.bytes, 2)).slice(-3);
        decoded.data = {};
        decoded.data.firmwareVersion = xx + "." + yy + "." + zzz;
        break;

    case 9:
        if (input.bytes.length !== 11) {
             decoded.error = "Port 9: Invalid payload length: " + input.bytes.length + " (expected 11)";
             return decoded;
        }
        var fw_xx  = ("00"  +              input.bytes[ 0]).slice(-2);
        var fw_yy  = ("00"  +              input.bytes[ 1]).slice(-2);
        var fw_zzz = ("000" + readUint16BE(input.bytes, 2)).slice(-3);
        decoded.data = {};
        decoded.data.firmwareVersion = fw_xx + "." + fw_yy + "." + fw_zzz;
        decoded.data.batteryLevel = readUint16BE(input.bytes, 4);
        decoded.data.batteryPercentage = input.bytes[6];
        var ul_cnt = readUint32BE(input.bytes, 7);
        if (ul_cnt !== null) {
            decoded.data.uplink_count = ul_cnt;
        } else {
            decoded.data.uplink_count_error = "Could not read uplink count (insufficient bytes)";
        }
        break;

    case 12:
        if (input.bytes.length !== 6) {
            decoded.error = "Port 12: Invalid payload length: " + input.bytes.length + " (expected 6)";
            return decoded;
        }
        decoded.data = {};
        decoded.data.dataUploadInterval = readUint16BE(input.bytes, 0);
        decoded.data.sensorInstalled = getInstalledSensors(input.bytes[2]);
        decoded.data.sensorStatus = getFunctionalSensors(input.bytes[3]);
        decoded.data.occupancyWindow = input.bytes[4];
        break;

    case 13:
        if (input.bytes.length !== 10) {
            decoded.error = "Port 13: Invalid payload length: " + input.bytes.length + " (expected 10)";
            return decoded;
        }
        decoded.data = {};
        decoded.data.highTemperatureThreshold = readInt16BE(input.bytes, 0);
        decoded.data.lowTemperatureThreshold = readInt16BE(input.bytes, 2);
        decoded.data.highHumidityThreshold = input.bytes[4];
        decoded.data.lowHumidityThreshold = input.bytes[5];
        decoded.data.co2Threshold = readUint16BE(input.bytes, 6);
        decoded.data.tvocThreshold = readUint16BE(input.bytes, 8);
        break;

     case 16:
        if (input.bytes.length !== 8) {
            decoded.error = "Port 16: Invalid payload length: " + input.bytes.length + " (expected 8)";
            return decoded;
        }
        decoded.data = {};
        decoded.data.maxSilentTime = readUint16BE(input.bytes, 0);
        decoded.data.temperatureDelta = readUint16BE(input.bytes, 2) / 10.0;
        decoded.data.humidityDelta = readUint16BE(input.bytes, 4) / 10.0;
        decoded.data.numRedundantPayload = input.bytes[6];
        var adtr_en_raw = input.bytes[7];
        decoded.data.adaptiveReportingMode = (adtr_en_raw === 1) ? "enable" : "disable";
        break;

    default:
      decoded.error = "Unknown fPort: " + input.fPort;
      break;
  }

  return decoded;
}

function isNumber(value){
  return typeof value === 'number';
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
      bytes: [0x00]
    };
  }
  else if (input.data.cmd === 'getThresholdSettings') {
    return {
      fPort: 21,
      bytes: [0x01]
    };
  }
  else if (input.data.cmd === 'getAdaptiveReportingModeSettings') {
    return {
      fPort: 21,
      bytes: [0x03]
    };
  }
  else if (input.data.cmd === 'setDeviceSettings') {
    var ult  = input.data.dataUploadInterval;
    var owin = input.data.occupancyWindows;
    var dack = 1;
    if (isNumber(ult) && isNumber(owin)) {
      return {
        fPort: 22,
        bytes: [(ult >> 8) & 0xff, ult & 0xff, owin & 0xff, dack]
      };
    }
  }
  else if (input.data.cmd === 'setThresholdSettings') {
    var htth   = input.data.highTemperatureThreshold;
    var ltth   = input.data.lowTemperatureThreshold;
    var hhth   = input.data.highHumidityThreshold;
    var lhth   = input.data.lowHumidityThreshold;
    var co2th  = input.data.co2Threshold;
    var tvocth = input.data.tvocThreshold;
    if (isNumber(htth) && isNumber(ltth) && isNumber(hhth) && isNumber(lhth) && isNumber(co2th) && isNumber(tvocth)) {
      return {
        fPort: 23,
        bytes: [(htth   >> 8) & 0xff, htth   & 0xff,
                (ltth   >> 8) & 0xff, ltth   & 0xff,
                                      hhth   & 0xff,
                                      lhth   & 0xff,
                (co2th  >> 8) & 0xff, co2th  & 0xff,
                (tvocth >> 8) & 0xff, tvocth & 0xff]
      };
    }
  }
  else if (input.data.cmd === 'setAdaptiveReportingModeSettings') {
    var mst     = input.data.maximumSilentTime;
    var delta_t = input.data.deltaTemperature;
    var delta_h = input.data.deltaHumidity;
    var rpt     = input.data.repeat;
    var en      = input.data.adaptiveReportingModeEN;
    if (isNumber(mst) && isNumber(delta_t) && isNumber(delta_h) && isNumber(rpt) && ((en === "enable") || (en === "disable"))) {
      en = (en === "enable") ? 1 : 0;
      return {
        fPort: 26,
        bytes: [(mst     >> 8) & 0xff, mst     & 0xff,
                (delta_t >> 8) & 0xff, delta_t & 0xff,
                (delta_h >> 8) & 0xff, delta_h & 0xff,
                                       rpt     & 0xff, en]
      };
    }
  }
}
