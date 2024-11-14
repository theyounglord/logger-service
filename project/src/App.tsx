import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlatformCard } from '@/components/platform-card';
import { LogTable } from '@/components/log-table';
import { LogDetailsDialog } from '@/components/log-details-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Filters } from '@/components/filters';
import { platforms, mockLogs } from '@/data/mock-data';
import { Log } from '@/types/logs';
import { Search, ArrowLeft } from 'lucide-react';

export default function App() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: null,
    logType: '',
    apiEndpoint: '',
    sortBy: 'createdAt',
    limit: 10,
  });

  const uniqueLogTypes = Array.from(new Set(mockLogs.map(log => log.logType)));
  const uniqueApiEndpoints = Array.from(new Set(mockLogs.map(log => log.metadata.apiEndpoint).filter(Boolean)));

  const filteredLogs = mockLogs.filter((log) => {
    const matchesPlatform = selectedPlatform ? log.platform === selectedPlatform : true;
    const matchesSearch = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesLogType = filters.logType ? log.logType === filters.logType : true;
    const matchesDate = filters.date
      ? new Date(log.timestamp) >= new Date(filters.date)
      : true;
    const matchesApiEndpoint = filters.apiEndpoint
      ? log.metadata.apiEndpoint === filters.apiEndpoint
      : true;

    return matchesPlatform && matchesSearch && matchesLogType && matchesDate && matchesApiEndpoint;
  }).sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return filters.sortBy === 'createdAt'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  }).slice(0, filters.limit);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-8 p-8">
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

        {!selectedPlatform && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                isSelected={selectedPlatform === platform.name}
                onClick={() => setSelectedPlatform(platform.name)}
              />
            ))}
          </div>
        )}

        <div className="rounded-lg border bg-card transition-colors duration-300">
          <div className="border-b p-4 space-y-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Filters
              onFilterChange={setFilters}
              logTypes={uniqueLogTypes}
              apiEndpoints={uniqueApiEndpoints}
            />
          </div>
          <LogTable
            logs={filteredLogs}
            onViewDetails={(log) => {
              setSelectedLog(log);
              setIsDialogOpen(true);
            }}
          />
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