// ============================================
// Common DTO Types
// ============================================

export interface PaginationInput {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface SearchInput {
	query: string;
	filters?: Record<string, any>;
}

export interface BulkOperationInput {
	ids: number[];
	action: string;
}

// ============================================
// Response DTO Types
// ============================================

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
}

export interface HealthCheckResponse {
	status: "healthy" | "unhealthy";
	timestamp: string;
	services: {
		database: "connected" | "disconnected";
		cache?: "connected" | "disconnected";
		external?: Record<string, "connected" | "disconnected">;
	};
	version: string;
	uptime: number;
}
