// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// ============================================
// Generic Response Types
// ============================================

export interface SuccessResponse<T = any> {
	success: true;
	data: T;
	message?: string;
}

export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: any;
	};
}

export type ApiResult<T = any> = SuccessResponse<T> | ErrorResponse;

// ============================================
// Database Model Types
// ============================================

export interface BaseModel {
	id: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface SoftDeleteModel extends BaseModel {
	deletedAt?: Date;
}

export interface AuditableModel extends BaseModel {
	createdBy?: number;
	updatedBy?: number;
}

// ============================================
// Query Types
// ============================================

export interface QueryFilters {
	[key: string]: any;
}

export interface SortOptions {
	field: string;
	direction: "asc" | "desc";
}

export interface PaginationOptions {
	page: number;
	limit: number;
	offset?: number;
}

export interface QueryOptions {
	filters?: QueryFilters;
	sort?: SortOptions[];
	pagination?: PaginationOptions;
	include?: string[];
	select?: string[];
}

// ============================================
// Event Types
// ============================================

export interface DomainEvent {
	id: string;
	type: string;
	aggregate: {
		id: string;
		type: string;
	};
	data: Record<string, any>;
	metadata: {
		timestamp: Date;
		version: number;
		userId?: string;
		correlationId?: string;
	};
}

// ============================================
// Configuration Types
// ============================================

export interface DatabaseConfig {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	ssl?: boolean;
	maxConnections?: number;
	timeout?: number;
}

export interface RedisConfig {
	host: string;
	port: number;
	password?: string;
	database?: number;
	keyPrefix?: string;
}

export interface AppConfig {
	port: number;
	nodeEnv: "development" | "production" | "test";
	logLevel: "debug" | "info" | "warn" | "error" | "fatal";
	corsOrigin: string;
	jwtSecret: string;
	database: DatabaseConfig;
	redis?: RedisConfig;
	external?: {
		[serviceName: string]: {
			baseUrl: string;
			apiKey?: string;
			timeout?: number;
		};
	};
}

// ============================================
// Service Types
// ============================================

export interface ServiceOptions {
	timeout?: number;
	retries?: number;
	circuitBreaker?: {
		threshold: number;
		timeout: number;
	};
}

export interface ServiceResult<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	metadata?: {
		duration: number;
		retries: number;
		cached?: boolean;
	};
}

// ============================================
// Middleware Types
// ============================================

export interface MiddlewareContext {
	request: any;
	response: any;
	user?: any;
	session?: any;
	logger?: any;
	metadata: Record<string, any>;
}

export type MiddlewareNext = () => Promise<void> | void;

export type Middleware = (
	context: MiddlewareContext,
	next: MiddlewareNext,
) => Promise<void> | void;

// ============================================
// Cache Types
// ============================================

export interface CacheOptions {
	ttl?: number; // Time to live in seconds
	tags?: string[];
	namespace?: string;
}

export interface CacheEntry<T = any> {
	value: T;
	expiresAt?: Date;
	tags?: string[];
	metadata?: Record<string, any>;
}

// ============================================
// Feature Flag Types
// ============================================

export interface FeatureFlag {
	key: string;
	enabled: boolean;
	rolloutPercentage?: number;
	conditions?: {
		userIds?: string[];
		userAttributes?: Record<string, any>;
		dateRange?: {
			start: Date;
			end: Date;
		};
	};
}

// ============================================
// Metrics Types
// ============================================

export interface MetricData {
	name: string;
	value: number;
	timestamp: Date;
	tags?: Record<string, string>;
	type: "counter" | "gauge" | "histogram" | "timer";
}

export interface PerformanceMetrics {
	responseTime: number;
	memoryUsage: number;
	cpuUsage: number;
	activeConnections: number;
	requestsPerSecond: number;
}
