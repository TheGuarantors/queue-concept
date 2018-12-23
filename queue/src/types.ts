export type QueueableData = Object | string | boolean | number;

export interface Message {
  id?: number;
  action: string;
  data: QueueableData;
}

export interface Queueable {
  (data: QueueableData): void;
}

export interface QueueablesMap {
  [action: string]: Queueable;
}
