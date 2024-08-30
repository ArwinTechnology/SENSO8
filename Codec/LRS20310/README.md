# LRS20310

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
  "dataUploadInterval": 60,
  "numAdditionalUpload": 3,
  "additionalUploadInterval": 1
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
  "waterLeakAlertThreshold": 15
}
```

### 4. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings                                                    | Key in Port: 22      | Unit   | Default |
| :---------------------------------------------------------: | :------------------: | :----: | :-----: |
| Data upload interval                                        | "dataUploadInterval" | minute | 60      |
| Number of additional uploads<br/>when alert is triggered    | "repeatUpload"       | --     | 3       |
| Time between additional uploads<br/>when alert is triggered | "repeatInterval"     | minute | 1       |

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 30,
  "repeatUpload": 4,
  "repeatInterval": 2
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 30,
  "numAdditionalUpload": 4,
  "additionalUploadInterval": 2
}
```

### 5. Water Leak Alert Threshold Configuration (Port: 23)

Configurable Settings:

| Settings                   | Key in Port: 23   | Unit | Default |
| :------------------------: | :---------------: | :--: | :-----: |
| Water leak alert threshold | "alertThreshold"  | %    | 15      |

Example

```json
Port:23
{
  "cmd": "setAlertThresholds",
  "alertThreshold": 30
}
```

Response

```json
Port: 13
{
  "waterLeakAlertThreshold": 30
}
```

