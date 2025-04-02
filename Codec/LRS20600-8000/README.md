# LRS20800

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

### 3. Weight Alert Threshold Settings Request (Port: 21)

#### Command
Port: 21
```json
{
  "cmd": "getAlertThresholdSettings"
}
```

#### Response
Port: 13
```json
{
  "weightLowThreshold": 0.35
}
```

### 4. Weight Downlink Taring Results Request (Port: 21)

#### Command
Port: 21
```json
{
  "cmd": "getDownlinkTaringResults"
}
```

#### Response
Port: 14
```json
{
  "taringState": "never_performed",
  "weightBeforeTaring": 0,
  "weightAfterTaring": 0
}
```

### 5. Device Settings Configuration (Port: 22)

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

### 6. Weight Alert Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                | Key in Port: 23         | Unit   | Default |
| :---------------------: | :---------------------: | :----: | :-----: |
| Weight Low threshold    | "weightLowThreshold"    | kg     | 0.35    |

Example

#### Command
Port: 23
```json
{
  "cmd": "setAlertThresholdSettings",
  "weightLowThreshold": 0.55
}
```

#### Response
Port: 13
```json
{
  "weightLowThreshold": 0.55
}
```

### 7. Weight Downlink Taring Configuration (Port: 24)

#### Command
Port: 24
```json
{
  "cmd": "setDownlinkTaring"
}
```

#### Response
Port: 14
```json
{
  "taringState": "success",
  "weightBeforeTaring": 1.25,
  "weightAfterTaring": 0
}
```

