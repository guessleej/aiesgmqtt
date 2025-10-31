import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Zap, Wind, Leaf, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

interface DashboardData {
  electricity: {
    total: number;
    unit: string;
    devices: number;
    activeDevices: number;
  };
  water: {
    total: number;
    unit: string;
  };
  airQuality: {
    co2: number;
    pm25: number | null;
    pm10: number | null;
    temperature: number | null;
    humidity: number | null;
    location: string;
    recordedAt: Date;
  } | null;
  carbon: {
    total: number;
    unit: string;
    byType: {
      scope1: number;
      scope2: number;
      scope3: number;
    };
  };
}

export default function Dashboard() {
  const { data, isLoading, refetch } = trpc.dashboard.getOverview.useQuery();
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dashboardData = data as DashboardData | undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Navigation />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              環境監控儀表板
            </h1>
            <p className="text-gray-600">
              實時監控水、電、空氣質量與碳排放數據
            </p>
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? "自動更新中" : "已暫停更新"}
          </Button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Electricity Card */}
          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  用電量
                </CardTitle>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {dashboardData?.electricity.total ? Number(dashboardData.electricity.total).toFixed(1) : "0"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {dashboardData?.electricity.unit}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>設備數: {dashboardData?.electricity.devices || 0}</span>
                  <span>•</span>
                  <span className="text-green-600 font-medium">
                    運行中: {dashboardData?.electricity.activeDevices || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Card */}
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  用水量
                </CardTitle>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {dashboardData?.water.total ? Number(dashboardData.water.total).toFixed(0) : "0"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {dashboardData?.water.unit}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  本月累計用量
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Air Quality Card */}
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  空氣質量
                </CardTitle>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Wind className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData?.airQuality ? (
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {dashboardData.airQuality.co2}
                    </span>
                    <span className="text-sm text-gray-600">ppm CO₂</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {dashboardData.airQuality.temperature !== null && (
                      <div>溫度: {Number(dashboardData.airQuality.temperature).toFixed(1)}°C</div>
                    )}
                    {dashboardData.airQuality.humidity !== null && (
                      <div>濕度: {Number(dashboardData.airQuality.humidity).toFixed(0)}%</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">暫無數據</div>
              )}
            </CardContent>
          </Card>

          {/* Carbon Emissions Card */}
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700">
                  碳排放
                </CardTitle>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {dashboardData?.carbon.total ? Number(dashboardData.carbon.total).toFixed(1) : "0"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {dashboardData?.carbon.unit}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  本月累計排放
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Carbon Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Scope 1 排放
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {dashboardData?.carbon.byType.scope1 ? Number(dashboardData.carbon.byType.scope1).toFixed(1) : "0"}
                </span>
                <span className="text-sm text-gray-600">kg CO₂e</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                直接排放源（燃料燃燒等）
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                Scope 2 排放
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {dashboardData?.carbon.byType.scope2 ? Number(dashboardData.carbon.byType.scope2).toFixed(1) : "0"}
                </span>
                <span className="text-sm text-gray-600">kg CO₂e</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                間接排放源（購買電力等）
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Scope 3 排放
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {dashboardData?.carbon.byType.scope3 ? Number(dashboardData.carbon.byType.scope3).toFixed(1) : "0"}
                </span>
                <span className="text-sm text-gray-600">kg CO₂e</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                其他間接排放（供應鏈等）
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
}
