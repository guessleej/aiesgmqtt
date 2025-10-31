import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Power, PowerOff, Wifi, WifiOff, Zap, MapPin, Settings } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface PowerDevice {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  location: string | null;
  status: "on" | "off" | "offline";
  powerRating: number | null;
  mqttTopic: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DeviceManagement() {
  const { data: devices, isLoading, refetch } = trpc.powerDevices.list.useQuery();
  const toggleMutation = trpc.powerDevices.toggle.useMutation({
    onSuccess: () => {
      toast.success("設備指令已發送");
      refetch();
    },
    onError: (error) => {
      toast.error("設備控制失敗: " + error.message);
    },
  });

  const handleToggle = async (deviceId: string, currentStatus: string) => {
    const newCommand = currentStatus === "on" ? "off" : "on";
    await toggleMutation.mutateAsync({
      deviceId,
      command: newCommand,
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "light":
        return "💡";
      case "ac":
        return "❄️";
      case "equipment":
        return "⚙️";
      default:
        return "🔌";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <Power className="w-3 h-3 mr-1" />
            運行中
          </Badge>
        );
      case "off":
        return (
          <Badge variant="secondary">
            <PowerOff className="w-3 h-3 mr-1" />
            已關閉
          </Badge>
        );
      case "offline":
        return (
          <Badge variant="destructive">
            <WifiOff className="w-3 h-3 mr-1" />
            離線
          </Badge>
        );
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center">
          <Settings className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">載入設備列表...</p>
        </div>
      </div>
    );
  }

  const deviceList = (devices as PowerDevice[]) || [];
  const activeDevices = deviceList.filter((d) => d.status === "on").length;
  const offlineDevices = deviceList.filter((d) => d.status === "offline").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navigation />
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            設備管理中心
          </h1>
          <p className="text-gray-600">
            通過MQTT協議遠程控制電源設備
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">總設備數</p>
                  <p className="text-3xl font-bold text-gray-900">{deviceList.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">運行中</p>
                  <p className="text-3xl font-bold text-green-600">{activeDevices}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Power className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">離線設備</p>
                  <p className="text-3xl font-bold text-red-600">{offlineDevices}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deviceList.map((device) => (
            <Card
              key={device.id}
              className="hover:shadow-lg transition-shadow border-l-4"
              style={{
                borderLeftColor:
                  device.status === "on"
                    ? "#10b981"
                    : device.status === "offline"
                    ? "#ef4444"
                    : "#6b7280",
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getDeviceIcon(device.deviceType)}</span>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {device.deviceName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{device.deviceType}</p>
                    </div>
                  </div>
                  {getStatusBadge(device.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {device.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {device.location}
                    </div>
                  )}

                  {device.powerRating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Zap className="w-4 h-4 mr-2" />
                      額定功率: {device.powerRating}W
                    </div>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <Wifi className="w-3 h-3 mr-1" />
                    {device.mqttTopic}
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      className="w-full"
                      variant={device.status === "on" ? "destructive" : "default"}
                      disabled={device.status === "offline" || toggleMutation.isPending}
                      onClick={() => handleToggle(device.deviceId, device.status)}
                    >
                      {toggleMutation.isPending ? (
                        <>
                          <Settings className="w-4 h-4 mr-2 animate-spin" />
                          處理中...
                        </>
                      ) : device.status === "on" ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          關閉設備
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          開啟設備
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {deviceList.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">暫無設備</p>
              <p className="text-sm">請先添加電源設備以開始管理</p>
            </div>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
