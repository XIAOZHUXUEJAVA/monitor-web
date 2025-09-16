"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Activity,
  Monitor,
  Settings,
  Bell,
  RefreshCw,
  Moon,
  Sun,
  Home,
  TrendingUp,
  Server,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isDarkMode?: boolean;
  onDarkModeToggle?: () => void;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  systemStatus?: {
    cpu: number;
    memory: number;
    disk: number;
    network: boolean;
  };
}

const navigation = [
  {
    id: "overview",
    name: "概览",
    icon: Home,
    badge: null,
  },
  {
    id: "hosts",
    name: "主机管理",
    icon: Server,
    badge: null,
    href: "/hosts",
  },
  {
    id: "cpu",
    name: "CPU 监控",
    icon: Cpu,
    badge: null,
  },
  {
    id: "memory",
    name: "内存监控",
    icon: MemoryStick,
    badge: null,
  },
  {
    id: "disk",
    name: "磁盘监控",
    icon: HardDrive,
    badge: null,
  },
  {
    id: "network",
    name: "网络监控",
    icon: Activity,
    badge: null,
  },
  {
    id: "system",
    name: "系统信息",
    icon: Monitor,
    badge: null,
  },
];

const tools = [
  {
    id: "analytics",
    name: "数据分析",
    icon: TrendingUp,
  },
  {
    id: "alerts",
    name: "告警中心",
    icon: Bell,
  },
  {
    id: "settings",
    name: "设置",
    icon: Settings,
  },
];

export function Sidebar({
  className,
  collapsed = false,
  onCollapsedChange,
  isDarkMode = false,
  onDarkModeToggle,
  activeSection = "overview",
  onSectionChange,
  systemStatus,
}: SidebarProps) {
  const isExpanded = !collapsed;

  const getStatusColor = (value: number) => {
    if (value >= 90) return "bg-red-500";
    if (value >= 75) return "bg-yellow-500";
    if (value >= 50) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStatusBadge = (sectionId: string) => {
    if (!systemStatus) return null;
    
    switch (sectionId) {
      case "cpu":
        if (systemStatus.cpu >= 80) return "warning";
        break;
      case "memory":
        if (systemStatus.memory >= 85) return "warning";
        break;
      case "disk":
        if (systemStatus.disk >= 90) return "danger";
        break;
      case "network":
        if (!systemStatus.network) return "danger";
        break;
    }
    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-gray-200/50 dark:border-gray-700/50 p-4",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        {isExpanded && (
          <div className="flex items-center gap-3 transition-all duration-500 ease-out transform">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="transition-all duration-500 ease-out transform">
              <h2 className="font-semibold text-gray-900 dark:text-white">监控中心</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">实时系统监控</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 transition-all duration-300 ease-out hover:scale-105"
        >
          <div className="transition-transform duration-300 ease-out">
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </div>
        </Button>
      </div>

      {/* System Status Overview */}
      {systemStatus && (
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className={cn("transition-all duration-500 ease-out transform", !isExpanded && "opacity-0 scale-95")}>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">系统状态</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">CPU</span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-all duration-300", getStatusColor(systemStatus.cpu))} />
                  <span className="text-xs font-medium">{systemStatus.cpu.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">内存</span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-all duration-300", getStatusColor(systemStatus.memory))} />
                  <span className="text-xs font-medium">{systemStatus.memory.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">磁盘</span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-all duration-300", getStatusColor(systemStatus.disk))} />
                  <span className="text-xs font-medium">{systemStatus.disk.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">网络</span>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full transition-all duration-300", systemStatus.network ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-xs font-medium">{systemStatus.network ? "正常" : "异常"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Collapsed status indicators */}
          {!isExpanded && (
            <div className="flex flex-col items-center gap-1 transition-all duration-500 ease-out transform animate-in slide-in-from-top-2">
              <div className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-110", getStatusColor(systemStatus.cpu))} />
              <div className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-110", getStatusColor(systemStatus.memory))} />
              <div className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-110", getStatusColor(systemStatus.disk))} />
              <div className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-110", systemStatus.network ? "bg-green-500" : "bg-red-500")} />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = activeSection === item.id;
            const statusBadge = getStatusBadge(item.id);
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10 transition-all duration-300 ease-out transform hover:scale-[1.02]",
                  isActive && "bg-blue-500 hover:bg-blue-600 text-white shadow-lg",
                  !isActive && "hover:bg-gray-100 dark:hover:bg-gray-800",
                  !isExpanded && "justify-center px-0"
                )}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href;
                  } else {
                    onSectionChange?.(item.id);
                  }
                }}
              >
                <item.icon className={cn("h-5 w-5 transition-all duration-300", !isExpanded && "h-6 w-6")} />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left transition-all duration-300 ease-out">{item.name}</span>
                    {statusBadge && (
                      <Badge
                        variant={statusBadge === "danger" ? "destructive" : "secondary"}
                        className="text-xs transition-all duration-300 ease-out"
                      >
                        !
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>

        {/* Tools Section */}
        <div className="mt-8">
          <div className="mb-3 transition-all duration-500 ease-out transform">
            {isExpanded && (
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 ease-out">工具</h3>
            )}
          </div>
          <div className="space-y-1">
            {tools.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ease-out transform hover:scale-[1.02]",
                  !isExpanded && "justify-center px-0"
                )}
                onClick={() => onSectionChange?.(item.id)}
              >
                <item.icon className={cn("h-5 w-5 transition-all duration-300", !isExpanded && "h-6 w-6")} />
                {isExpanded && <span className="flex-1 text-left transition-all duration-300 ease-out">{item.name}</span>}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ease-out transform hover:scale-[1.02]",
              !isExpanded && "justify-center px-0"
            )}
            onClick={onDarkModeToggle}
          >
            {isDarkMode ? (
              <Sun className={cn("h-5 w-5 text-yellow-500 transition-all duration-300", !isExpanded && "h-6 w-6")} />
            ) : (
              <Moon className={cn("h-5 w-5 text-gray-600 transition-all duration-300", !isExpanded && "h-6 w-6")} />
            )}
            {isExpanded && (
              <span className="flex-1 text-left transition-all duration-300 ease-out">
                {isDarkMode ? "浅色模式" : "深色模式"}
              </span>
            )}
          </Button>
{/*           
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-10 hover:bg-gray-100 dark:hover:bg-gray-800",
              !isExpanded && "justify-center px-0"
            )}
          >
            <RefreshCw className={cn("h-5 w-5", !isExpanded && "h-6 w-6")} />
            {isExpanded && <span className="flex-1 text-left">刷新数据</span>}
          </Button> */}
        </div>
      </div>
    </div>
  );
}