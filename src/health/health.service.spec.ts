import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const service = new HealthService();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-03T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the service status and an ISO timestamp', () => {
    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'business-card',
      timestamp: '2026-11-03T12:00:00.000Z',
    });
  });
});
