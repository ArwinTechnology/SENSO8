# LRS20UXX

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
Port: 22
{
  "cmd": "getThresholdSettings"
}
```

Response

```json
Port: 13
{
  "distanceHighThreshold": 200
  "distanceLowTHreshold": 150
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
  "dataUploadInterval": 30
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 15
}
```

### 5. Occupancy Alert Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                | Key in Port: 23 | Unit   | Default |
| :---------------------: | :-------------: | :----: | :-----: |
| Distance High Threshold | "thresholdHigh" | cm     | 200     |
| Distance Low Threshold  | "thresholdLow"  | cm     | 150     |

Example

```json
Port: 23
{
  "cmd": "setAlertThresholds",
  "thresholdHigh": 110.5,
  "thresholdLow": 95.5
}
```

Response

```json
Port: 13
{
  "distanceHighThreshold": 110.5,
  "distanceLowTHreshold": 95.5
}
```



