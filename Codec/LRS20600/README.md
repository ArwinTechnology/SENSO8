# LRS20600

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
  "dataUploadInterval": 60,
  "triggerMode": "NC, rising/falling edge trigger",
  "triggerDeafTime": 2
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
  "inputEnabled": "enable"
}
```

### 4. Device Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default      |
| :------------------: | :------------------: | :----: | :----------: |
| Data upload interval | "dataUploadInterval" | minute | 60           |
| Trigger mode         | "triggerMode"        | --     | (See Remark) |
| Trigger deaf time    | "deafTime"           | s      | 2            |

Remark:

| Value in Port: 22  | "triggerMode"                         |
| :----------------: | :-----------------------------------: |
| 1                  | NC input, falling edge trigger        |
| 2                  | NO input, rising edge trigger         |
| 3<br/>(Default)    | NC input, rising/falling edge trigger |
| 4                  | NO input, rising/falling edge trigger |

<font color="red">"Trigger mode" has not been checked.</font>

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 30,
  "triggerMode": 4,
  "deafTime": 3
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 30,
  "triggerMode": "NO, rising/falling edge trigger",
  "triggerDeafTime": 4
}
```

### 5. Dry Contact Input Configuration (Port: 23)

Configurable Settings:

| Settings          | Key in Port: 23      | Unit                 | Default      |
| :---------------: | :------------------: | :------------------: | :----------: |
| Dry contact input | "inputEnable"        | enable /<br/>disable | enable       |

Example

```json
Port: 23
{
  "cmd": "setInputConfiguration",
  "inputEnable": "disable"
}
```

Response

```json
Port: 13
{
  "inputEnabled": "disable"
}
```

