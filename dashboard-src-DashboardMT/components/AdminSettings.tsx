import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Trash2, Plus, Eye, EyeOff, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { loadConfig, saveConfig as saveAppConfig, type AppConfig } from '../utils/appConfig';

// Types for admin configuration
interface CustomEmotion {
  id: string;
  name: string;
  category: string;
  translations?: Record<string, string>;
}

interface Language {
  code: string;
  name: string;
  enabled: boolean;
  isDefault?: boolean;
}

interface Location {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  description?: string;
  enabled: boolean;
}

interface AdminConfig {
  customEmotions: CustomEmotion[];
  languages: Language[];
  locations: Location[];
  apiConfigs: ApiConfig[];
}

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English', enabled: true, isDefault: true },
  { code: 'es', name: 'Spanish', enabled: false },
  { code: 'fr', name: 'French', enabled: false },
  { code: 'de', name: 'German', enabled: false },
  { code: 'zh', name: 'Chinese', enabled: false },
  { code: 'ja', name: 'Japanese', enabled: false },
  { code: 'ar', name: 'Arabic', enabled: false },
];

const emotionCategories = ['Pleasant-High', 'Pleasant-Low', 'Unpleasant-High', 'Unpleasant-Low'];

interface AdminSettingsProps {
  isAuthenticated: boolean;
  onConfigChange?: (config: AdminConfig) => void;
}

