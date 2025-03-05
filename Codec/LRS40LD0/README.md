# LRS40LD0

## Downlink Data

The downlink data is used for updating the sensor settings online. The format of the downlink commands is described as follows.  After issuing a downlink configuration request command, the device will acknowledge with a response/acknowledgment command.

### 1. Device Version Request (Port: 20)

#### Command
Port: 20
```json
{
  "cmd": "getFirmwareVersion"
}
```

#### Response
Port: 8
```json
{
  "firmwareVersion": 1.04.000
}
```

### 2. Device Settings Request (Port: 21)

#### Command
Port: 21
```json
{
  "cmd": "getDeviceSettings"
}
```

#### Response
Port: 12
```json
{
  "dataUploadInterval": 15
}
```

### 3. Threshold & Delta Settings Request (Port: 21)

#### Command
Port: 21
```json
{
  "cmd": "getThresholdSettings"
}
```

#### Response
Port: 13
```json
{
  "distanceThreshold": 100,
  "negativeDelta": 10,
  "positiveDelta": 0
}
```

### 4. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default |
| :------------------: | :------------------: | :----: | :-----: |
| Data upload interval | "dataUploadInterval" | minute | 15      |

Example

#### Command
Port: 22
```json
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 10
}
```

#### Response
Port: 12
```json
{
  "dataUploadInterval": 10
}
```

### 5. Occupancy Alert Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                | Key in Port: 23         | Unit   | Default |
| :---------------------: | :---------------------: | :----: | :-----: |
| Distance threshold      | "distanceThreshold"     | cm     | 100     |
| Distance negative delta | "distanceNegativeDelta" | cm     | 10      |
| Distance positive delta | "distancePositiveDelta" | cm     | 0       |

Example

#### Command
Port: 23
```json
{
  "cmd": "setAlertThresholds",
  "distanceThreshold": 42.5,
  "distanceNegativeDelta": 2.5,
  "distancePositiveDelta": 2.5
}
```

#### Response
Port: 13
```json
{
  "distanceThreshold": 42.5,
  "negativeDelta": 2.5,
  "positiveDelta": 2.5
}
```


