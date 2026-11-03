import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok';
  service: 'business-card';
  timestamp: string;
}

@Injectable()
export class HealthService {
  getHealth(): HealthStatus {
    return {
      status: 'ok',
      service: 'business-card',
      timestamp: new Date().toISOString(),
    };
  }
}
