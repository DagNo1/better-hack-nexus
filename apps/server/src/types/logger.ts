// ============================================
// Logger Types
// ============================================

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	FATAL = 4,
}

export interface LogContext {
	userId?: string | number;
	requestId?: string;
	sessionId?: string;
	action?: string;
	resource?: string;
	duration?: number;
	metadata?: Record<string, any>;
}

export interface LogEntry {
	level: LogLevel;
	message: string;
	timestamp: string;
	context?: LogContext;
	error?: {
		name: string;
		message: string;
		stack?: string;
		code?: string;
		statusCode?: number;
	};
	emoji: string;
	levelName: string;
}

// ============================================
// Auth Event Types
// ============================================

export type AuthEvent = "login" | "logout" | "register" | "failed_login";

// ============================================
// Security Event Types
// ============================================

export type SecurityLevel = "low" | "medium" | "high" | "critical";

// ============================================
// Error Severity Types
// ============================================

export type ErrorSeverity = "low" | "medium" | "high" | "critical";
