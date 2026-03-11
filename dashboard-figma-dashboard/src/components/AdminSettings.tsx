import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Settings, Plus, Trash2, Save, MapPin, Code2, Heart, LogOut, Upload, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { loadConfig, saveConfig, type AppConfig, type Location, type APIConfiguration, type CustomEmotion, type CSVDataSource } from '../utils/appConfig';

type L1Category = 'high_energy_pleasant' | 'high_energy_unpleasant' | 'low_energy_unpleasant' | 'low_energy_pleasant';

interface AdminSettingsProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function AdminSettings({ isAuthenticated, onLogout }: AdminSettingsProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<AppConfig>(loadConfig());

  // Location Management
  const [newLocationName, setNewLocationName] = useState('');

  // API Management
  const [newApiName, setNewApiName] = useState('');
  const [newApiEndpoint, setNewApiEndpoint] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiDescription, setNewApiDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvDelimiter, setCsvDelimiter] = useState<'comma' | 'semicolon' | 'tab' | 'pipe'>('comma');
  const [csvOrientation, setCsvOrientation] = useState<'rows' | 'columns'>('rows');

  // Custom Emotion Management
  const [newEmotionName, setNewEmotionName] = useState('');
  const [newEmotionCategory, setNewEmotionCategory] = useState<L1Category>('high_energy_pleasant');

  const handleSaveConfig = () => {
    saveConfig(config);
    toast.success('Settings saved successfully!');
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Determine delimiter
        const delimiterMap = {
          comma: ',',
          semicolon: ';',
          tab: '\t',
          pipe: '|'
        };
        const delimiter = delimiterMap[csvDelimiter];
        
        const lines = text.split('\n').filter(line => line.trim());
        
        let headers: string[];
        let data: Record<string, any>[];
        
        if (csvOrientation === 'rows') {
          // Standard CSV: first row is headers, subsequent rows are data
          headers = lines[0].split(delimiter).map(h => h.trim()).filter(h => h !== '');
          
          data = lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim());
            const row: Record<string, any> = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
        } else {
          // Transposed CSV: first column is headers, subsequent columns are data
          const rows = lines.map(line => line.split(delimiter).map(v => v.trim()));
          headers = rows.map(row => row[0]).filter(h => h !== '');
          
          const numDataColumns = rows[0].length - 1;
          data = [];
          
          for (let colIndex = 1; colIndex <= numDataColumns; colIndex++) {
            const dataRow: Record<string, any> = {};
            headers.forEach((header, rowIndex) => {
              dataRow[header] = rows[rowIndex][colIndex] || '';
            });
            data.push(dataRow);
          }
        }

        const newCsvSource: CSVDataSource = {
          id: Date.now().toString(),
          name: file.name.replace(/\.(csv|txt)$/i, ''),
          uploadedAt: new Date().toISOString(),
          parameters: headers,
          data: data,
          enabled: true
        };

        const updatedConfig = {
          ...config,
          csvDataSources: [...config.csvDataSources, newCsvSource]
        };

        setConfig(updatedConfig);
        // Save immediately to localStorage so DataComparison can access it
        saveConfig(updatedConfig);

        setCsvFile(null);
        // Reset the file input
        event.target.value = '';
        toast.success(`CSV file "${file.name}" uploaded successfully with ${headers.length} parameters and ${data.length} rows`);
      };
      reader.readAsText(file);
    } else {
      toast.error('Please select a valid file');
    }
  };

  const processCsvComparison = () => {
    if (!csvFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    // Mock processing - in real implementation, would parse CSV and compare with current data
    toast.success('CSV data comparison initiated');
  };

  const toggleCSVSource = (id: string, enabled: boolean) => {
    setConfig({
      ...config,
      csvDataSources: config.csvDataSources.map(csv =>
        csv.id === id ? { ...csv, enabled } : csv
      )
    });
  };

  const removeCSVSource = (id: string) => {
    setConfig({
      ...config,
      csvDataSources: config.csvDataSources.filter(csv => csv.id !== id)
    });
    toast.success('CSV data source removed');
  };

  // Location handlers
  const addLocation = () => {
    if (!newLocationName) {
      toast.error('Please enter a location name');
      return;
    }

    const newLocation: Location = {
      id: Date.now().toString(),
      name: newLocationName,
      enabled: true
    };

    setConfig({
      ...config,
      locations: [...config.locations, newLocation]
    });

    setNewLocationName('');
    toast.success(`Added location: ${newLocationName}`);
  };

  const toggleLocation = (id: string, enabled: boolean) => {
    setConfig({
      ...config,
      locations: config.locations.map(loc =>
        loc.id === id ? { ...loc, enabled } : loc
      )
    });
  };

  const removeLocation = (id: string) => {
    setConfig({
      ...config,
      locations: config.locations.filter(loc => loc.id !== id)
    });
    toast.success('Location removed');
  };

  // API handlers
  const addAPI = () => {
    if (!newApiName || !newApiEndpoint) {
      toast.error('Please enter API name and endpoint');
      return;
    }

    const newAPI: APIConfiguration = {
      id: Date.now().toString(),
      name: newApiName,
      endpoint: newApiEndpoint,
      apiKey: newApiKey || 'YOUR_API_KEY_HERE',
      enabled: true,
      description: newApiDescription || ''
    };

    setConfig({
      ...config,
      apiConfigurations: [...config.apiConfigurations, newAPI]
    });

    setNewApiName('');
    setNewApiEndpoint('');
    setNewApiKey('');
    setNewApiDescription('');
    toast.success(`Added API: ${newApiName}`);
  };

  const toggleAPI = (id: string, enabled: boolean) => {
    setConfig({
      ...config,
      apiConfigurations: config.apiConfigurations.map(api =>
        api.id === id ? { ...api, enabled } : api
      )
    });
  };

  const removeAPI = (id: string) => {
    setConfig({
      ...config,
      apiConfigurations: config.apiConfigurations.filter(api => api.id !== id)
    });
    toast.success('API removed');
  };

  // Custom Emotion handlers
  const addCustomEmotion = () => {
    if (!newEmotionName) {
      toast.error('Please enter an emotion name');
      return;
    }

    const newEmotion: CustomEmotion = {
      id: Date.now().toString(),
      name: newEmotionName,
      l1Category: newEmotionCategory,
      translations: {}
    };

    setConfig({
      ...config,
      customEmotions: [...config.customEmotions, newEmotion]
    });

    setNewEmotionName('');
    toast.success(`Added emotion: ${newEmotionName}`);
  };

  const removeCustomEmotion = (id: string) => {
    setConfig({
      ...config,
      customEmotions: config.customEmotions.filter(emotion => emotion.id !== id)
    });
    toast.success('Custom emotion removed');
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
    toast.success('Logged out successfully');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!isAuthenticated}>
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Admin Settings</DialogTitle>
                <DialogDescription>
                  Manage emotions, locations, and API configurations
                </DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <Tabs defaultValue="emotions" className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground sticky top-0 z-10 mb-4">
              <TabsTrigger value="emotions">
                <Heart className="h-4 w-4 mr-2" />
                Emotions
              </TabsTrigger>
              <TabsTrigger value="locations">
                <MapPin className="h-4 w-4 mr-2" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="apis">
                <Code2 className="h-4 w-4 mr-2" />
                APIs
              </TabsTrigger>
            </TabsList>

            {/* Custom Emotions Tab */}
            <TabsContent value="emotions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Custom Emotion</CardTitle>
                  <CardDescription>
                    Add new L2 emotions to any L1 category
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emotion-name">Emotion Name</Label>
                      <Input
                        id="emotion-name"
                        placeholder="e.g., Overwhelmed"
                        value={newEmotionName}
                        onChange={(e) => setNewEmotionName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emotion-category">L1 Category</Label>
                      <Select value={newEmotionCategory} onValueChange={(value) => setNewEmotionCategory(value as L1Category)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high_energy_pleasant">High Energy Pleasant</SelectItem>
                          <SelectItem value="high_energy_unpleasant">High Energy Unpleasant</SelectItem>
                          <SelectItem value="low_energy_unpleasant">Low Energy Unpleasant</SelectItem>
                          <SelectItem value="low_energy_pleasant">Low Energy Pleasant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addCustomEmotion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Emotion
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Emotions ({config.customEmotions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.customEmotions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No custom emotions added yet</p>
                  ) : (
                    config.customEmotions.map((emotion) => (
                      <div key={emotion.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{emotion.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {emotion.l1Category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomEmotion(emotion.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Locations here are used to <strong>filter</strong> mood data on the dashboard. This dashboard does not show a list of kiosks by device. To manage or view kiosks (device ID → location), use the Supabase dashboard (<code className="text-xs bg-muted px-1 rounded">src-DashboardMT</code>) and its Admin → Locations tab.
              </p>
              <Card>
                <CardHeader>
                  <CardTitle>Add Location</CardTitle>
                  <CardDescription>
                    Add location names for filtering mood entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location-name">Location Name</Label>
                    <Input
                      id="location-name"
                      placeholder="e.g., Science Building - 3rd Floor"
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                    />
                  </div>
                  <Button onClick={addLocation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Locations ({config.locations.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <Switch
                          checked={location.enabled}
                          onCheckedChange={(checked: boolean) => toggleLocation(location.id, checked)}
                        />
                        <span className={!location.enabled ? 'text-muted-foreground' : ''}>
                          {location.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* APIs Tab */}
            <TabsContent value="apis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add API Configuration</CardTitle>
                  <CardDescription>
                    Configure external APIs for data export and integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-name">API Name</Label>
                    <Input
                      id="api-name"
                      placeholder="e.g., Student Information System"
                      value={newApiName}
                      onChange={(e) => setNewApiName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Endpoint</Label>
                    <Input
                      id="api-endpoint"
                      placeholder="https://api.example.com/v1/data"
                      value={newApiEndpoint}
                      onChange={(e) => setNewApiEndpoint(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-description">Description</Label>
                    <Textarea
                      id="api-description"
                      placeholder="Describe what this API is used for"
                      value={newApiDescription}
                      onChange={(e) => setNewApiDescription(e.target.value)}
                    />
                  </div>
                  <Button onClick={addAPI}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add API
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configurations ({config.apiConfigurations.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.apiConfigurations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No API configurations added yet</p>
                  ) : (
                    config.apiConfigurations.map((api) => (
                      <div key={api.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Switch
                            checked={api.enabled}
                            onCheckedChange={(checked: boolean) => toggleAPI(api.id, checked)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{api.name}</div>
                            <div className="text-sm text-muted-foreground">{api.endpoint}</div>
                            {api.description && (
                              <div className="text-xs text-muted-foreground mt-1">{api.description}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAPI(api.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CSV Data Comparison</CardTitle>
                  <CardDescription>
                    Upload CSV files to compare with current mood data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="csv-delimiter">Delimiter</Label>
                      <Select value={csvDelimiter} onValueChange={(value) => setCsvDelimiter(value as any)}>
                        <SelectTrigger id="csv-delimiter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comma">Comma (,)</SelectItem>
                          <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                          <SelectItem value="tab">Tab (\t)</SelectItem>
                          <SelectItem value="pipe">Pipe (|)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="csv-orientation">Data Orientation</Label>
                      <Select value={csvOrientation} onValueChange={(value) => setCsvOrientation(value as any)}>
                        <SelectTrigger id="csv-orientation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rows">Rows (Headers in first row)</SelectItem>
                          <SelectItem value="columns">Columns (Headers in first column)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="csv-upload">Upload CSV File</Label>
                    <div className="flex gap-2">
                      <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCsvUpload}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Select the delimiter used in your file (e.g., comma, semicolon)</p>
                    <p>• Choose data orientation: headers in rows (standard) or columns (transposed)</p>
                    <p>• Data will be available for correlation analysis</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>CSV Data Sources ({config.csvDataSources.length})</CardTitle>
                  <CardDescription>
                    Uploaded CSV files available for correlation analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {config.csvDataSources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No CSV files uploaded yet</p>
                  ) : (
                    config.csvDataSources.map((csv) => (
                      <div key={csv.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <Switch
                            checked={csv.enabled}
                            onCheckedChange={(checked: boolean) => toggleCSVSource(csv.id, checked)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{csv.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Uploaded: {new Date(csv.uploadedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Parameters: {csv.parameters.join(', ')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rows: {csv.data.length}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCSVSource(csv.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t bg-background">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveConfig}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