export function AdminSettings({ isAuthenticated, onConfigChange }: AdminSettingsProps) {
  const [config, setConfig] = useState<AdminConfig>({
    customEmotions: [],
    languages: defaultLanguages,
    locations: [],
    apiConfigs: []
  });
  
  const [newEmotion, setNewEmotion] = useState({ name: '', category: emotionCategories[0] });
  const [newLanguage, setNewLanguage] = useState({ code: '', name: '' });
  const [newLocation, setNewLocation] = useState({ name: '', description: '' });
  const [newApiConfig, setNewApiConfig] = useState({ name: '', endpoint: '', apiKey: '', description: '' });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Load config from localStorage (same key as appConfig / LocationStats: moodmeter_app_config)
  useEffect(() => {
    try {
      const appConfig = loadConfig();
      setConfig(prevConfig => ({
        ...prevConfig,
        locations: appConfig.locations ?? prevConfig.locations,
        languages: appConfig.languages?.length ? appConfig.languages : defaultLanguages,
        apiConfigs: appConfig.apiConfigurations ?? prevConfig.apiConfigs,
        customEmotions: (appConfig as unknown as { customEmotions?: AdminConfig['customEmotions'] }).customEmotions ?? prevConfig.customEmotions
      }));
    } catch (error) {
      console.error('Error loading admin config:', error);
    }
  }, []);

  const saveConfig = () => {
    const appConfig: AppConfig = {
      ...loadConfig(),
      locations: config.locations,
      languages: config.languages,
      apiConfigurations: config.apiConfigs,
      customEmotions: config.customEmotions as AppConfig['customEmotions'],
      defaultLanguage: config.languages.find(l => l.isDefault)?.code ?? 'en'
    };
    saveAppConfig(appConfig);
    onConfigChange?.(config);
    toast.success('Configuration saved successfully!');
  };

  // Custom Emotions Management
  const addCustomEmotion = () => {
    if (!newEmotion.name.trim()) return;
    
    const emotion: CustomEmotion = {
      id: Date.now().toString(),
      name: newEmotion.name.trim(),
      category: newEmotion.category
    };
    
    setConfig(prev => ({
      ...prev,
      customEmotions: [...prev.customEmotions, emotion]
    }));
    
    setNewEmotion({ name: '', category: emotionCategories[0] });
    toast.success(`Added emotion: ${emotion.name}`);
  };

  const removeCustomEmotion = (id: string) => {
    setConfig(prev => ({
      ...prev,
      customEmotions: prev.customEmotions.filter(e => e.id !== id)
    }));
    toast.success('Emotion removed');
  };

  // Language Management
  const addLanguage = () => {
    if (!newLanguage.code.trim() || !newLanguage.name.trim()) return;
    
    const language: Language = {
      code: newLanguage.code.toLowerCase().trim(),
      name: newLanguage.name.trim(),
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      languages: [...prev.languages, language]
    }));
    
    setNewLanguage({ code: '', name: '' });
    toast.success(`Added language: ${language.name}`);
  };

  const toggleLanguage = (code: string) => {
    setConfig(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    }));
  };

  const removeLanguage = (code: string) => {
    const language = config.languages.find(l => l.code === code);
    if (language?.isDefault) {
      toast.error('Cannot remove default language');
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.code !== code)
    }));
    toast.success('Language removed');
  };

  // Location Management
  const addLocation = () => {
    if (!newLocation.name.trim()) return;
    
    const location: Location = {
      id: Date.now().toString(),
      name: newLocation.name.trim(),
      description: newLocation.description.trim() || undefined,
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      locations: [...prev.locations, location]
    }));
    
    setNewLocation({ name: '', description: '' });
    toast.success(`Added location: ${location.name}`);
  };

  const toggleLocation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      locations: prev.locations.map(loc => 
        loc.id === id ? { ...loc, enabled: !loc.enabled } : loc
      )
    }));
  };

  const removeLocation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== id)
    }));
    toast.success('Location removed');
  };

  // API Configuration Management
  const addApiConfig = () => {
    if (!newApiConfig.name.trim() || !newApiConfig.endpoint.trim()) return;
    
    const apiConfig: ApiConfig = {
      id: Date.now().toString(),
      name: newApiConfig.name.trim(),
      endpoint: newApiConfig.endpoint.trim(),
      apiKey: newApiConfig.apiKey.trim(),
      description: newApiConfig.description.trim() || undefined,
      enabled: true
    };
    
    setConfig(prev => ({
      ...prev,
      apiConfigs: [...prev.apiConfigs, apiConfig]
    }));
    
    setNewApiConfig({ name: '', endpoint: '', apiKey: '', description: '' });
    toast.success(`Added API config: ${apiConfig.name}`);
  };

  const toggleApiConfig = (id: string) => {
    setConfig(prev => ({
      ...prev,
      apiConfigs: prev.apiConfigs.map(api => 
        api.id === id ? { ...api, enabled: !api.enabled } : api
      )
    }));
  };

  const removeApiConfig = (id: string) => {
    setConfig(prev => ({
      ...prev,
      apiConfigs: prev.apiConfigs.filter(a => a.id !== id)
    }));
    toast.success('API configuration removed');
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="h-4 w-4" />
          Admin Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="emotions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
          </TabsList>
          
          {/* Custom Emotions Tab */}
          <TabsContent value="emotions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Emotions</CardTitle>
                <CardDescription>
                  Add custom L2 emotions and assign them to L1 categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Emotion name"
                    value={newEmotion.name}
                    onChange={(e) => setNewEmotion(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select 
                    value={newEmotion.category} 
                    onValueChange={(value) => setNewEmotion(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emotionCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addCustomEmotion} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {config.customEmotions.map(emotion => (
                    <div key={emotion.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{emotion.name}</span>
                        <Badge variant="secondary" className="ml-2">{emotion.category}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomEmotion(emotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Language Management</CardTitle>
                <CardDescription>
                  Add and manage supported languages for the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Language code (e.g., 'pt')"
                    value={newLanguage.code}
                    onChange={(e) => setNewLanguage(prev => ({ ...prev, code: e.target.value }))}
                  />
                  <Input
                    placeholder="Language name (e.g., 'Portuguese')"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Button onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {config.languages.map(language => (
                    <div key={language.code} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{language.name}</span>
                        <Badge variant="outline">{language.code}</Badge>
                        {language.isDefault && <Badge>Default</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={language.enabled}
                          onCheckedChange={() => toggleLanguage(language.code)}
                        />
                        {!language.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLanguage(language.code)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kiosk Locations</CardTitle>
                <CardDescription>
                  Manage physical locations where mood meters are installed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Location name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newLocation.description}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button onClick={addLocation} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-2">
                  {config.locations.map(location => (
                    <div key={location.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{location.name}</span>
                        {location.description && (
                          <p className="text-sm text-muted-foreground">{location.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={location.enabled}
                          onCheckedChange={() => toggleLocation(location.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocation(location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* API Configuration Tab */}
          <TabsContent value="apis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Integrations</CardTitle>
                <CardDescription>
                  Configure external APIs for data export and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="API name"
                    value={newApiConfig.name}
                    onChange={(e) => setNewApiConfig(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Endpoint URL"
                    value={newApiConfig.endpoint}
                    onChange={(e) => setNewApiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                  />
                  <Input
                    placeholder="API Key"
                    type="password"
                    value={newApiConfig.apiKey}
                    onChange={(e) => setNewApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Description"
                      value={newApiConfig.description}
                      onChange={(e) => setNewApiConfig(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Button onClick={addApiConfig} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {config.apiConfigs.map(apiConfig => (
                    <div key={apiConfig.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{apiConfig.name}</h4>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={apiConfig.enabled}
                            onCheckedChange={() => toggleApiConfig(apiConfig.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeApiConfig(apiConfig.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{apiConfig.endpoint}</p>
                      {apiConfig.description && (
                        <p className="text-sm">{apiConfig.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm">API Key:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showApiKeys[apiConfig.id] ? apiConfig.apiKey : '•••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(apiConfig.id)}
                        >
                          {showApiKeys[apiConfig.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end pt-4">
          <Button onClick={saveConfig} className="gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}