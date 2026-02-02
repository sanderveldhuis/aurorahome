
# Shelly Server

A Shelly Server handling Shelly devices using the MQTT protocol. The following devices are supported:

* Light
* Switch

## Static configuration

The Shelly Server can be configured, before compilation, with static configuration values. These values are available in the `mqtt` element in the `glconfig.json` configuration file:

* _version_: the default MQTT version used.
* _retryTimeout_: the timeout in milliseconds after a failed MQTT package transmission is retried.
* _retryMax_: the maximum number of transmission retries after a failed MQTT package is dropped.

## Set Shelly Server configuration

Applications can create/update Shelly Server configuration by using the IPC request message name `SetConfig`:

```typescript
import { ipc } from 'glidelite';
import { IpcShellyServerSetConfig } from '../configmanager/types';
import { IpcSetConfigResponse } from '../configmanager/types';

const config: IpcShellyServerSetConfig = { ... };
ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
  // It is adviced to check the payload before casting to the dedicated interface
  const response = payload as IpcSetConfigResponse;
  ...
});
```

For more details about setting configurations, please refer to the [Config Manager](https://github.com/sanderveldhuis/aurorahome/blob/main/doc/technical/config-manager.md) documentation.
