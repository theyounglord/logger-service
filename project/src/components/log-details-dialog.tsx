import { Log } from '@/types/logs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface LogDetailsDialogProps {
  log: Log | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <p className="font-mono">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Platform</label>
              <p>{log.platform}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <p>{log.logType}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Badge variant="secondary">{log.severity}</Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <p className="mt-1">{log.message}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Metadata</label>
            <ScrollArea className="h-[200px] mt-1 rounded-md border p-4">
              <pre className="text-sm">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}