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

type LogParticularFn = (message: string) => void;

export interface Logger {
  emerg: LogParticularFn;
  alert: LogParticularFn;
  crit: LogParticularFn;
  error: LogParticularFn;
  warning: LogParticularFn;
  notice: LogParticularFn;
  info: LogParticularFn;
  debug: LogParticularFn;
}
