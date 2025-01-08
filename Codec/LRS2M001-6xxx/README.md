# LRS2M001 --- Dual DIN and Single DOUT

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

### 2. Dual Dry Contact Inputs Setting Request (Port: 21)

```json
Port: 21
{
  "cmd": "getDeviceInputSettings"
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 10,
  "input1TriggerMode": "NC, rising/falling edge trigger",
  "input1TriggerDeafTime": 2,
  "input2TriggerMode": "NC, rising/falling edge trigger",
  "input2TriggerDeafTime": 2
}
```

### 3. Dual Dry Contact Inputs Alert Setting Request (Port: 21)

```json
Port: 21
{
  "cmd": "getInputAlertSettings"
}
```

Response

```json
Port: 13
{
  "input1Enabled": "enable",
  "input2Enabled": "enable"
}
```

### 4. Dry Contact Output Setting Request (Port: 21)

```json
Port: 21
{
  "cmd": "getDeviceOutputSettings"
}
```

Response

```json
Port: 11
{
  "defaultOutputState": "open"
}
```

### 5. Device Upload Setting Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default |
| :------------------: | :------------------: | :----: | :-----: |
| Data upload interval | "dataUploadInterval" | minute | 10      |

Example

```json
Port: 22
{
  "cmd": "setDeviceInputSettings",
  "dataUploadInterval": 20
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 20,
  "input1TriggerMode": "NC, rising/falling edge trigger",
  "input1TriggerDeafTime": 2,
  "input2TriggerMode": "NC, rising/falling edge trigger",
  "input2TriggerDeafTime": 2
}
```

### 6. Dry Contact Input 1 Setting Configuration (Port: 23)

Configurable Settings:

| Settings             | Key in Port: 23      | Unit   | Default      |
| :------------------: | :------------------: | :----: | :----------: |
| Trigger mode         | "triggerMode"        | --     | (See Remark) |
| Trigger deaf time    | "deafTime"           | s      | 2            |

Remark:

| Value in Port: 23  | "triggerMode"                         |
| :----------------: | :-----------------------------------: |
| 1                  | NC input, falling edge trigger        |
| 2                  | NO input, rising edge trigger         |
| 3<br>(Default)     | NC input, rising/falling edge trigger |
| 4                  | NO input, rising/falling edge trigger |

Example

```json
Port: 23
{
  "cmd": "setInput1Settings",
  "triggerMode": 1,
  "deafTime": 5
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 20,
  "input1TriggerMode": "NC, falling edge trigger",
  "input1TriggerDeafTime": 5,
  "input2TriggerMode": "NC, rising/falling edge trigger",
  "input2TriggerDeafTime": 2
}
```

### 7. Dry Contact Input 1 Alert Setting Configuration (Port: 24)

Configurable Settings:

| Settings                 | Key in Port: 24      | Unit                | Default |
| :----------------------: | :------------------: | :-----------------: | :-----: |
| Dry contact input enable | "inputEnable"        | enable /<br>disable | enable  |

Example

```json
Port: 24
{
  "cmd": "setInput1AlertSettings",
  "inputEnable": "disable"
}
```

Response

```json
Port: 13
{
  "input1Enabled": "disable",
  "input2Enabled": "enable"

}
```

### 8. Dry Contact Input 2 Setting Configuration (Port: 27)

Configurable Settings:

| Settings             | Key in Port: 27      | Unit   | Default      |
| :------------------: | :------------------: | :----: | :----------: |
| Trigger mode         | "triggerMode"        | --     | (See Remark) |
| Trigger dead time    | "deafTime"           | s      | 2            |

Remark:

| Value in Port: 27  | "triggerMode"                         |
| :----------------: | :-----------------------------------: |
| 1                  | NC input, falling edge trigger        |
| 2                  | NO input, rising edge trigger         |
| 3<br>(Default)     | NC input, rising/falling edge trigger |
| 4                  | NO input, rising/falling edge trigger |

Example

```json
Port: 27
{
  "cmd": "setInput2Settings",
  "triggerMode": 1,
  "deafTime": 5
}
```

Response

```json
Port: 12
{
  "dataUploadInterval": 20, 
  "input1TriggerMode": "NC, falling edge trigger",
  "input1TriggerDeafTime": 5,
  "input2TriggerMode": "NC, falling edge trigger",
  "input2TriggerDeafTime": 5
}
```

### 9. Dry Contact Input 2 Alert Setting Configuration (Port: 28)

Configurable Settings:

| Settings                 | Key in Port: 28      | Unit                | Default |
| :----------------------: | :------------------: | :-----------------: | :-----: |
| Dry contact input enable | "inputEnable"        | enable /<br>disable | enable  |

Example

```json
Port: 28
{
  "cmd": "setInput2AlertSettings",
  "inputEnable": "disable"
}
```

Response

```json
Port: 13
{
  "input1Enabled": "disable",
  "input2Enabled": "disable"
}
```

### 10. Dry Contact Output Setting Configuration (Port: 22)

Configurable Settings:

| Settings                                                 | Key in Port: 22      | Unit            | Default |
| :------------------------------------------------------: | :------------------: | :-------------: | :-----: |
| Default output state when<br>powered by backup battery | "defaultOutputState" | open /<br>close | open    |

Example

```json
Port: 22
{
  "cmd": "setDeviceOutputSettings",
  "defaultOutputState": "close"
}
```

Response

```json
Port: 11
{
  "defaultOutputState": "close"
}
```

### 11. Dry Contact Output Configuration (Port" 23)

Configurable Settings:

| Settings                 | Key in Port: 23      | Unit            | Default |
| :----------------------: | :------------------: | :-------------: | :-----: |
| Dry Contact Output State | "outputState"        | open /<br>close | open    |

Example

```json
Port: 23
{
  "cmd": "setOutputState",
  "outputState": "close"
}
```

Response

```json
Port: 10
{
  "event"; "heartbeat/button",
  "battery": 100,
  "outputState": "close"
}
```

