import { useState } from 'react';
import { Log } from '@/types/logs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface LogDetailsDialogProps {
  log: Log | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  const [wrapJsonData, setWrapJsonData] = useState(true);

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
              <p className="font-mono">{new Date(log.createdAt).toLocaleString()}</p>
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
          <Tabs defaultValue="metadata">
            <TabsList>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              <TabsTrigger value="jsondata">Jsondata</TabsTrigger>
            </TabsList>
            <TabsContent value="metadata">
              <ScrollArea className="h-[200px] mt-1 rounded-md border p-4">
                <pre className="text-sm">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="jsondata">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Jsondata</label>
              </div>
              <ScrollArea className="h-[200px] mt-1 rounded-md border p-4 overflow-auto max-w-full">
                <pre
                  className="text-sm whitespace-pre-wrap"
                  style={{ wordBreak: 'break-word' }}
                >
                  {JSON.stringify(log.jsondata, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}