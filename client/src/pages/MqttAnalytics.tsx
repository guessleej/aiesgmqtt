import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageSquare, TrendingUp, Wifi, Clock, BarChart3, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";

interface MqttMessage {
  id: number;
  topic: string;
  payload: string;
  timestamp: Date;
  deviceId: string;
}

interface MqttStats {
  totalMessages: number;
  messagesPerMinute: number;
  activeTopics: number;
  averageLatency: number;
  topDevices: Array<{
    deviceId: string;
    messageCount: number;
  }>;
  messagesByHour: Array<{
    hour: number;
    count: number;
  }>;
}

export default function MqttAnalytics() {
  const [recentMessages, setRecentMessages] = useState<MqttMessage[]>([]);
  const [stats, setStats] = useState<MqttStats>({
    totalMessages: 15234,
    messagesPerMinute: 42,
    activeTopics: 6,
    averageLatency: 23,
    topDevices: [
      { deviceId: "device_003", messageCount: 4521 },
      { deviceId: "device_006", messageCount: 3892 },
      { deviceId: "device_004", messageCount: 2341 },
      { deviceId: "device_002", messageCount: 1876 },
      { deviceId: "device_001", messageCount: 1654 },
    ],
    messagesByHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: Math.floor(Math.random() * 500) + 200,
    })),
  });

  // Simulate real-time messages
  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage: MqttMessage = {
        id: Date.now(),
        topic: `carbon/device/${["light", "ac", "equipment"][Math.floor(Math.random() * 3)]}/${String(Math.floor(Math.random() * 6) + 1).padStart(3, "0")}`,
        payload: JSON.stringify({
          command: Math.random() > 0.5 ? "on" : "off",
          timestamp: new Date().toISOString(),
        }),
        timestamp: new Date(),
        deviceId: `device_${String(Math.floor(Math.random() * 6) + 1).padStart(3, "0")}`,
      };

      setRecentMessages((prev) => [newMessage, ...prev.slice(0, 19)]);
      
      setStats((prev) => ({
        ...prev,
        totalMessages: prev.totalMessages + 1,
        messagesPerMinute: Math.floor(Math.random() * 20) + 35,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxMessageCount = Math.max(...stats.messagesByHour.map((m) => m.count));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              MQTT 數據分析
            </h1>
            <p className="text-gray-600">
              實時監控MQTT消息流量與設備通訊狀態
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">總消息數</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalMessages.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">消息/分鐘</p>
                    <p className="text-3xl font-bold text-green-600">
                      {stats.messagesPerMinute}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">活躍主題</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.activeTopics}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">平均延遲</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {stats.averageLatency}
                      <span className="text-lg text-gray-600 ml-1">ms</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Message Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  24小時消息流量
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.messagesByHour.map((item) => (
                    <div key={item.hour} className="flex items-center space-x-3">
                      <span className="text-xs text-gray-600 w-12">
                        {String(item.hour).padStart(2, "0")}:00
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${(item.count / maxMessageCount) * 100}%`,
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Devices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  設備消息排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topDevices.map((device, index) => (
                    <div key={device.deviceId} className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-600"
                            : "bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{device.deviceId}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full"
                              style={{
                                width: `${(device.messageCount / stats.topDevices[0].messageCount) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {device.messageCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  實時消息監控
                </div>
                <Badge className="bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  即時更新
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        時間
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        設備ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        主題
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        內容
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMessages.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">
                          等待消息...
                        </td>
                      </tr>
                    ) : (
                      recentMessages.map((message) => (
                        <tr
                          key={message.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(message.timestamp).toLocaleTimeString("zh-TW")}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{message.deviceId}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 font-mono">
                            {message.topic}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {message.payload}
                            </code>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
