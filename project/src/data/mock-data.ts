import { Log, Platform } from '@/types/logs';

export const platforms: Platform[] = [
  { id: '1', name: 'Platform 1', status: 'healthy', logsCount: 1234 },
  { id: '2', name: 'Platform 2', status: 'warning', logsCount: 856 },
  { id: '3', name: 'Platform 3', status: 'error', logsCount: 432 },
  { id: '4', name: 'Platform 4', status: 'healthy', logsCount: 2341 },
];

export const mockLogs: Log[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    platform: 'Platform 1',
    apiEndpoint: '/api/start',
    logType: 'system',
    severity: 'info',
    message: 'Application started successfully',
    metadata: {
      version: '1.0.0',
      environment: 'production',
      apiEndpoint: '/api/start',
    },
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    platform: 'Platform 2',
    apiEndpoint: '/api/auth/login',
    logType: 'security',
    severity: 'warning',
    message: 'Failed login attempt detected',
    metadata: {
      ip: '192.168.1.1',
      attempts: 3,
      apiEndpoint: '/api/auth/login',
    },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    platform: 'Platform 3',
    apiEndpoint: '/api/users',
    logType: 'database',
    severity: 'error',
    message: 'Database connection timeout',
    metadata: {
      db: 'users',
      query: 'SELECT * FROM users',
      apiEndpoint: '/api/users',
    },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 15000).toISOString(),
    platform: 'Platform 1',
    apiEndpoint: '/api/data',
    logType: 'api',
    severity: 'info',
    message: 'API request completed',
    metadata: {
      method: 'GET',
      duration: '120ms',
      apiEndpoint: '/api/data',
    },
  },
];