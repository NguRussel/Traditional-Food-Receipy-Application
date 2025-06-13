export interface ServiceConfig {
  url: string;
  status: 'online' | 'offline' | 'unknown';
  description: string;
  lastChecked?: Date;
  responseTime?: number;
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export interface HealthCheckResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
}

export interface ServiceStatusResponse {
  message: string;
  services: Record<string, ServiceConfig>;
  timestamp: string;
  version: string;
}

export interface ProxyRoute {
  path: string;
  target: string;
  pathRewrite: Record<string, string>;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export interface CorsConfig {
  origin: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
} 