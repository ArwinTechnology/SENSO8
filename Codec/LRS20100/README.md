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
  "dataUploadInterval": 10
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

### 4. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default |
| :------------------: | :------------------: | :----: | :-----: |
| Data upload interval | "dataUploadInterval" | minute | 10      |

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 15
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 15
}
```

### 5. Temperature/Humidity Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                   | Key in Port: 23            | Unit   | Default |
| :------------------------: | :------------------------: | :----: | :-----: |
| High temperature threshold | "highTemperatureThreshold" | °C     | 30      |
| Low temperature threhold   | "lowTemperatureThreshold"  | °C     | 18      |
| High Humidity Threshold    | "highHumidityThreshold"    | %      | 70      |
| Low Humidity Threshold     | "lowHumidityThreshold"     | %      | 40      |

Example

```json
Port: 23
{
  "cmd": "setThresholdSettings",
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 71,
  "lowHumidityThreshold": 39
}
```

Response

```json
Port: 13
{
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
  "highHumidityThreshold": 71,
  "lowHumidityThreshold": 39
}
```

