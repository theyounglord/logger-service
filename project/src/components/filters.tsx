import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  logTypes: string[];
  apiEndpoints: string[];
}

export function Filters({ onFilterChange, logTypes, apiEndpoints }: FiltersProps) {
  const [date, setDate] = useState<Date>();
  const [logType, setLogType] = useState<string>('all');
  const [apiEndpoint, setApiEndpoint] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [limit, setLimit] = useState('10');

  const handleFilterChange = (updates: Partial<any>) => {
    onFilterChange({
      date,
      logType: logType === 'all' ? '' : logType,
      apiEndpoint: apiEndpoint === 'all' ? '' : apiEndpoint,
      sortBy,
      limit: parseInt(limit),
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          handleFilterChange({ logType: value === 'all' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Log Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {logTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={apiEndpoint} onValueChange={(value) => {
          setApiEndpoint(value);
          handleFilterChange({ apiEndpoint: value === 'all' ? '' : value });
        }}>
          <SelectTrigger>
            <SelectValue placeholder="API Endpoint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Endpoints</SelectItem>
            {apiEndpoints.map((endpoint) => (
              <SelectItem key={endpoint} value={endpoint}>{endpoint}</SelectItem>
            ))}
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