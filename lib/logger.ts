type Level = "info" | "warn" | "error";

interface Entry {
  level: Level;
  message: string;
  timestamp: string;
  env: string | undefined;
  context?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string } | string;
}

function serialize(error: unknown): Entry["error"] {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return String(error);
}

function emit(level: Level, message: string, context?: Record<string, unknown>, error?: unknown) {
  const entry: Entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...(context && { context }),
    ...(error !== undefined && { error: serialize(error) }),
  };
  // Structured JSON → Vercel log drain / Axiom / Datadog can parse this directly.
  // To add Sentry: import * as Sentry from "@sentry/nextjs" and call Sentry.captureException(error) here.
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    emit("warn", message, context),
  error: (message: string, context?: Record<string, unknown>, error?: unknown) =>
    emit("error", message, context, error),
};
