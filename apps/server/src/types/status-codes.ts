// ============================================
// HTTP Status Codes
// ============================================

export enum HttpStatusCode {
	// Success
	OK = 200,
	CREATED = 201,
	ACCEPTED = 202,
	NO_CONTENT = 204,

	// Client Errors
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	METHOD_NOT_ALLOWED = 405,
	CONFLICT = 409,
	UNPROCESSABLE_ENTITY = 422,
	TOO_MANY_REQUESTS = 429,

	// Server Errors
	INTERNAL_SERVER_ERROR = 500,
	NOT_IMPLEMENTED = 501,
	BAD_GATEWAY = 502,
	SERVICE_UNAVAILABLE = 503,
	GATEWAY_TIMEOUT = 504,
}

// ============================================
// tRPC Error Codes
// ============================================

export enum TRPCErrorCode {
	PARSE_ERROR = "PARSE_ERROR",
	BAD_REQUEST = "BAD_REQUEST",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	METHOD_NOT_SUPPORTED = "METHOD_NOT_SUPPORTED",
	TIMEOUT = "TIMEOUT",
	CONFLICT = "CONFLICT",
	PRECONDITION_FAILED = "PRECONDITION_FAILED",
	PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
	UNPROCESSABLE_CONTENT = "UNPROCESSABLE_CONTENT",
	TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
	CLIENT_CLOSED_REQUEST = "CLIENT_CLOSED_REQUEST",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

// ============================================
// Prisma Error Codes
// ============================================

export enum PrismaErrorCode {
	RECORD_NOT_FOUND = "P2025",
	UNIQUE_CONSTRAINT_VIOLATION = "P2002",
	FOREIGN_KEY_CONSTRAINT_VIOLATION = "P2003",
	CONSTRAINT_VIOLATION = "P2004",
	INVALID_VALUE = "P2005",
	DEPENDENCY_VIOLATION = "P2014",
	RELATED_RECORD_NOT_FOUND = "P2015",
	INTERPRETATION_ERROR = "P2016",
	RECORDS_NOT_CONNECTED = "P2017",
	REQUIRED_CONNECTED_RECORDS_NOT_FOUND = "P2018",
	INPUT_ERROR = "P2019",
	VALUE_OUT_OF_RANGE = "P2020",
	TABLE_NOT_EXIST = "P2021",
	COLUMN_NOT_EXIST = "P2022",
	INCONSISTENT_COLUMN_DATA = "P2023",
	CONNECTION_TIMED_OUT = "P2024",
}

// ============================================
// Application Error Types
// ============================================

export enum AppErrorType {
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
	AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
	AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
	BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
	EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
	RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
}

// ============================================
// Status Code Mapping
// ============================================

export const HTTP_TO_TRPC_ERROR_MAP: Record<HttpStatusCode, TRPCErrorCode> = {
	[HttpStatusCode.BAD_REQUEST]: TRPCErrorCode.BAD_REQUEST,
	[HttpStatusCode.UNAUTHORIZED]: TRPCErrorCode.UNAUTHORIZED,
	[HttpStatusCode.FORBIDDEN]: TRPCErrorCode.FORBIDDEN,
	[HttpStatusCode.NOT_FOUND]: TRPCErrorCode.NOT_FOUND,
	[HttpStatusCode.METHOD_NOT_ALLOWED]: TRPCErrorCode.METHOD_NOT_SUPPORTED,
	[HttpStatusCode.CONFLICT]: TRPCErrorCode.CONFLICT,
	[HttpStatusCode.UNPROCESSABLE_ENTITY]: TRPCErrorCode.UNPROCESSABLE_CONTENT,
	[HttpStatusCode.TOO_MANY_REQUESTS]: TRPCErrorCode.TOO_MANY_REQUESTS,
	[HttpStatusCode.INTERNAL_SERVER_ERROR]: TRPCErrorCode.INTERNAL_SERVER_ERROR,

	// Default mappings for other codes
	[HttpStatusCode.OK]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.CREATED]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.ACCEPTED]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.NO_CONTENT]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.NOT_IMPLEMENTED]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.BAD_GATEWAY]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.SERVICE_UNAVAILABLE]: TRPCErrorCode.INTERNAL_SERVER_ERROR,
	[HttpStatusCode.GATEWAY_TIMEOUT]: TRPCErrorCode.TIMEOUT,
};

// ============================================
// Helper Functions
// ============================================

export function getTRPCErrorCode(httpStatus: HttpStatusCode): TRPCErrorCode {
	return (
		HTTP_TO_TRPC_ERROR_MAP[httpStatus] || TRPCErrorCode.INTERNAL_SERVER_ERROR
	);
}
