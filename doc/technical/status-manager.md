
# Status Manager

A Status Manager keeping track of all application statusses, i.e.:

* _Application type_: either `worker` or `shellydevice`
* _Application health_: either `starting`, `running`, or `instable`
* _Application status details_: additional detailed runtime information (optional)

## Static configuration

The Status Manager can be configured, before compilation, with static configuration values. These values are available in the `status` element in the `glconfig.json` configuration file:

* _interval_: the interval in milliseconds of status reporting by the helper class, see next section.
* _validity_: the time in milliseconds a status remains valid after the last received status reporting.
* _cleanup_: the interval in milliseconds after which the Status Manager will cleanup its list of statusses to prevent overflooding memory.

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
