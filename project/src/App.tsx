import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlatformCard } from '@/components/platform-card';
import { LogTable } from '@/components/log-table';
import { LogDetailsDialog } from '@/components/log-details-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Filters } from '@/components/filters';
import { Log, PlatformData } from '@/types/logs';
import { Search, ArrowLeft } from 'lucide-react';

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: null,
    logType: '',
    apiEndpoint: '',
    sortBy: 'createdAt',
    limit: 10,
    severity: '',
    userEmail: '',
    lastNMinutes: '',
  });

  // Fetch Platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('http://localhost:3001/platforms');
        const data: PlatformData[] = await response.json();
        setPlatforms(data);
      } catch (error) {
        console.error('Failed to fetch platforms:', error);
      }
    };

    fetchPlatforms();
  }, []);

  // Fetch Logs Based on Filters
  useEffect(() => {
    const fetchLogs = async () => {
      const queryParams = new URLSearchParams();

      // Include platform if selected
      if (selectedPlatform) queryParams.append('platform', selectedPlatform);

      // Append all other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      try {
        const response = await fetch(`http://localhost:3001/logs?${queryParams.toString()}`);
        const data: Log[] = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
  }, [filters, selectedPlatform]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="flex flex-col h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-background border-b">
          <div className="mx-auto max-w-7xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedPlatform && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedPlatform(null)}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-3xl font-bold">
                  {selectedPlatform || 'Logger Dashboard'}
                </h1>
                <ThemeToggle />
              </div>
              <div className="relative w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl p-4 h-full flex flex-col gap-4">
            {/* Platform Cards */}
            {!selectedPlatform && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {platforms.map((platform) => (
                  <PlatformCard
                    key={platform.DISTINCT}
                    platform={{
                      id: platform.DISTINCT,
                      name: platform.DISTINCT,
                      status: platform.lastSeverity || 'success',
                      logsCount: platform.LOGCOUNT,
                    }}
                    isSelected={selectedPlatform === platform.DISTINCT}
                    onClick={() => setSelectedPlatform(platform.DISTINCT)}
                  />
                ))}
              </div>
            )}

            {/* Logs Section */}
            <div className="flex-1 flex flex-col min-h-0 rounded-lg border bg-card">
              {/* Sticky Filters */}
              <div className="sticky top-0 z-40 border-b bg-card">
                <div className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <Filters
                    onFilterChange={(updatedFilters) =>
                      setFilters((prevFilters) => ({ ...prevFilters, ...updatedFilters }))
                    }
                    selectedPlatform={selectedPlatform}
                  />
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="flex-1 overflow-auto">
                <LogTable
                  logs={logs}
                  onViewDetails={(log) => {
                    setSelectedLog(log);
                    setIsDialogOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <LogDetailsDialog
          log={selectedLog}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </div>
  );
}
