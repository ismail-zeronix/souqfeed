import pino, { type Logger } from "pino";

type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export function createLogger(level: LogLevel = "info"): Logger {
  return pino({
    level,
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  });
}

export const logger = createLogger(
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? "info",
);
