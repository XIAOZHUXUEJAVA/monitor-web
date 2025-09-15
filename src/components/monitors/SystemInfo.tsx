"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSystemInfo } from "@/lib/api";
import { formatUptime, formatRelativeTime, formatOS, formatPlatform } from "@/lib/format";
import { SystemInfo as SystemInfoType } from "@/types/api";
import { Monitor, Server, Clock, Activity } from "lucide-react";

export default function SystemInfo() {
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetchSystemInfo();
      if (response.success) {
        setSystemInfo(response.data);
        setError(null);
      } else {
        setError(response.message || "获取系统信息失败");
      }
    } catch (err) {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 每10秒刷新
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !systemInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            {error || "无法加载系统信息"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          系统信息
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 基本系统信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="text-sm font-medium">主机信息</span>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  主机名
                </span>
                <span className="font-medium">{systemInfo.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  操作系统
                </span>
                <span className="font-medium">{formatOS(systemInfo.os, systemInfo.platform)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  平台
                </span>
                <Badge variant="outline">{formatPlatform(systemInfo.platform)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  架构
                </span>
                <Badge variant="secondary">{systemInfo.arch}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">运行时间</span>
            </div>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  运行时长
                </span>
                <span className="font-medium text-green-600">
                  {formatUptime(systemInfo.uptime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  启动时间
                </span>
                <span className="font-medium">
                  {formatRelativeTime(systemInfo.boot_time)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 进程和负载信息 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">系统负载</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  进程数量
                </span>
                <Badge variant="outline" className="font-mono">
                  {systemInfo.processes}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                负载平均值
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-500">1分钟</div>
                  <div className="font-mono font-medium">
                    {systemInfo.load_average[0].toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-500">5分钟</div>
                  <div className="font-mono font-medium">
                    {systemInfo.load_average[1].toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-xs text-gray-500">15分钟</div>
                  <div className="font-mono font-medium">
                    {systemInfo.load_average[2].toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 系统状态指示器 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">系统运行正常</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              最后更新: {new Date().toLocaleTimeString("zh-CN")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
