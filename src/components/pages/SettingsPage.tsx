"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Monitor,
  Clock,
  BarChart3,
  RefreshCw,
  Save,
  AlertCircle,
  Bell,
  Cpu,
  HardDrive,
  MemoryStick,
} from "lucide-react";
import {
  getAlertRules,
  updateAlertRuleThreshold,
  AlertRule,
} from "@/lib/alert-api";

// 监控配置接口
interface MonitoringConfig {
  id: number;
  key: string;
  value: string;
  type: string;
  category: string;
  description: string;
  editable: boolean;
  created_at: string;
  updated_at: string;
}

export function SettingsPage() {
  const [configs, setConfigs] = useState<MonitoringConfig[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingConfigs, setSavingConfigs] = useState<{
    [key: string]: boolean;
  }>({});
  const [updatingThresholds, setUpdatingThresholds] = useState<{
    [key: string]: boolean;
  }>({});

  // 本地编辑状态
  const [localConfigValues, setLocalConfigValues] = useState<{
    [key: string]: string;
  }>({});
  const [localThresholdValues, setLocalThresholdValues] = useState<{
    [key: string]: string;
  }>({});

  // 防抖定时器引用
  const configTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const thresholdTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // 加载监控配置
  const loadConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const response = await fetch("/api/v1/monitoring-configs");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const configList = await response.json();
      setConfigs(Array.isArray(configList) ? configList : []);
    } catch (error) {
      console.error("Failed to load configs:", error);
      setConfigs([]);
    } finally {
      setLoadingConfigs(false);
    }
  };

  // 加载告警规则
  const loadAlertRules = async () => {
    try {
      setLoadingRules(true);
      const rules = await getAlertRules();
      setAlertRules(rules);
    } catch (error) {
      console.error("Failed to load alert rules:", error);
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    loadConfigs();
    loadAlertRules();
  }, []);

  // 获取配置值（优先使用本地编辑值）
  const getConfigValue = (key: string): string => {
    if (localConfigValues[key] !== undefined) {
      return localConfigValues[key];
    }
    const config = configs.find((c) => c.key === key);
    return config?.value || "";
  };

  // 获取告警阈值（优先使用本地编辑值）
  const getAlertThreshold = (
    metricType: string,
    severity: string
  ): number | undefined => {
    const key = `${metricType}-${severity}`;
    if (localThresholdValues[key] !== undefined) {
      const value = parseFloat(localThresholdValues[key]);
      return isNaN(value) ? undefined : value;
    }
    const rule = alertRules.find(
      (rule) => rule.metric_type === metricType && rule.severity === severity
    );
    return rule?.threshold;
  };

  // 防抖更新配置
  const debouncedUpdateConfig = useCallback((key: string, value: string) => {
    // 清除之前的定时器
    if (configTimeouts.current[key]) {
      clearTimeout(configTimeouts.current[key]);
    }

    // 设置新的定时器，1.5秒后执行更新
    configTimeouts.current[key] = setTimeout(() => {
      updateConfig(key, value);
      delete configTimeouts.current[key];
    }, 1500);
  }, []);

  // 防抖更新告警阈值
  const debouncedUpdateThreshold = useCallback(
    (metricType: string, severity: string, threshold: number) => {
      const key = `${metricType}-${severity}`;

      // 清除之前的定时器
      if (thresholdTimeouts.current[key]) {
        clearTimeout(thresholdTimeouts.current[key]);
      }

      // 设置新的定时器，1.5秒后执行更新
      thresholdTimeouts.current[key] = setTimeout(() => {
        handleUpdateThreshold(metricType, severity, threshold);
        delete thresholdTimeouts.current[key];
      }, 1500);
    },
    []
  );

  // 处理配置输入变化
  const handleConfigChange = (key: string, value: string) => {
    // 立即更新本地状态
    setLocalConfigValues((prev) => ({ ...prev, [key]: value }));

    // 防抖更新服务器
    debouncedUpdateConfig(key, value);
  };

  // 处理阈值输入变化
  const handleThresholdChange = (
    metricType: string,
    severity: string,
    value: string
  ) => {
    const key = `${metricType}-${severity}`;

    // 立即更新本地状态
    setLocalThresholdValues((prev) => ({ ...prev, [key]: value }));

    // 如果值有效，防抖更新服务器
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      debouncedUpdateThreshold(metricType, severity, numValue);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      Object.values(configTimeouts.current).forEach(clearTimeout);
      Object.values(thresholdTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // 更新配置
  const updateConfig = async (key: string, value: string) => {
    try {
      setSavingConfigs((prev) => ({ ...prev, [key]: true }));

      const response = await fetch(`/api/v1/monitoring-configs/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 重新加载配置
      await loadConfigs();
    } catch (error) {
      console.error(`Failed to update config ${key}:`, error);
    } finally {
      setSavingConfigs((prev) => ({ ...prev, [key]: false }));
    }
  };

  // 更新告警阈值
  const handleUpdateThreshold = async (
    metricType: string,
    severity: string,
    threshold: number
  ) => {
    const key = `${metricType}-${severity}`;
    try {
      setUpdatingThresholds((prev) => ({ ...prev, [key]: true }));

      console.log(`更新 ${metricType}-${severity} 规则，阈值: ${threshold}`);
      await updateAlertRuleThreshold(metricType, severity, threshold);

      // 重新加载告警规则
      await loadAlertRules();
    } catch (error) {
      console.error(`Failed to update threshold for ${key}:`, error);
    } finally {
      setUpdatingThresholds((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            系统设置
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            配置本机监控系统的基本参数和告警规则
          </p>
        </div>
      </div>

      {/* 基础监控配置 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            基础监控配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingConfigs ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                加载配置中...
              </span>
            </div>
          ) : (
            <>
              {/* 本机监控说明 */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    本机监控模式
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  当前系统配置为本机监控模式，所有配置将应用于当前主机的监控数据。
                </p>
              </div>

              {/* 数据刷新间隔 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">数据刷新间隔</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="10"
                    max="300"
                    value={getConfigValue("refresh_interval")}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && parseInt(value) >= 10) {
                        handleConfigChange("refresh_interval", value);
                      }
                    }}
                    className="w-24"
                    disabled={savingConfigs["refresh_interval"]}
                    placeholder="10-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    秒
                  </span>
                  {savingConfigs["refresh_interval"] && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  设置自动刷新数据的时间间隔（10-300秒）
                </p>
              </div>

              <Separator />

              {/* 历史数据点数 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">历史数据点数</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={getConfigValue("history_points")}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && parseInt(value) >= 5) {
                        handleConfigChange("history_points", value);
                      }
                    }}
                    className="w-24"
                    disabled={savingConfigs["history_points"]}
                    placeholder="5-100"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    个
                  </span>
                  {savingConfigs["history_points"] && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  图表显示的历史数据点数量（5-100个）
                </p>
              </div>

              <Separator />

              {/* 启用自动刷新 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">启用自动刷新</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={getConfigValue("auto_refresh") === "true"}
                    onCheckedChange={(checked) => {
                      handleConfigChange("auto_refresh", checked.toString());
                    }}
                    disabled={savingConfigs["auto_refresh"]}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {getConfigValue("auto_refresh") === "true"
                      ? "已启用"
                      : "已禁用"}
                  </span>
                  {savingConfigs["auto_refresh"] && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  自动定时刷新监控数据
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 告警规则配置 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            告警规则配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingRules ? (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                加载告警规则中...
              </span>
            </div>
          ) : (
            <>
              {/* CPU 告警配置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">CPU 使用率告警</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        警告:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("cpu", "warning") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "cpu",
                            "warning",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["cpu-warning"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["cpu-warning"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        严重:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("cpu", "critical") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "cpu",
                            "critical",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["cpu-critical"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["cpu-critical"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 内存告警配置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MemoryStick className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">内存使用率告警</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        警告:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("memory", "warning") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "memory",
                            "warning",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["memory-warning"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["memory-warning"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        严重:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("memory", "critical") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "memory",
                            "critical",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["memory-critical"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["memory-critical"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 磁盘告警配置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">磁盘使用率告警</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        警告:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("disk", "warning") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "disk",
                            "warning",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["disk-warning"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["disk-warning"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        严重:
                      </span>
                      <input
                        type="number"
                        value={getAlertThreshold("disk", "critical") || ""}
                        onChange={(e) => {
                          handleThresholdChange(
                            "disk",
                            "critical",
                            e.target.value
                          );
                        }}
                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        disabled={updatingThresholds["disk-critical"]}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        %
                      </span>
                      {updatingThresholds["disk-critical"] && (
                        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                监控模式
              </span>
              <Badge variant="outline">本机监控</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                基础配置项
              </span>
              <Badge variant="secondary">{configs.length} 项</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                告警规则
              </span>
              <Badge variant="secondary">{alertRules.length} 条</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
