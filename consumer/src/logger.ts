import * as os from "os";
import * as winston from "winston";
/*
 * Requiring `winston-syslog` will expose
 * `winston.transports.Syslog`, but the type
 * definition for it is still missing,
 * so we cast winston.transports to any
 */
require("winston-syslog").Syslog;

export type LogGeneralFn = (level: string, message: string) => void;
export type LogParticularFn = (message: string) => void;

export interface Logger {
  log: LogGeneralFn;
  emerg: LogParticularFn;
  alert: LogParticularFn;
  crit: LogParticularFn;
  error: LogParticularFn;
  warning: LogParticularFn;
  notice: LogParticularFn;
  info: LogParticularFn;
  debug: LogParticularFn;
}

export class LoggerStream {
  constructor(private level: string, private logger: Logger) {}

  write(msg: string) {
    this.logger.log(this.level, msg);
  }
}

export function createLogger(
  programName: string,
  facility: string
): winston.Logger {
  const logger: winston.Logger = winston.createLogger({
    levels: winston.config.syslog.levels
  });

  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );

  if (process.env.SYSLOG) {
    logger.add(
      new (winston.transports as any).Syslog({
        app_name: programName,
        facility,
        format: winston.format.simple(),
        localhost: os.hostname()
      })
    );
  }

  return logger;
}

const programName: string = process.env.PROGRAM_NAME
  ? process.env.PROGRAM_NAME
  : "monolith";
const facility: string = process.env.FACILITY ? process.env.FACILITY : "local0";
const logger: winston.Logger = createLogger(programName, facility);

export default logger;

export function getLogger(): Logger {
  return logger;
}
