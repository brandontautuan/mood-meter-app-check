import { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { StatsCards } from './components/StatsCards';
import { MoodDistributionChart } from './components/MoodDistributionChart';
import { MoodTrendChart } from './components/MoodTrendChart';
import { MoodBarChart } from './components/MoodBarChart';
import { DateSearch } from './components/DateSearch';
import { CustomDateRange } from './components/CustomDateRange';
import { ExportButtons } from './components/ExportButtons';
import { DataComparison } from './components/DataComparison';
import { L2EmotionBreakdown } from './components/L2EmotionBreakdown';
import { AdminSettings } from './components/AdminSettings';
import { AdminLogin } from './components/AdminLogin';
import { DashboardSettings } from './components/DashboardSettings';
import { DashboardTutorial } from './components/DashboardTutorial';
import { ReactionTimeChart } from './components/ThemePreferenceChart';
import { LocationStats } from './components/LocationStats';
import { AirQualityPanel } from './components/AirQualityPanel';
import { 
  generateMockData, 
  generateMockDataForDateRange, 
  filterDataByDate,
  aggregateMoodData, 
  aggregateL2Emotions,
  getMoodStats 
} from './utils/mockMoodData';
import { filterByLocation } from './utils/filterUtils';
import { useTranslation, LanguageType } from './utils/dashboardTranslations';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { getTranslatedL1Label, getTranslatedL2Label } from './utils/emotionCategories';
import { Moon, Sun, Settings, LogOut, Wind, LayoutDashboard } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Toaster } from './components/ui/sonner';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

function DashboardContent() {
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [nightVision, setNightVision] = useState(false);
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAirQuality, setShowAirQuality] = useState(false);
  
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    if (nightVision) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [nightVision]);

  // Generate data based on active filters
  const rawMoodData = useMemo(() => {
    if (customRange?.from && customRange?.to) {
      return generateMockDataForDateRange(customRange.from, customRange.to);
    }
    return generateMockData(period);
  }, [period, customRange]);

  // Apply date search filter and location filter
  const moodData = useMemo(() => {
    let filtered = rawMoodData;
    
    // Apply date filter
    if (searchDate) {
      filtered = filterDataByDate(filtered, searchDate);
    }
    
    // Apply location filter
    filtered = filterByLocation(filtered, selectedLocation);
    
    return filtered;
  }, [rawMoodData, searchDate, selectedLocation]);

  const aggregatedData = useMemo(() => aggregateMoodData(moodData, period), [moodData, period]);
  const l2Data = useMemo(() => aggregateL2Emotions(moodData), [moodData]);
  const stats = useMemo(() => getMoodStats(moodData), [moodData]);

  const handleDateSearch = (date: Date | undefined) => {
    setSearchDate(date);
    if (date) {
      setCustomRange(undefined); // Clear custom range when searching specific date
    }
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range) {
      setSearchDate(undefined); // Clear date search when using custom range
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as LanguageType);
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  const handleAdminClick = () => {
    setShowLoginDialog(true);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowLoginDialog(false);
  };

  return (
    <>
      <Toaster />
      <AdminLogin 
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLoginSuccess={handleLoginSuccess}
      />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1>{t('moodMeterDashboard')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('realTimeAnalytics')}
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {!isAdminAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleAdminClick}>
                <Settings className="h-4 w-4 mr-2" />
                {t('adminLogin')}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg border border-green-300 dark:border-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{t('adminActive')}</span>
                </div>
                <AdminSettings 
                  isAuthenticated={isAdminAuthenticated}
                  onLogout={handleLogout}
                />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            )}
            <DashboardSettings 
              onLanguageChange={handleLanguageChange}
              onLocationChange={handleLocationChange}
              onStartTutorial={() => setShowTutorial(true)}
            />
            <ExportButtons data={moodData} stats={stats} />
            <Button
              variant={showAirQuality ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAirQuality(!showAirQuality)}
            >
              <Wind className="h-4 w-4 mr-2" />
              Air quality
            </Button>
            {showAirQuality && (
              <Button variant="ghost" size="sm" onClick={() => setShowAirQuality(false)}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Back to dashboard
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch 
                id="night-vision" 
                checked={nightVision}
                onCheckedChange={setNightVision}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="night-vision" className="ml-2">{t('nightVision')}</Label>
            </div>
          </div>
        </div>

        {/* Air quality view (when toggled) */}
        {showAirQuality ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Air quality</h2>
            <AirQualityPanel />
          </div>
        ) : (
          <>
        {/* Date Search and Custom Range */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DateSearch 
            onDateSelect={handleDateSearch}
            selectedDate={searchDate}
          />
          <CustomDateRange 
            onRangeSelect={handleCustomRange}
            selectedRange={customRange}
          />
        </div>

        {/* Time Period Tabs */}
        <Tabs value={period} onValueChange={(value: string) => setPeriod(value as TimePeriod)}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="day">{t('day')}</TabsTrigger>
            <TabsTrigger value="week">{t('week')}</TabsTrigger>
            <TabsTrigger value="month">{t('month')}</TabsTrigger>
            <TabsTrigger value="year">{t('year')}</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-6 mt-6">
            {/* Info Banner */}
            {(searchDate || customRange) && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm">
                  {searchDate && `Showing data for: ${searchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                  {customRange?.from && customRange?.to && `Showing data from: ${customRange.from.toLocaleDateString()} to ${customRange.to.toLocaleDateString()}`}
                </p>
              </div>
            )}

            {/* Stats Cards */}
            <StatsCards 
              total={stats.total}
              percentages={stats.percentages}
              averageIntensity={stats.averageIntensity}
              avgResponseTime={stats.avgResponseTime}
            />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MoodDistributionChart l1Counts={stats.l1Counts} />
              <MoodBarChart data={aggregatedData} />
            </div>

            {/* Trend Chart - Full Width */}
            <MoodTrendChart data={aggregatedData} />

            {/* Data Comparison - Full Width */}
            <DataComparison data={moodData} />

            {/* L2 Emotion Breakdown */}
            <L2EmotionBreakdown data={l2Data} limit={30} />

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReactionTimeChart 
                data={moodData}
              />
              <LocationStats data={moodData} />
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-muted-foreground mb-2">{t('mostCommonL1')}</h4>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ 
                      backgroundColor: stats.percentages.high_energy_pleasant >= Math.max(...Object.values(stats.percentages)) 
                        ? '#facc15' 
                        : stats.percentages.low_energy_pleasant >= Math.max(...Object.values(stats.percentages))
                        ? '#10b981'
                        : stats.percentages.high_energy_unpleasant >= Math.max(...Object.values(stats.percentages))
                        ? '#ef4444'
                        : '#3b82f6'
                    }}
                  ></div>
                  <p>
                    {getTranslatedL1Label(
                      Object.entries(stats.percentages).reduce((a, b) => 
                        stats.percentages[a[0] as keyof typeof stats.percentages] > stats.percentages[b[0] as keyof typeof stats.percentages] ? a : b
                      )[0] as any,
                      language
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-muted-foreground mb-2">{t('topL2Emotion')}</h4>
                <p>{l2Data[0] ? getTranslatedL2Label(l2Data[0].emotion, language) : t('notAvailable')} ({l2Data[0]?.count || 0})</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-muted-foreground mb-2">{t('dataPoints')}</h4>
                <p>{stats.total} {t('entriesAnalyzed')}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
      
      {/* Tutorial Component */}
      <DashboardTutorial 
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
