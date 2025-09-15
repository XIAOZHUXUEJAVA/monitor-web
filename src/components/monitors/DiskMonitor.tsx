"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchDiskData } from "@/lib/api";
import { formatBytes, formatPercent, getStatusColor } from "@/lib/format";
import { DiskData } from "@/types/api";
import { HardDrive, Folder } from "lucide-react";

export default function DiskMonitor() {
  const [diskData, setDiskData] = useState<DiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetchDiskData();
      if (response.success) {
        setDiskData(response.data);
        setError(null);
      } else {
        setError(response.message || "获取磁盘数据失败");
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
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              磁盘监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !diskData) {
    return (
      <Card className="monitor-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              磁盘监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8 font-medium">
            {error || "无法加载磁盘数据"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsagePercent =
    (diskData.total_used / diskData.total_capacity) * 100;
  const totalUsageColor = getStatusColor(totalUsagePercent, {
    warning: 80,
    danger: 95,
  });

  // 柱状图数据
  const chartData = diskData.disks.map((disk) => ({
    device: disk.device,
    used: Math.round(disk.used * 100) / 100,
    free: Math.round(disk.free * 100) / 100,
    usage_percent: Math.round(disk.usage_percent * 10) / 10,
  }));

  const overallUsageStatus = totalUsagePercent >= 95 ? 'danger' : totalUsagePercent >= 80 ? 'warning' : 'good';

  return (
    <Card className="monitor-card w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              磁盘监控
            </span>
          </div>
          <div className={`status-indicator status-${overallUsageStatus} w-3 h-3 rounded-full bg-${overallUsageStatus === 'good' ? 'green' : overallUsageStatus === 'warning' ? 'yellow' : 'red'}-500`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 总体磁盘使用情况 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">总体磁盘使用率</span>
            <Badge variant="outline" className={totalUsageColor}>
              {formatPercent(totalUsagePercent)}
            </Badge>
          </div>
          <Progress value={totalUsagePercent} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              {formatBytes(diskData.total_used * 1024 * 1024 * 1024)} 已使用
            </span>
            <span>
              {formatBytes(diskData.total_capacity * 1024 * 1024 * 1024)} 总计
            </span>
          </div>
        </div>

        {/* 各磁盘详细信息 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">磁盘详情</h4>
          <div className="grid gap-4">
            {diskData.disks.map((disk) => {
              const usageColor = getStatusColor(disk.usage_percent, {
                warning: 80,
                danger: 95,
              });

              return (
                <div
                  key={`${disk.device}-${disk.mount_point}`}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span className="font-medium">{disk.device}</span>
                      <Badge variant="secondary" className="text-xs">
                        {disk.filesystem}
                      </Badge>
                    </div>
                    <Badge variant="outline" className={usageColor}>
                      {formatPercent(disk.usage_percent)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Progress value={disk.usage_percent} className="h-2" />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          总容量
                        </span>
                        <div className="font-medium">
                          {formatBytes(disk.total * 1024 * 1024 * 1024)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          已使用
                        </span>
                        <div className="font-medium text-red-600">
                          {formatBytes(disk.used * 1024 * 1024 * 1024)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          可用
                        </span>
                        <div className="font-medium text-green-600">
                          {formatBytes(disk.free * 1024 * 1024 * 1024)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    挂载点: {disk.mount_point}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 磁盘使用量柱状图 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">磁盘使用量对比</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="device" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "容量 (GB)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const label = name === "used" ? "已使用" : "空闲";
                    return [formatBytes(value * 1024 * 1024 * 1024), label];
                  }}
                  labelFormatter={(label) => `磁盘: ${label}`}
                />
                <Bar
                  dataKey="used"
                  stackId="a"
                  fill="#ef4444"
                  name="used"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="free"
                  stackId="a"
                  fill="#22c55e"
                  name="free"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 磁盘使用率柱状图 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">磁盘使用率对比</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="device" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "使用率 (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "使用率"]}
                  labelFormatter={(label) => `磁盘: ${label}`}
                />
                <Bar
                  dataKey="usage_percent"
                  fill="#8b5cf6"
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
