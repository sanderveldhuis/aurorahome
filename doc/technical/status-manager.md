
# Status Manager

A Status Manager keeping track of all application statusses, i.e.:
* _Application type_: either `worker` or `shellydevice`
* _Application health_: either `starting`, `running`, or `instable`
* _Application status details_: additional detailed runtime information (optional)

## Status reporting

Each application should report its status via IPC to the Status Manager in a pre-defined interval. If this status reporting fails or stops, the Status Manager will mark the application as offline.

A helper class is available for applications to report the status to the Status Manager:

```typescript
import { status } from '../statusmanager/statusReporter';

// Start status reporting
status.applicationname.start('worker');

// Set status health
status.applicationname.setHealth('instable');
status.applicationname.setHealth('running');

// Set or clear additional detailed runtime information
status.applicationname.setDetails({ host: 'localhost', port: 80 });
status.applicationname.clearDetails();

// Stop status reporting
status.applicationname.stop();
```
