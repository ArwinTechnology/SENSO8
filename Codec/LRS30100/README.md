# LRS20100

## Downlink Data

The downlink data is used for updating the sensor settings online. The format of the downlink commands is described as follows.  After issuing a downlink configuration request command, the device will acknowledge with a response/acknowledgment command.

### 1. Device Version Request (Port: 20)

```json
Port: 20
{
  "cmd": "getFirmwareVersion"
}
```

Response

```json
Port: 8
{
  "firmwareVersion": "01.00.000"
}
```

### 2. Device Settings Request (Port: 21)

```json
Port: 21
{
  "cmd": "getDeviceSettings"
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 10,
  "sensorInstalled": { temp_humidity: true, tvoc: true, co2: true, occupancy: true },
  "sensorStatus": { temp_humidity: true, tvoc: true, co2: true, occupancy: true },
  "occupancyWindow": 1
}
```

### 3. Threshold Settings Request (Port: 21)

```json
Port: 21
{
  "cmd": "getThresholdSettings"
}
```

Response

```json
Port: 13
{
  "highTemperatureThreshold": 30,
  "lowTemperatureThreshold": 18,
  "highHumidityThreshold": 80,
  "lowHumidityThreshold": 40,
  "co2Threshold": 1500,
  "tvocThreshold": 1000
}
```

### 4. Adaptive Reporting Mode Settings for T/H Request (Port: 21)

```json
Port: 21
{
  "cmd": "getAdaptiveReportingModeSettings"
}
```

Response

```json
Port: 16
{
  "maxSilentTime": 60,
  "temperatureDelta": 0,
  "humidityDelta": 0,
  "numRedundantPayload": 0,
  "adaptiveReportingMode": "disable"
}
```

### 5. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default |
| :------------------: | :------------------: | :----: | :-----: |
| Data upload interval | "dataUploadInterval" | minute | 10      |
| Occupancy Window     | "occupancyWindows"   | minute | 1       |

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 15,
  "occupancyWindows": 2
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 15,
  "sensorInstalled": { temp_humidity: true, tvoc: true, co2: true, occupancy: true },
  "sensorStatus": { temp_humidity: true, tvoc: true, co2: true, occupancy: true },
  "occupancyWindow": 2
}
```

### 6. Threshold Settings Configuration (Port: 23)

Configurable Settings:

| Settings                   | Key in Port: 23            | Unit   | Default |
| :------------------------: | :------------------------: | :----: | :-----: |
| High temperature threshold | "highTemperatureThreshold" | °C     | 30      |
| Low temperature threhold   | "lowTemperatureThreshold"  | °C     | 18      |
| High Humidity Threshold    | "highHumidityThreshold"    | %      | 70      |
| Low Humidity Threshold     | "lowHumidityThreshold"     | %      | 40      |
| CO2 High Threshold         | "co2Threshold"             | ppm    | 1500    |
| TVOC High Threshold        | "tvocThreshold"            | ug/m3  | 1000    |

Example

```json
Port: 23
{
  "cmd": "setThresholdSettings",
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 71,
  "lowHumidityThreshold": 39,
  "co2Threshold": 1400,
  "tvocThreshold": 950
}
```

Response

```json
Port: 13
{
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 71,
  "lowHumidityThreshold": 39,
  "co2Threshold": 1400,
  "tvocThreshold": 950
}
```
### 7. Adaptive Reporting Mode Settings for T/H Configuration (Port: 26)

Configurable Settings:

| Settings                       | Key in Port: 26           | Unit                 | Default |
| :----------------------------: | :-----------------------: | :------------------: | :-----: |
| Maximum Silent Time            | "maximumSilentTime"       | minute               | 60      |
| Temperature Delta for Uplink   | "deltaTemperature"        | 0.1 °C               | 0       |
| Humidity Delta for Uplink      | "deltaHumidity"           | 0.1 %                | 0       |
| Number of Redundant Payload    | "repeat"                  | --                   | 0       |
| Adaptive Reporting Mode Enable | "adaptiveReportingModeEN" | enable /<br/>disable | disable |

Example

```json
Port: 26
{
  "cmd": "setThresholdSettings",
  "maximumSilentTime": 120,
  "deltaTemperature": 5,
  "deltaHumidity": 5,
  "repeat": 2,
  "adaptiveReportingModeEN": "enable"
}
```

Response

```json
Port: 16
{
  "maxSilentTime": 120,
  "temperatureDelta": 5,
  "humidityDelta": 5,
  "numRedundantPayload": 2,
  "adaptiveReportingMode": "enable"
}
```

