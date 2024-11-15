import { Log } from '@/types/logs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogTableProps {
  logs: Log[];
  onViewDetails: (log: Log) => void;
}

export function LogTable({ logs, onViewDetails }: LogTableProps) {
  const severityColor = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    debug: 'bg-gray-500',
    success: 'bg-green-500',
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>API Endpoint</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </TableCell>
              <TableCell>{log.platform}</TableCell>
              <TableCell>{log.apiEndpoint}</TableCell>
              <TableCell>{log.logType}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={severityColor[log.severity]}>
                  {log.severity}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md truncate">{log.message}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(log)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}