import type { LogEntry } from "../types/logger";
import { LogLevel } from "../types/logger";

// ============================================
// Logger Class
// ============================================

class CustomLogger {
  private currentLogLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.currentLogLevel = this.getLogLevelFromEnv();
    this.isDevelopment = process.env.NODE_ENV !== "production";
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case "DEBUG":
        return LogLevel.DEBUG;
      case "INFO":
        return LogLevel.INFO;
      case "WARN":
        return LogLevel.WARN;
      case "ERROR":
        return LogLevel.ERROR;
      case "FATAL":
        return LogLevel.FATAL;
      default:
        return this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLogLevel;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    error?: Error
  ): LogEntry {
    const emoji = this.getEmojiForLevel(level);
    const levelName = LogLevel[level];
    const timestamp = new Date().toISOString();

    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      emoji,
      levelName,
    };

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return logEntry;
  }

  private getEmojiForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return "🔍 ";
      case LogLevel.INFO:
        return "ℹ️ ";
      case LogLevel.WARN:
        return "⚠️ ";
      case LogLevel.ERROR:
        return "❌ ";
      case LogLevel.FATAL:
        return "🚨 ";
      default:
        return "📝 ";
    }
  }

  private output(logEntry: LogEntry) {
    const { emoji, levelName, timestamp, message, error } = logEntry;

    if (this.isDevelopment) {
      // Development: Pretty formatted logs
      const errorStr = error
        ? `\n   Error: ${error.name} - ${error.message}${
            error.stack ? `\n   Stack: ${error.stack}` : ""
          }`
        : "";

      const fullMessage = `${emoji} [${levelName}] ${timestamp} - ${message}${errorStr}`;

      switch (logEntry.level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(fullMessage);
          break;
        case LogLevel.WARN:
          console.warn(fullMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(fullMessage);
          break;
      }
    } else {
      // Production: Structured JSON logs
      console.log(JSON.stringify(logEntry));
    }
  }

  // ============================================
  // Core Logging Methods
  // ============================================

  debug(message: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const logEntry = this.formatMessage(LogLevel.DEBUG, message);
    this.output(logEntry);
  }

  info(message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const logEntry = this.formatMessage(LogLevel.INFO, message);
    this.output(logEntry);
  }

  warn(message: string) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const logEntry = this.formatMessage(LogLevel.WARN, message);
    this.output(logEntry);
  }

  error(message: string, error?: Error) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const logEntry = this.formatMessage(LogLevel.ERROR, message, error);
    this.output(logEntry);
  }

  fatal(message: string, error?: Error) {
    if (!this.shouldLog(LogLevel.FATAL)) return;
    const logEntry = this.formatMessage(LogLevel.FATAL, message, error);
    this.output(logEntry);
  }
}

// ============================================
// Global Logger Instance
// ============================================

export const logger = new CustomLogger();

export default logger;
