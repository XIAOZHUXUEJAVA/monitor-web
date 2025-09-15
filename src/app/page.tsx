"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CpuMonitor from "@/components/monitors/CpuMonitor";
import MemoryMonitor from "@/components/monitors/MemoryMonitor";
import DiskMonitor from "@/components/monitors/DiskMonitor";
import NetworkMonitor from "@/components/monitors/NetworkMonitor";
import SystemInfo from "@/components/monitors/SystemInfo";
import { RefreshCw, Settings, BarChart3, Moon, Sun, Activity } from "lucide-react";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    // 添加短暂延迟以显示刷新动画
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    // 检查系统偏好
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 transition-all duration-500">
      {/* 顶部导航栏 */}
      <header className="backdrop-blur-md bg-white/80 dark:bg-gray-800/80 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  服务器监控仪表板
                </h1>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    实时系统资源监控
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-600" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "刷新中..." : "刷新"}
              </Button>

              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2 transition-all duration-200"
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
          <div key={`system-${refreshKey}`} className="animate-fade-in">
            <SystemInfo />
          </div>

          {/* 监控指标网格 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* CPU 监控 */}
            <div key={`cpu-${refreshKey}`} className="animate-fade-in animation-delay-100">
              <CpuMonitor />
            </div>

            {/* 内存监控 */}
            <div key={`memory-${refreshKey}`} className="animate-fade-in animation-delay-200">
              <MemoryMonitor />
            </div>
          </div>

          {/* 存储和网络监控 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* 磁盘监控 */}
            <div key={`disk-${refreshKey}`} className="animate-fade-in animation-delay-300">
              <DiskMonitor />
            </div>

            {/* 网络监控 */}
            <div key={`network-${refreshKey}`} className="animate-fade-in animation-delay-400">
              <NetworkMonitor />
            </div>
          </div>

          {/* 页脚信息 */}
          <Card className="backdrop-blur-sm bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>数据刷新间隔: 5秒</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-500"></div>
                    <span>图表历史: 20个数据点</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">实时监控中</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
