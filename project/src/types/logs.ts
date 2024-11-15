// types/logs.ts
export type LogSeverity = 'info' | 'warning' | 'error' | 'debug'| 'success'; // Add 'success' to the LogSeverity type

export interface Log {
  id: string;
  createdAt: string;
  platform: string;
  apiEndpoint: string;
  logType: string;
  severity: LogSeverity;
  message: string;
  metadata: Record<string, any>;
  jsondata: Record<string, any>;
}

export interface Platform {
  id: string;
  name: string;
  status: LogSeverity | 'success'; // Update "healthy" to "success"
  logsCount: number;
}

export interface PlatformData {
  DISTINCT: string;
  LOGCOUNT: number;
  lastSeverity: LogSeverity | 'success' | null; // Update "healthy" to "success"
}
