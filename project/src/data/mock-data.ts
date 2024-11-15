import { Log, Platform } from '@/types/logs';

export const platforms: Platform[] = [
  { id: 'testapp', name: 'testapp', status: 'success', logsCount: 1234 },
  { id: 'testbucket', name: 'testbucket', status: 'warning', logsCount: 856 },
  { id: '3', name: 'AjnaVidya', status: 'error', logsCount: 432 },
  { id: '4', name: 'SSO', status: 'success', logsCount: 2341 },
];

export const mockLogs: Log[] = [
  {
    id: 'testbucket',
    timestamp: new Date().toISOString(),
    platform: 'testbucket',
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
    id: 'testbucket',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    platform: 'testbucket',
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
    id: 'testbucket',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    platform: 'testbucket',
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
    platform: 'SSO',
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