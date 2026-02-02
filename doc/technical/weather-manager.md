
# Weather Manager

A Weather Manager retrieves weather data from a configured source and publishes it via IPC to subscribed applications.

## Get weather data

Applications can subscribe to weather data by using the IPC subscription message name `WeatherData`:

```typescript
import { ipc } from 'glidelite';
import { IpcWeatherData } from '../weathermanager/types';

ipc.to.weathermanager.subscribe('WeatherData', (name, payload) => {
  // It is adviced to check the payload before casting to the dedicated interface
  const data = payload as IpcWeatherData;
  ...
});
```

## Set Weather Manager configuration

Applications can create/update Weather Manager configuration by using the IPC request message name `SetConfig`:

```typescript
import { ipc } from 'glidelite';
import { IpcWeatherManagerSetConfig } from '../configmanager/types';
import { IpcSetConfigResponse } from '../configmanager/types';

const config: IpcWeatherManagerSetConfig = { ... };
ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
  // It is adviced to check the payload before casting to the dedicated interface
  const response = payload as IpcSetConfigResponse;
  ...
});
```

For more details about setting configurations, please refer to the [Config Manager](https://github.com/sanderveldhuis/aurorahome/blob/main/doc/technical/config-manager.md) documentation.
