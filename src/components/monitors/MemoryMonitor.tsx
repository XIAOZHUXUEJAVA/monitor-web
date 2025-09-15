"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { fetchMemoryData } from "@/lib/api";
import { formatBytes, formatPercent, getStatusColor } from "@/lib/format";
import { MemoryData } from "@/types/api";
import { MemoryStick, HardDrive } from "lucide-react";

const COLORS = {
  used: "#ef4444",
  free: "#22c55e",
  swap: "#f59e0b",
};

export default function MemoryMonitor() {
  const [memoryData, setMemoryData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetchMemoryData();
      if (response.success) {
        setMemoryData(response.data);
        setError(null);
      } else {
        setError(response.message || "获取内存数据失败");
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            内存监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !memoryData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5" />
            内存监控
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            {error || "无法加载内存数据"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const usageColor = getStatusColor(memoryData.usage_percent, {
    warning: 75,
    danger: 90,
  });

  // 饼图数据
  const pieData = [
    { name: "已使用", value: memoryData.used, color: COLORS.used },
    { name: "空闲", value: memoryData.free, color: COLORS.free },
  ];

  // 历史数据图表
  const chartData = memoryData.history.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    usage_percent: Math.round(item.usage_percent * 10) / 10,
    used: Math.round(item.used * 100) / 100,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          内存监控
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 内存使用率概览 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">内存使用率</span>
            <Badge variant="outline" className={usageColor}>
              {formatPercent(memoryData.usage_percent)}
            </Badge>
          </div>
          <Progress value={memoryData.usage_percent} className="h-3" />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              {formatBytes(memoryData.used * 1024 * 1024 * 1024)} 已使用
            </span>
            <span>
              {formatBytes(memoryData.total * 1024 * 1024 * 1024)} 总计
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 内存分布饼图 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">内存分布</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      formatBytes(value * 1024 * 1024 * 1024)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 内存详细信息 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">详细信息</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  总内存
                </span>
                <span className="font-medium">
                  {formatBytes(memoryData.total * 1024 * 1024 * 1024)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  已使用
                </span>
                <span className="font-medium text-red-600">
                  {formatBytes(memoryData.used * 1024 * 1024 * 1024)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  可用
                </span>
                <span className="font-medium text-green-600">
                  {formatBytes(memoryData.available * 1024 * 1024 * 1024)}
                </span>
              </div>

              {/* 交换分区信息 */}
              <div className="border-t pt-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">交换分区</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      总计
                    </span>
                    <span>
                      {formatBytes(memoryData.swap_total * 1024 * 1024 * 1024)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      已使用
                    </span>
                    <span>
                      {formatBytes(memoryData.swap_used * 1024 * 1024 * 1024)}
                    </span>
                  </div>
                  <Progress
                    value={(memoryData.swap_used / memoryData.swap_total) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内存使用历史图表 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">使用率趋势</h4>
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
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "使用率 (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "usage_percent") {
                      return [`${value}%`, "内存使用率"];
                    }
                    return [
                      formatBytes(value * 1024 * 1024 * 1024),
                      "已使用内存",
                    ];
                  }}
                  labelFormatter={(label) => `时间: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="usage_percent"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: "#22c55e", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
