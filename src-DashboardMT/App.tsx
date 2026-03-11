import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import { StatsCards } from "./components/StatsCards";
import { MoodDistributionChart } from "./components/MoodDistributionChart";
import { MoodTrendChart } from "./components/MoodTrendChart";
import { MoodBarChart } from "./components/MoodBarChart";
import { DateSearch } from "./components/DateSearch";
import { CustomDateRange } from "./components/CustomDateRange";
import { ExportButtons } from "./components/ExportButtons";
import { DataComparison } from "./components/DataComparison";
import { L2EmotionBreakdown } from "./components/L2EmotionBreakdown";
import {
  generateMockData,
  generateMockDataForDateRange,
  filterDataByDate,
  aggregateMoodData,
  aggregateL2Emotions,
  getMoodStats,
} from "./utils/mockMoodData";
import { fetchMoodEntries } from "./services/api";
import { Moon, Sun } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { LocationsAdmin } from "./components/LocationsAdmin";
import { AirQualityPanel } from "./components/AirQualityPanel";
import { getTestingMode, setTestingMode } from "./utils/testingMode";
import { Button } from "./components/ui/button";

type TimePeriod = "day" | "week" | "month" | "year";
type Tab = TimePeriod | "admin" | "airquality";

export default function App() {
  const [tab, setTab] = useState<Tab>("week");
  const [testingMode, setTestingModeState] = useState(getTestingMode);

  // Only analytics tabs have a real "period"
  const period: TimePeriod = tab === "admin" ? "week" : tab;

  const [nightVision, setNightVision] = useState(false);
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [apiData, setApiData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(true);

  const toggleTestingMode = (on: boolean) => {
    setTestingMode(on);
    setTestingModeState(on);
  };

  useEffect(() => {
    async function loadData() {
      if (testingMode) {
        setApiData([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const entries = await fetchMoodEntries();
        setApiData(entries);
        console.log(`Loaded ${entries.length} entries from API`);
      } catch (error) {
        console.error("Failed to load data from API:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    if (testingMode) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [testingMode]);

  useEffect(() => {
    if (testingMode && tab === "admin") setTab("week");
  }, [testingMode]);

  useEffect(() => {
    if (nightVision) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [nightVision]);

  const rawMoodData = useMemo(() => {
    if (!testingMode && useRealData && apiData.length > 0) return apiData;

    if (customRange?.from && customRange?.to) {
      return generateMockDataForDateRange(customRange.from, customRange.to);
    }

    return generateMockData(period);
  }, [testingMode, useRealData, apiData, period, customRange]);

  const moodData = useMemo(() => {
    if (searchDate) return filterDataByDate(rawMoodData, searchDate);
    return rawMoodData;
  }, [rawMoodData, searchDate]);

  const aggregatedData = useMemo(() => aggregateMoodData(moodData, period), [moodData, period]);
  const l2Data = useMemo(() => aggregateL2Emotions(moodData), [moodData]);
  const stats = useMemo(() => getMoodStats(moodData), [moodData]);

  const handleDateSearch = (date: Date | undefined) => {
    setSearchDate(date);
    if (date) setCustomRange(undefined);
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range) setSearchDate(undefined);
  };

  const AnalyticsPanel = (
    <>
      {(searchDate || customRange) && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm">
            {searchDate &&
              `Showing data for: ${searchDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`}
            {customRange?.from &&
              customRange?.to &&
              `Showing data from: ${customRange.from.toLocaleDateString()} to ${customRange.to.toLocaleDateString()}`}
          </p>
        </div>
      )}

      <StatsCards
        total={stats.total}
        percentages={stats.percentages}
        averageIntensity={stats.averageIntensity}
        avgResponseTime={stats.avgResponseTime}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MoodDistributionChart l1Counts={stats.l1Counts} />
        <MoodBarChart data={aggregatedData} />
      </div>

      <MoodTrendChart data={aggregatedData} />
      <DataComparison data={moodData} />
      <L2EmotionBreakdown data={l2Data} limit={30} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-muted-foreground mb-2">Most Common L1</h4>
          <p>
            {Object.entries(stats.percentages)
              .reduce((a, b) =>
                stats.percentages[a[0] as keyof typeof stats.percentages] >
                stats.percentages[b[0] as keyof typeof stats.percentages]
                  ? a
                  : b
              )[0]
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-muted-foreground mb-2">Top L2 Emotion</h4>
          <p>
            {l2Data[0]?.emotion || "N/A"} ({l2Data[0]?.count || 0})
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-muted-foreground mb-2">Data Points</h4>
          <p>{stats.total} entries analyzed</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1>MoodMeter Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track and analyze student emotional data with L1/L2 categorization
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <ExportButtons data={moodData} stats={stats} />
            <Button variant="outline" onClick={() => setTab("airquality")}>
              Air quality
            </Button>
            <div className="flex items-center space-x-2">
              <Label htmlFor="testing-mode" className="text-sm text-muted-foreground">Demo mode</Label>
              <Switch
                id="testing-mode"
                checked={testingMode}
                onCheckedChange={toggleTestingMode}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch id="night-vision" checked={nightVision} onCheckedChange={setNightVision} />
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="night-vision" className="ml-2">
                Night Vision
              </Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DateSearch onDateSelect={handleDateSearch} selectedDate={searchDate} />
          <CustomDateRange onRangeSelect={handleCustomRange} selectedRange={customRange} />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="flex flex-wrap justify-center gap-2 w-full max-w-3xl">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
            <TabsTrigger value="airquality">Air quality</TabsTrigger>
            {!testingMode && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="day" className="space-y-6 mt-6">
            {AnalyticsPanel}
          </TabsContent>

          <TabsContent value="week" className="space-y-6 mt-6">
            {AnalyticsPanel}
          </TabsContent>

          <TabsContent value="month" className="space-y-6 mt-6">
            {AnalyticsPanel}
          </TabsContent>

          <TabsContent value="year" className="space-y-6 mt-6">
            {AnalyticsPanel}
          </TabsContent>

          <TabsContent value="airquality" className="space-y-6 mt-6">
            <AirQualityPanel />
          </TabsContent>

          {!testingMode && (
            <TabsContent value="admin" className="space-y-6 mt-6">
              <LocationsAdmin />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
