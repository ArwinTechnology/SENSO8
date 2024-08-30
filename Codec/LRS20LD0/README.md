# LRS20LD0

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
  "firmwareVersion": 1.04.000
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
  "dataUploadInterval": 15
}
```

### 3. Threshold & Delta Settings Request (Port: 21)

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

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 10
}
```

Response

```json
Port: 12
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

```json
Port: 23
{
  "cmd": "setAlertThresholds",
  "distanceThreshold": 42.5,
  "distanceNegativeDelta": 2.5,
  "distancePositiveDelta": 2.5
}
```

Response

```json
Port: 13
{
  "distanceThreshold": 42.5,
  "negativeDelta": 2.5,
  "positiveDelta": 2.5
}
```

<font color="red">The code change (Unit from mm to cm) has not been checked.</font>

