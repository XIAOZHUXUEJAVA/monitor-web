"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { PageManager } from "@/components/pages/PageManager";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  className?: string;
}

export function DashboardLayout({ className }: DashboardLayoutProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: true,
  });

  // 手动刷新功能
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    // 添加短暂延迟以显示刷新动画
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // 检查系统主题偏好
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('theme');
      const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // 监听窗口大小变化，在小屏幕上自动折叠侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // 模拟系统状态更新（实际项目中应该从API获取）
  useEffect(() => {
    const updateSystemStatus = () => {
      // 这里应该从实际的API获取数据
      setSystemStatus({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() > 0.1, // 90% 概率网络正常
      });
    };

    updateSystemStatus();
    const interval = setInterval(updateSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // 获取页面标题
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      overview: "系统概览",
      cpu: "CPU 监控",
      memory: "内存监控",
      disk: "磁盘监控",
      network: "网络监控",
      system: "系统信息",
      analytics: "数据分析",
      alerts: "告警中心",
      settings: "系统设置",
    };
    return titles[activeSection] || "系统概览";
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          isDarkMode={isDarkMode}
          onDarkModeToggle={toggleDarkMode}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          systemStatus={systemStatus}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                实时监控系统性能和资源使用情况
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 快速操作按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "刷新中..." : "刷新数据"}
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  实时监控中
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={cn(
          "flex-1 overflow-auto p-6",
          className
        )}>
          <PageManager 
            activeSection={activeSection} 
            refreshKey={refreshKey}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}