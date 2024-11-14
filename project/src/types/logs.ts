export type LogSeverity = 'info' | 'warning' | 'error' | 'debug';

export interface Log {
  id: string;
  timestamp: string;
  platform: string;
  apiEndpoint: string;
  logType: string;
  severity: LogSeverity;
  message: string;
  metadata: Record<string, any>;
}

export interface Platform {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  logsCount: number;
}