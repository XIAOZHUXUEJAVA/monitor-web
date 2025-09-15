"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { fetchNetworkData } from "@/lib/api";
import { formatBytes, formatNetworkSpeed } from "@/lib/format";
import { NetworkData } from "@/types/api";
import { Wifi, WifiOff, Activity, Upload, Download } from "lucide-react";

export default function NetworkMonitor() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetchNetworkData();
      if (response.success) {
        setNetworkData(response.data);
        setError(null);
      } else {
        setError(response.message || "获取网络数据失败");
      }
    } catch (err) {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="monitor-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              网络监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !networkData) {
    return (
      <Card className="monitor-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              网络监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8 font-medium">
            {error || "无法加载网络数据"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 历史流量图表数据
  const chartData = networkData.history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    sent: Math.round((item.bytes_sent_per_sec / 1024 / 1024) * 100) / 100, // MB/s
    recv: Math.round((item.bytes_recv_per_sec / 1024 / 1024) * 100) / 100, // MB/s
  }));

  // 网卡流量对比数据
  const interfaceData = networkData.interfaces.map((iface) => ({
    name: iface.name,
    sent: Math.round((iface.bytes_sent / 1024 / 1024) * 100) / 100, // MB
    recv: Math.round((iface.bytes_recv / 1024 / 1024) * 100) / 100, // MB
    is_up: iface.is_up,
  }));

  const activeInterfaces = networkData.interfaces.filter(iface => iface.is_up).length;
  const networkStatus = activeInterfaces > 0 ? 'good' : 'danger';

  return (
    <Card className="monitor-card w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              网络监控
            </span>
          </div>
          <div className={`status-indicator status-${networkStatus} w-3 h-3 rounded-full bg-${networkStatus === 'good' ? 'green' : networkStatus === 'warning' ? 'yellow' : 'red'}-500`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 总体网络统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">总发送</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatBytes(networkData.total_bytes_sent)}
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">总接收</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(networkData.total_bytes_recv)}
            </div>
          </div>
        </div>

        {/* 网络接口详情 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">网络接口</h4>
          <div className="grid gap-4">
            {networkData.interfaces.map((iface) => (
              <div key={iface.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {iface.is_up ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="font-medium">{iface.name}</span>
                    <Badge
                      variant={iface.is_up ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {iface.is_up ? "启用" : "禁用"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {iface.speed} Mbps
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      发送字节
                    </span>
                    <div className="font-medium text-blue-600">
                      {formatBytes(iface.bytes_sent)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      接收字节
                    </span>
                    <div className="font-medium text-green-600">
                      {formatBytes(iface.bytes_recv)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      发送包数
                    </span>
                    <div className="font-medium">
                      {iface.packets_sent.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      接收包数
                    </span>
                    <div className="font-medium">
                      {iface.packets_recv.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 网络流量历史图表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">实时流量趋势</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "流量 (MB/s)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const label = name === "sent" ? "上传" : "下载";
                    return [`${value} MB/s`, label];
                  }}
                  labelFormatter={(label) => `时间: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                  name="sent"
                />
                <Line
                  type="monotone"
                  dataKey="recv"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                  name="recv"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 网卡流量对比 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">网卡流量对比</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={interfaceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "流量 (MB)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const label = name === "sent" ? "发送" : "接收";
                    return [`${value} MB`, label];
                  }}
                  labelFormatter={(label) => `网卡: ${label}`}
                />
                <Bar
                  dataKey="sent"
                  fill="#3b82f6"
                  name="sent"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="recv"
                  fill="#22c55e"
                  name="recv"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
