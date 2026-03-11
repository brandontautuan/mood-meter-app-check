import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, Users, Percent } from 'lucide-react';
import { loadConfig } from '../utils/appConfig';

interface MoodEntry {
  id: string;
  emotion: string;
  quadrant: string;
  timestamp: string;
  locationId?: string;
  themePreference?: 'light' | 'dark';
}

interface LocationStatsProps {
  data: MoodEntry[];
}

// Color palette for different locations
const LOCATION_COLORS = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export function LocationStats({ data }: LocationStatsProps) {
  const locationStats = useMemo(() => {
    // Load locations from app config (same key as DashboardSettings / appConfig)
    const config = loadConfig();
    const availableLocations = config.locations || [];

    // Count check-ins by location
    const locationCounts = data.reduce((acc, entry) => {
      const locationId = entry.locationId || 'unknown';
      acc[locationId] = (acc[locationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Create chart data
    const chartData = Object.entries(locationCounts).map(([locationId, count], index) => {
      const location = availableLocations.find(loc => loc.id === locationId);
      const name = location?.name || (locationId === 'unknown' ? 'Unknown Location' : locationId);
      
      return {
        locationId,
        name,
        count,
        percentage: ((count / data.length) * 100).toFixed(1),
        color: LOCATION_COLORS[index % LOCATION_COLORS.length]
      };
    }).sort((a, b) => b.count - a.count);

    return {
      chartData,
      totalLocations: chartData.length,
      mostPopular: chartData[0] || null,
      totalCheckIns: data.length
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Statistics
          </CardTitle>
          <CardDescription>Check-ins by kiosk location</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No location data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Locations</p>
                <p className="text-2xl font-bold">{locationStats.totalLocations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Check-ins</p>
                <p className="text-2xl font-bold">{locationStats.totalCheckIns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {locationStats.mostPopular && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Most Popular</p>
                  <p className="text-lg font-bold">{locationStats.mostPopular.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {locationStats.mostPopular.percentage}% of check-ins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Location Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Check-ins by Location
          </CardTitle>
          <CardDescription>
            Distribution of mood check-ins across different kiosk locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={locationStats.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label: string) => `Location: ${label}`}
                  formatter={(value: number) => [
                    `${value} check-ins`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {locationStats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Location Legend */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {locationStats.chartData.map((location, index) => (
              <div key={location.locationId} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: location.color }}
                />
                <span className="truncate">
                  {location.name} ({location.count})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}