import pino, { type Logger } from "pino";

const LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

// Untrusted input (env vars, config) goes through here before it ever
// reaches pino: an unrecognized or empty level otherwise throws at
// construction time, which is a boot-time crash from a one-keystroke typo.
export function parseLogLevel(value: string | undefined): LogLevel {
  if (value && (LOG_LEVELS as readonly string[]).includes(value)) {
    return value as LogLevel;
  }
  return "info";
}

export function createLogger(level: LogLevel = "info"): Logger {
  return pino({
    level,
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  });
}

export const logger = createLogger(parseLogLevel(process.env.LOG_LEVEL));
