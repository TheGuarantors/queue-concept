# TheGuarantors Queue Package

## Types

```
type QueueableData = Object | string | boolean | number;

interface Queueable {
  (data: QueueableData): void;
}

interface Message {
  id?: number;
  action: string;
  data: QueueableData;
}

interface QueueablesMap {
  [action: string]: Queueable;
}

interface Logger {
  error: (message: string) => void;
  info: (message: string) => void;
}

interface QueueAttrs {
  createdAt: Date;
  id: number;
  message: string;
  queue: string;
  status: Status;
  statusMessage?: string;
  updatedAt: Date;
}

export type Status =
  "hubspot-status-code-error"
| "invalid-message"
| "processing"
| "unhandled-error"
| "unprocessed";
```

## Functions

```
function count(
  queueName: string
): Promise<number>

function push(
  queueName: string,
  message: Message
): Promise<QueueAttrs>

function take(
  queueName: string,
): Promise<QueueAttrs[]>

function work(
  queueName: string,
  queueables: QueueablesMap,
  logger: Logger
): Promise<void[]>

function close(): Promise<void>
```

## Exceptions

```
  InvalidQueueMessageError,
  HubSpotNetworkError
```

## Create queue instance

1. Set environment variable `DATABASE_URL` to the postgreSQL connection string.
2. Import any function from the package.

## Close queue instance

Call `close()`
