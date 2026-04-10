
# Log Manager

A Log Manager reads log files and sends the log messages in responds to IPC requests.

## Get log messages

Applications can get log messages by using the IPC request message name `GetLog`:

```typescript
import { ipc } from 'glidelite';
import { isIpcGetLogResponseMessage } from '../../ipc/logManager';

ipc.to.logmanager.request('GetLog', undefined, (name, payload) => {
  if (isIpcGetLogResponseMessage(name, payload)) {
    ...
  }
});
```
