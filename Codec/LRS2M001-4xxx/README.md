# LRS2M001

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

### 2. Modbus Power Meter Settings Request (Port: 21)

```json
Port: 21
{
  "cmd": "getDeviceSettings"
}
```

Response

```json
Port: 16
{
  "dataUploadInterval": 30,
  "underVoltageLimit": 206,
  "overVoltageLimit": 234,
  "overCurrentLimit": 100
}
```

### 3. Modbus Power Meter Latency Settings Request (Port: 21)

```json
Port: 21
{
  "cmd": "getLatencySettings"
}
```

Response

```json
Port: 17
{
  "normalCurrentLatency": 10,
  "overCurrentLatency": 12,
  "uplinkAlertClear": "enable"
}
```

### 4. Modbus Power Meter Settings Configuration (Port: 22)

Configurable Settings:

| Settings             | Key in Port: 22      | Unit   | Default |
| :------------------: | :------------------: | :----: | :-----: |
| Data upload interval | "dataUploadInterval" | minute | 10      |
| Under voltage limit  | "underVoltageLimit"  | V      | 206     |
| Over voltage limit   | "overVoltageLimit"   | V      | 234     |
| Over current limit   |  "overCurrentLimit"  | 0.1A   | 1000    |

Example

```json
Port: 22
{
  "cmd": "setDeviceSettings",
  "dataUploadInterval": 30,
  "underVoltageLimit": 200,
  "overVoltageLimit": 240,
  "overCurrentLimit": 400
}
```

Response

```json
Port: 16
{
  "dataUploadInterval": 30,
  "underVoltageLimit": 200,
  "overVoltageLimit": 240,
  "overCurrentLimit": 400
}
```

### 5. Modbus Power Meter Latency Settings Configuration (Port: 23)

Configurable Settings:

| Settings                                                  | Key in Port: 23        | Unit                 | Default |
| :-------------------------------------------------------: | :--------------------: | :------------------: | :-----: |
| Over-current latency                                      | "normalCurrentLatency" | sec                  | 0       |
| Normal-current latency                                    | "overCurrentLatency"   | sec                  | 0       |
| Send an uplink when the<br/>over-current alert is cleared | "uplinkAlertClear"     | enable /<br/>disable | disable |

Example

```json
Port: 23
{
  "cmd": "setLatencySettings",
  "normalCurrentLatency": 10,
  "overCurrentLatency": 12,
  "uplinkAlertClear": "enable"
}
```

Response

```json
Port: 17
{
  "normalCurrentLatency": 10,
  "overCurrentLatency": 12,
  "uplinkAlertClear": "enable"
}
```

