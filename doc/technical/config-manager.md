
# Config Manager

A Config Manager stores received configurations in a database and publishes it via IPC to subscribed applications.

## Static configuration

The Config Manager can be configured, before compilation, with static configuration values. These values are available in the `config` element in the `glconfig.json` configuration file:

* _database_: the MongoDB connection string.
* _databaseReadRetry_: the retry timeout in milliseconds after the initial configuration values are read from the MongoDB.

## Get application configuration

Applications can subscribe to their own configuration by using the IPC subscription message name `<Application>Config`.
E.g.: an application named `HelloWorld` can subscribe and receive its configuration using:

```typescript
import { ipc, log } from 'glidelite';
// The `Ipc<Application>Config` interface should be described in `backend/workers/<application>/types.ts`
import { IpcHelloWorldConfig } from '../helloworld/types';

ipc.to.configmanager.subscribe('HelloWorldConfig', (name, payload) => {
  // It is adviced to check the payload before casting to the dedicated interface
  const config = payload as IpcHelloWorldConfig;
  log.helloworld.info('Received HelloWorld config:', config.hello);
});
```

> [!WARNING]
> In case an application did not (yet) receive any published configuration either means the configuration is not available, the Config Manager is not yet started, or the Config Manager is not working properly. The application should not simply assume the configuration is not available.

## Set application configuration

Applications can create/update an application configuration by using the IPC request message name `SetConfig`.
E.g.: creating/updating the configuration for an application named `HelloWorld` can be done using:

```typescript
import { ipc, log } from 'glidelite';
// The `HelloWorld` application name and `IpcHelloWorldSetConfig` interface should be described in `backend/workers/configmanager/types.ts`
import { IpcHelloWorldSetConfig, IpcSetConfigResponse } from '../configmanager/types';

const config: IpcHelloWorldSetConfig = { name: 'HelloWorld', config: { hello: 'world' } };
ipc.to.configmanager.request('SetConfig', config, (name, payload) => {
  // It is adviced to check the payload before casting to the dedicated interface
  const response = payload as IpcSetConfigResponse;
  log.helloworld.info('Setting HelloWorld config result:', response.result);
});
```
