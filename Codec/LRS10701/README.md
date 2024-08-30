# LRS10701

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
  "firmwareVersion": "1.04.000"
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
  "statusLED": "on",
  "sensorStatus": "T/H,CO2,PMx",
  "sensorType": "T/H,CO2,PMx",
  "gas1Type": "NH3",
  "gas2Type": "H2S"
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
  "lowHumidityThreshold": 40
}
```

```json
Port: 13
{
  "co2Threshold": 1500,
  "tvocThreshold": 435,
  "gas1Threshold": 2000,
  "gas2Threshold": 2000
}
```

```json
Port: 13
{
  "pm1.0 Threshold": 0,
  "pm2.5 Threshold": 56,
  "pm10 Threshold": 254
}
```

### 4. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit     | Default |
| :------------------: | :------------------: | :------: | :-----: |
| Data upload interval | "dataUploadInterval" | minute   | 10      |
| LED on/off status    | "statusLED"          | on / off | on      |

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 20,
  "statusLED": "off"
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 20,
  "statusLED": "off",
  "sensorStatus": "T/H,CO2,PMx",
  "sensorType": "T/H,CO2,PMx",
  "gas1Type": "NH3",
  "gas2Type": "H2S"
}
```

### 5. Temperature/Humidity Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                   | Key in Port: 23            | Unit | Default |
| :------------------------: | :------------------------: | :--: | :-----: |
| High Humidity Threshold    | "highTemperatureThreshold" | %    | 30      |
| Low Humidity Threshold     | "lowTemperatureThreshold"  | %    | 18      |
| High temperature threshold | "highHumidityThreshold"    | °C   | 80      |
| Low temperature threhold   | "lowHumidityThreshold"     | °C   | 40      |

Example

```json
Port: 23
{
  "cmd": "setTHThresholds",
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 85,
  "lowHumidityThreshold": 35
}
```

Response

```json
Port: 13
{
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 85,
  "lowHumidityThreshold": 35
}
```

### 6. Gases Threshold Configuration (Port: 23)

Configurable Settings:

| Settings        | Key in Port: 23      | Unit      | Default      |
| :-------------: | :------------------: | :-------: | :----------: |
| CO2 threshold   | "co2Threshold"       | ppm       | 1500         |
| TVOC threshold  | "tvocThreshold"      | ppb       | 435          |
| Gas 1 threshold | "gas1Threshold"      | 0.001 ppm | (See Remark) |
| Gas 2 threshold | "gas2Threshold"      | 0.001 ppm | (See Remark) |

Remark:

| Gas  | Default<br/>(0.001 ppm) |
| :--: | :---------------------: |
| NH3  | 2000                    |
| H2S  | 2000                    |
| NO2  | 360                     |
| CO   | 12400                   |
| HCHO | 200                     |

Example

```json
Port: 23
{
  "cmd": "setGasesThresholds",
  "co2Threshold": 1600,
  "tvocThreshold": 535,
  "gas1Threshold": 750,
  "gas2Threshold": 900
}
```

Response

```json
Port: 13
{
  "co2Threshold": 1600,
  "tvocThreshold": 535,
  "gas1Threshold": 750,
  "gas2Threshold": 900
}

```

### 7. PM Threshold Configuration (Port: 23)

Configurable Settings:

| Settings        | Key in Port: 23  | Unit  | Default |
| :-------------: | :--------------: | :---: | :-----: |
| PM1.0 threshold | "pm1p0Threshold" | ug/m3 | 0       |
| PM2.5 threshold | "pm2p5Threshold" | ug/m3 | 56      |
| PM10 threshold  | "pm10Threshold"  | ug/m3 | 254     |

Example

```json
Port: 23
{
  "cmd": "setPMThresholds",
  "pm1p0Threshold": 1,
  "pm2p5Threshold": 260,
  "pm10Threshold": 600
}
```

Response

```json
Port: 13
{
  "pm1.0 Threshold": 1,
  "pm2.5 Threshold": 260,
  "pm10 Threshold": 600
}
```
