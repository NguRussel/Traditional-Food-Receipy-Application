import axios from 'axios';
import { ServiceConfig } from '../types';

export class ServiceHealthChecker {
  private static instance: ServiceHealthChecker;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private serviceStatuses: Map<string, ServiceConfig> = new Map();

  private constructor() {}

  public static getInstance(): ServiceHealthChecker {
    if (!ServiceHealthChecker.instance) {
      ServiceHealthChecker.instance = new ServiceHealthChecker();
    }
    return ServiceHealthChecker.instance;
  }

  public async checkServiceHealth(serviceName: string, url: string): Promise<ServiceConfig> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${url}/health`, {
        timeout: 5000,
        headers: {
          'User-Agent': 'AFRI-PLATES-API-Gateway/1.0.0'
        }
      });

      const responseTime = Date.now() - startTime;
      const config: ServiceConfig = {
        url,
        status: response.status === 200 ? 'online' : 'offline',
        description: `${serviceName} microservice`,
        lastChecked: new Date(),
        responseTime
      };

      this.serviceStatuses.set(serviceName, config);
      return config;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const config: ServiceConfig = {
        url,
        status: 'offline',
        description: `${serviceName} microservice`,
        lastChecked: new Date(),
        responseTime
      };

      this.serviceStatuses.set(serviceName, config);
      console.error(`Health check failed for ${serviceName}:`, error instanceof Error ? error.message : 'Unknown error');
      return config;
    }
  }

  public async checkAllServices(): Promise<Record<string, ServiceConfig>> {
    const services = [
      { name: 'user-service', url: process.env.USER_SERVICE_URL || 'http://localhost:8002' },
      { name: 'recipe-service', url: process.env.RECIPE_SERVICE_URL || 'http://localhost:8001' },
      { name: 'chef-service', url: process.env.CHEF_SERVICE_URL || 'http://localhost:8003' },
      { name: 'review-service', url: process.env.REVIEW_SERVICE_URL || 'http://localhost:8004' },
      { name: 'media-service', url: process.env.MEDIA_SERVICE_URL || 'http://localhost:8005' },
      { name: 'recommendation-service', url: process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8006' },
      { name: 'regional-service', url: process.env.REGIONAL_SERVICE_URL || 'http://localhost:8007' },
      { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8008' },
      { name: 'scanner-service', url: process.env.SCANNER_SERVICE_URL || 'http://localhost:8009' },
      { name: 'ai-assistant-service', url: process.env.AI_ASSISTANT_SERVICE_URL || 'http://localhost:8010' },
      { name: 'analytics-service', url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8011' },
      { name: 'admin-service', url: process.env.ADMIN_SERVICE_URL || 'http://localhost:8012' }
    ];

    const healthChecks = services.map(service => 
      this.checkServiceHealth(service.name, service.url)
    );

    const results = await Promise.allSettled(healthChecks);
    const serviceStatus: Record<string, ServiceConfig> = {};

    results.forEach((result, index) => {
      const serviceName = services[index].name;
      if (result.status === 'fulfilled') {
        serviceStatus[serviceName] = result.value;
      } else {
        serviceStatus[serviceName] = {
          url: services[index].url,
          status: 'offline',
          description: `${serviceName} microservice`,
          lastChecked: new Date(),
          responseTime: 0
        };
      }
    });

    return serviceStatus;
  }

  public startPeriodicHealthChecks(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkAllServices();
        console.log('🔍 Periodic health check completed');
      } catch (error) {
        console.error('❌ Periodic health check failed:', error);
      }
    }, intervalMs);

    console.log(`🩺 Started periodic health checks every ${intervalMs}ms`);
  }

  public stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 Stopped periodic health checks');
    }
  }

  public getServiceStatus(serviceName: string): ServiceConfig | undefined {
    return this.serviceStatuses.get(serviceName);
  }

  public getAllServiceStatuses(): Record<string, ServiceConfig> {
    const statuses: Record<string, ServiceConfig> = {};
    this.serviceStatuses.forEach((status, name) => {
      statuses[name] = status;
    });
    return statuses;
  }

  public getHealthySystems(): string[] {
    const healthy: string[] = [];
    this.serviceStatuses.forEach((status, name) => {
      if (status.status === 'online') {
        healthy.push(name);
      }
    });
    return healthy;
  }

  public getUnhealthySystems(): string[] {
    const unhealthy: string[] = [];
    this.serviceStatuses.forEach((status, name) => {
      if (status.status === 'offline') {
        unhealthy.push(name);
      }
    });
    return unhealthy;
  }
} 