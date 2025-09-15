"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CpuMonitor from "@/components/monitors/CpuMonitor";
import MemoryMonitor from "@/components/monitors/MemoryMonitor";
import DiskMonitor from "@/components/monitors/DiskMonitor";
import NetworkMonitor from "@/components/monitors/NetworkMonitor";
import SystemInfo from "@/components/monitors/SystemInfo";
import { RefreshCw, Settings, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  服务器监控仪表板
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  实时系统资源监控
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                刷新
              </Button>

              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {autoRefresh ? "自动刷新" : "手动刷新"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 系统信息概览 */}
          <div key={`system-${refreshKey}`}>
            <SystemInfo />
          </div>

          {/* 监控指标网格 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* CPU 监控 */}
            <div key={`cpu-${refreshKey}`}>
              <CpuMonitor />
            </div>

            {/* 内存监控 */}
            <div key={`memory-${refreshKey}`}>
              <MemoryMonitor />
            </div>
          </div>

          {/* 存储和网络监控 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 磁盘监控 */}
            <div key={`disk-${refreshKey}`}>
              <DiskMonitor />
            </div>

            {/* 网络监控 */}
            <div key={`network-${refreshKey}`}>
              <NetworkMonitor />
            </div>
          </div>

          {/* 页脚信息 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>数据刷新间隔: 5秒</span>
                  <span>•</span>
                  <span>图表历史: 20个数据点</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>实时监控中</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
