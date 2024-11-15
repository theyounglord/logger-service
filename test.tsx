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
  const [date, setDate] = useState<Date>();
  const [logType, setLogType] = useState<string>('All Types');
  const [apiEndpoint, setApiEndpoint] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [limit, setLimit] = useState('10');
  const [severity, setSeverity] = useState<string>('all');
  const [userEmail, setUserEmail] = useState<string>('');

  // Available severity options
  const severityOptions: LogSeverity[] = ['info', 'warning', 'error', 'debug'];

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

  const handleFilterChange = (updates: Partial<any>) => {
    onFilterChange({
      date,
      logType: logType === 'All Types' ? '' : logType,
      apiEndpoint: apiEndpoint === 'all' ? '' : apiEndpoint,
      sortBy,
      limit: parseInt(limit),
      severity: severity === 'all' ? '' : severity,
      userEmail: userEmail.trim(),
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              onSelect={(date) => {
                setDate(date);
                handleFilterChange({ date });
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={logType} onValueChange={(value) => {
          setLogType(value);
          handleFilterChange({ logType: value === 'All Types' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Log Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Types">All Types</SelectItem>
            {logTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Select value={apiEndpoint} onValueChange={(value) => {
          setApiEndpoint(value);
          handleFilterChange({ apiEndpoint: value === 'all' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="API Endpoint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Endpoints</SelectItem>
            {/* Add other endpoints dynamically if needed */}
          </SelectContent>
        </Select>
        
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