"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ColoredProgress } from "@/components/ui/colored-progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { MiniSparkline } from "@/components/ui/mini-chart";
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
import { formatBytes, formatPercent, getStatusColor } from "@/lib/format";
import { MemoryStick, HardDrive } from "lucide-react";
import { useMonitoringStore } from "@/store/monitoring-store";

const COLORS = {
  used: "#ef4444",
  free: "#22c55e",
  swap: "#f59e0b",
};

export default function MemoryMonitor() {
  // 使用Zustand store获取内存数据
  const memoryData = useMonitoringStore(state => state.memoryData);
  const loading = useMonitoringStore(state => state.loading.memory);
  const error = useMonitoringStore(state => state.errors.memory);
  const fetchMemory = useMonitoringStore(state => state.fetchMemory);

  // 初始化加载数据
  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  if (loading) {
    return (
      <Card className="monitor-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <MemoryStick className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              内存监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !memoryData) {
    return (
      <Card className="monitor-card w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-lg">
              <MemoryStick className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              内存监控
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8 font-medium">
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

  const usageStatus = memoryData.usage_percent >= 90 ? 'danger' : memoryData.usage_percent >= 75 ? 'warning' : 'good';

  return (
    <Card className="monitor-card w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <MemoryStick className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                内存监控
              </span>
              <div className="flex items-center gap-2 mt-1">
                <AnimatedNumber 
                  value={memoryData.usage_percent} 
                  suffix="%" 
                  className="text-lg font-bold"
                  decimals={1}
                />
                <div className="w-16 h-6">
                  <MiniSparkline 
                    data={memoryData.history.slice(-10).map(h => h.usage_percent)}
                    color={usageStatus === 'good' ? '#22c55e' : usageStatus === 'warning' ? '#f59e0b' : '#ef4444'}
                    height={24}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className={`status-indicator status-${usageStatus} w-3 h-3 rounded-full bg-${usageStatus === 'good' ? 'green' : usageStatus === 'warning' ? 'yellow' : 'red'}-500`}></div>
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
          <ColoredProgress 
            value={memoryData.usage_percent} 
            size="lg"
            showAnimation={true}
          />
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
                  <AnimatedNumber 
                    value={memoryData.total} 
                    suffix=" GB" 
                    decimals={1}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  已使用
                </span>
                <span className="font-medium text-red-600">
                  <AnimatedNumber 
                    value={memoryData.used} 
                    suffix=" GB" 
                    decimals={1}
                  />
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  可用
                </span>
                <span className="font-medium text-green-600">
                  <AnimatedNumber 
                    value={memoryData.available} 
                    suffix=" GB" 
                    decimals={1}
                  />
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
                  <ColoredProgress
                    value={(memoryData.swap_used / memoryData.swap_total) * 100}
                    size="sm"
                    colorScheme="warning"
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
