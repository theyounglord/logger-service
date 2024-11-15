import { Platform, LogSeverity } from '@/types/logs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle, Info, Bug } from 'lucide-react'; // Add Bug for 'debug' icon
import { cn } from '@/lib/utils';

interface PlatformCardProps {
  platform: Platform;
  onClick: () => void;
  isSelected: boolean;
}

export function PlatformCard({ platform, onClick, isSelected }: PlatformCardProps) {
  // Define the type for the statusIcon object
  const statusIcon: Record<LogSeverity | "success", JSX.Element> = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />, // Update "healthy" to "success"
    info: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    error: <Activity className="h-5 w-5 text-red-500" />,
    debug: <Bug className="h-5 w-5 text-purple-500" /> // Add an icon for debug
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg",
        isSelected ? "border-primary ring-2 ring-primary" : ""
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {platform.name}
        </CardTitle>
        {statusIcon[platform.status]} {/* Access icon based on last severity */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{platform.logsCount.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Total Logs</p>
      </CardContent>
    </Card>
  );
}
