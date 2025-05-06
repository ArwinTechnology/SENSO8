/*
 * Copyright 2025 Arwin Technology Limited
 *
 * LRS30100 - Indoor Environmental Sensor payload decoder
 * ChirpStack v3 and v4
 * 
*/

// ChirpStack v4 wrapper
function decodeUplink(input) {
  var decoded = Decode(input.fPort, input.bytes);
  return { 
    data: decoded
  };
}

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
  if ((byte & 0x01) !== 0) events.push("heartbeat");
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
function Decode(fPort, bytes) {
  var decoded = {};

  if (bytes === null || typeof bytes === 'undefined') {
      decoded.error = "Invalid input: bytes are null or undefined.";
      return decoded;
  }
   if (typeof fPort !== 'number') {
      decoded.error = "Invalid input: fPort is not a number.";
      return decoded;
   }

  switch (fPort) {
    // === Data Reporting ===
    case 10:
       if (bytes.length !== 8) {
            decoded.error = "Port 10: Invalid payload length: " + bytes.length + " (expected 8)";
            return decoded;
        }
        decoded.event = getActiveEventsPort10(bytes[0]);
        decoded.temperature = readInt16BE(bytes, 1) / 10.0;
        decoded.humidity = readUint16BE(bytes, 3) / 10.0;
        decoded.uplinkID = bytes[7];
        break;

    case 11:
        // *** CORRECTED LENGTH CHECK ***
        if (bytes.length !== 10) {
            decoded.error = "Port 11: Invalid payload length: " + bytes.length + " (expected 10)";
            return decoded;
        }
        decoded.event = getActiveEventsPort11(bytes[0]);
        decoded.co2 = readUint16BE(bytes, 1);
        decoded.tvoc = readUint16BE(bytes, 3);
        var occ_raw = bytes[5];
        decoded.occupancy = (occ_raw === 1) ? "Occupied" : "Unoccupied";
        decoded.lightIntensity = readUint16BE(bytes, 6); // Bytes 6-7
        // Bytes 8-9 are Reserved and ignored
        break;

    // === Configuration/Status Reporting ===
    case 8:
        if (bytes.length !== 4) {
            decoded.error = "Port 8: Invalid payload length: " + bytes.length + " (expected 4)";
            return decoded;
        }
        var xx  = ("00"  +              bytes[ 0]).slice(-2);
        var yy  = ("00"  +              bytes[ 1]).slice(-2);
        var zzz = ("000" + readUint16BE(bytes, 2)).slice(-3);
        decoded.firmwareVersion = xx + "." + yy + "." + zzz;
        break;

    case 9:
        if (bytes.length !== 11) {
             decoded.error = "Port 9: Invalid payload length: " + bytes.length + " (expected 11)";
             return decoded;
        }
        var fw_xx  = ("00"  +              bytes[ 0]).slice(-2);
        var fw_yy  = ("00"  +              bytes[ 1]).slice(-2);
        var fw_zzz = ("000" + readUint16BE(bytes, 2)).slice(-3);
        decoded.firmwareVersion = fw_xx + "." + fw_yy + "." + fw_zzz;
        decoded.batteryLevel = readUint16BE(bytes, 4);
        decoded.batteryPercentage = bytes[6];
        var ul_cnt = readUint32BE(bytes, 7);
        if (ul_cnt !== null) {
            decoded.uplink_count = ul_cnt;
        } else {
            decoded.uplink_count_error = "Could not read uplink count (insufficient bytes)";
        }
        break;

    case 12:
        if (bytes.length !== 6) {
            decoded.error = "Port 12: Invalid payload length: " + bytes.length + " (expected 6)";
            return decoded;
        }
        decoded.dataUploadInterval = readUint16BE(bytes, 0);
        decoded.sensorInstalled = getInstalledSensors(bytes[2]);
        decoded.sensorStatus = getFunctionalSensors(bytes[3]);
        decoded.occupancyWindow = bytes[4];
        break;

    case 13:
        if (bytes.length !== 10) {
            decoded.error = "Port 13: Invalid payload length: " + bytes.length + " (expected 10)";
            return decoded;
        }
        decoded.highTemperatureThreshold = readInt16BE(bytes, 0);
        decoded.lowTemperatureThreshold = readInt16BE(bytes, 2);
        decoded.highHumidityThreshold = bytes[4];
        decoded.lowHumidityThreshold = bytes[5];
        decoded.co2Threshold = readUint16BE(bytes, 6);
        decoded.tvocThreshold = readUint16BE(bytes, 8);
        break;

     case 16:
        if (bytes.length !== 8) {
            decoded.error = "Port 16: Invalid payload length: " + bytes.length + " (expected 8)";
            return decoded;
        }
        decoded.maxSilentTime = readUint16BE(bytes, 0);
        decoded.temperatureDelta = readUint16BE(bytes, 2) / 10.0;
        decoded.humidityDelta = readUint16BE(bytes, 4) / 10.0;
        decoded.noRedundantPayload = bytes[6];
        var adtr_en_raw = bytes[7];
        decoded.adaptiveReportingMode = (adtr_en_raw === 1) ? "enable" : "disable";
        break;

    default:
      decoded.error = "Unknown fPort: " + fPort;
      break;
  }

  return decoded;
}
