# LRS20200

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
  "lowTemperatureThreshold": 18
}
```

### 4. Delta Mode Settings Request (Port: 21)

```json
Port: 21
{
  "cmd": "getDeltaModeSettings"
}
```

Response

```json
Port: 16
{
  "maximumSilentTime": 60,
  "deltaTemperature": 0,
  "samplingTime": 5,
  "repeat": 0
}
```

### 5. Device Settings Configuration (Port: 22)

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

### 6. Temperature Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                   | Key in Port: 23            | Unit   | Default |
| :------------------------: | :------------------------: | :----: | :-----: |
| High temperature threshold | "highTemperatureThreshold" | °C     | 30      |
| Low temperature threhold   | "lowTemperatureThreshold"  | °C     | 18      |

Example

```json
Port: 23
{
  "cmd": "setThresholdSettings",
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17
}
```

Response

```json
Port: 13
{
  "highTemperatureThreshold": 31,
  "lowTemperatureThreshold": 17,
}
```

### 7. Temperature Delta Mode Configuration (Port: 26)

Configurable Settings:

| Settings            | Key in Port: 26     | Unit   | Default |
| :-----------------: | :-----------------: | :----: | :-----: |
| Maximun silent time | "maximumSilentTime" | minute | 60      |
| Delta temperature   | "deltaTemperature"  | °C     | 0       |
| Sampling            | "samplingTime"      | minute | 5       |
| Repeat              | "repeat"            | --     | 0       |

Example

```json
Port: 26
{
  "cmd": "setDeltaModeSettings",
  "maximumSilentTime": 120,
  "deltaTemperature": 2,
  "samplingTime": 10,
  "repeat": 2
}
```

```json
Port: 16
{
  "maximumSilentTime": 120,
  "deltaTemperature": 2,
  "samplingTime": 10,
  "repeat": 2
}
```

