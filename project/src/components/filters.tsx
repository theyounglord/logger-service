import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { LogSeverity } from '@/types/logs';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  selectedPlatform: string | null;
}

export function Filters({ onFilterChange, selectedPlatform }: FiltersProps) {
  const [logTypes, setLogTypes] = useState<string[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<string[]>([]);
  const [date, setDate] = useState<Date>();
  const [logType, setLogType] = useState<string>('All Types');
  const [apiEndpoint, setApiEndpoint] = useState<string>('All Endpoints');
  const [sortBy, setSortBy] = useState('createdAt');
  const [limit, setLimit] = useState('10');
  const [severity, setSeverity] = useState<string>('all');
  const [userEmail, setUserEmail] = useState<string>('');
  const [lastNMinutes, setLastNMinutes] = useState<string>('');

  // Available severity options
  const severityOptions: LogSeverity[] = ['info', 'warning', 'error', 'debug', 'success'];

  // Fetch log types dynamically based on the selected platform
  useEffect(() => {
    const fetchLogTypes = async () => {
      try {
        const platformQuery = selectedPlatform ? `?platform=${selectedPlatform}` : '';
        const response = await fetch(`http://localhost:3001/logtypes${platformQuery}`);
        const data = await response.json();
        setLogTypes(data);
      } catch (error) {
        console.error('Failed to fetch log types:', error);
      }
    };

    fetchLogTypes();
  }, [selectedPlatform]);

  // Fetch API endpoints dynamically based on the selected platform
  useEffect(() => {
    const fetchApiEndpoints = async () => {
      try {
        const platformQuery = selectedPlatform ? `?platform=${selectedPlatform}` : '';
        const response = await fetch(`http://localhost:3001/apiendpoints${platformQuery}`);
        const data = await response.json();
        setApiEndpoints(data);
      } catch (error) {
        console.error('Failed to fetch API endpoints:', error);
      }
    };

    fetchApiEndpoints();
  }, [selectedPlatform]);

  const handleFilterChange = (updates: Partial<any>) => {
    onFilterChange({
      platform: selectedPlatform,
      date,
      logType: logType === 'All Types' ? '' : logType,
      apiEndpoint: apiEndpoint === 'All Endpoints' ? '' : apiEndpoint,
      sortBy,
      limit: parseInt(limit),
      severity: severity === 'all' ? '' : severity,
      userEmail: userEmail.trim(),
      lastNMinutes: lastNMinutes.trim(),
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      {/* First Row of Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                handleFilterChange({ date: selectedDate });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Log Types Filter */}
        <Select value={logType} onValueChange={(value) => {
          setLogType(value);
          handleFilterChange({ logType: value === 'All Types' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Log Type" />
          </SelectTrigger>
          <SelectContent>
            {logTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Severity Filter */}
        <Select value={severity} onValueChange={(value) => {
          setSeverity(value);
          handleFilterChange({ severity: value === 'all' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {severityOptions.map((sev) => (
              <SelectItem key={sev} value={sev}>{sev}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Email Filter */}
        <Input
          placeholder="Filter by user email..."
          value={userEmail}
          onChange={(e) => {
            setUserEmail(e.target.value);
            handleFilterChange({ userEmail: e.target.value.trim() });
          }}
          className="h-10"
        />
      </div>

      {/* Second Row of Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* API Endpoints Filter */}
        <Select value={apiEndpoint} onValueChange={(value) => {
          setApiEndpoint(value);
          handleFilterChange({ apiEndpoint: value === 'All Endpoints' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="API Endpoint" />
          </SelectTrigger>
          <SelectContent>
            {apiEndpoints.map((endpoint) => (
              <SelectItem key={endpoint} value={endpoint}>{endpoint}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By Filter */}
        <Select value={sortBy} onValueChange={(value) => {
          setSortBy(value);
          handleFilterChange({ sortBy: value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created At</SelectItem>
            <SelectItem value="updatedAt">Updated At</SelectItem>
          </SelectContent>
        </Select>

        {/* Last N Minutes Filter */}
        <Input
          placeholder="Filter by last n minutes..."
          value={lastNMinutes}
          onChange={(e) => {
            setLastNMinutes(e.target.value);
            handleFilterChange({ lastNMinutes: e.target.value.trim() });
          }}
          className="h-10"
        />

        {/* Limit Filter */}
        <Select value={limit} onValueChange={(value) => {
          setLimit(value);
          handleFilterChange({ limit: parseInt(value) });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 entries</SelectItem>
            <SelectItem value="25">25 entries</SelectItem>
            <SelectItem value="50">50 entries</SelectItem>
            <SelectItem value="100">100 entries</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}