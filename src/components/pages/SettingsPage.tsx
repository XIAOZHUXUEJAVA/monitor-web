"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { getAlertRules, updateAlertRuleThreshold, createHostAlertRule, AlertRule, getAlertRuleByTypeAndSeverity, formatDuration } from "@/lib/alert-api";
import { getHosts } from "@/lib/host-api";
import { Host } from "@/types/host";
import { 
  Settings, 
  Monitor, 
  Bell, 
  Palette, 
  Database,
  Shield,
  Wifi,
  User,
  Save,
  RefreshCw,
  CheckCircle
} from "lucide-react";

export function SettingsPage() {
  // 使用Zustand store管理设置
  const { settings, updateSettings, loadSettings } = useAppStore();
  
  // 本地状态管理修改
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 告警规则状态
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [updatingThresholds, setUpdatingThresholds] = useState<Record<string, boolean>>({});
  
  // 主机相关状态
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<number | null>(null);
  const [loadingHosts, setLoadingHosts] = useState(true);
  
  // 同步store中的设置到本地状态
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // 加载主机列表
  const loadHosts = async () => {
    try {
      setLoadingHosts(true);
      const hostList = await getHosts();
      // 确保返回的是数组
      setHosts(Array.isArray(hostList) ? hostList : []);
    } catch (error) {
      console.error('Failed to load hosts:', error);
      // 设置空数组作为默认值
      setHosts([]);
    } finally {
      setLoadingHosts(false);
    }
  };

  // 加载告警规则
  const loadAlertRules = async () => {
    try {
      setLoadingRules(true);
      // 根据选中的主机加载规则
      const rules = await getAlertRules(selectedHostId || undefined);
      setAlertRules(rules);
    } catch (error) {
      console.error('Failed to load alert rules:', error);
    } finally {
      setLoadingRules(false);
    }
  };
  
  // 初始化加载设置、主机和告警规则
  useEffect(() => {
    loadSettings();
    loadHosts();
  }, [loadSettings]);
  
  // 当主机选择变化时重新加载告警规则
  useEffect(() => {
    loadAlertRules();
  }, [selectedHostId]);
  
  // 保存设置
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // 更新store中的设置
      updateSettings(localSettings);
      
      // 显示成功提示
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 重置为默认设置
  const handleReset = () => {
    const defaultSettings = {
      refreshInterval: 60,  // 默认60秒（1分钟）
      historyPoints: 20,
      autoRefresh: true,
    };
    setLocalSettings(defaultSettings);
  };
  
  // 获取特定主机和指标类型的有效阈值（优先使用主机特定规则，否则使用全局规则）
  const getEffectiveThreshold = (metricType: string, severity: string): number | undefined => {
    if (selectedHostId) {
      // 先查找主机特定规则
      const hostSpecificRule = alertRules.find(rule => 
        rule.host_id === selectedHostId && 
        rule.metric_type === metricType && 
        rule.severity === severity
      );
      if (hostSpecificRule) {
        return hostSpecificRule.threshold;
      }
    }
    
    // 查找全局规则
    const globalRule = alertRules.find(rule => 
      !rule.host_id && 
      rule.metric_type === metricType && 
      rule.severity === severity
    );
    return globalRule?.threshold;
  };

  // 检查是否存在主机特定规则
  const hasHostSpecificRule = (metricType: string, severity: string): boolean => {
    if (!selectedHostId) return false;
    return alertRules.some(rule => 
      rule.host_id === selectedHostId && 
      rule.metric_type === metricType && 
      rule.severity === severity
    );
  };
  // 更新告警阈值
  const updateThreshold = async (metricType: string, severity: string, threshold: number) => {
    const key = `${metricType}-${severity}`;
    try {
      setUpdatingThresholds(prev => ({ ...prev, [key]: true }));
      
      if (selectedHostId) {
        // 为特定主机创建或更新规则
        const isExisting = hasHostSpecificRule(metricType, severity);
        console.log(`${isExisting ? '更新' : '创建'}主机 ${selectedHostId} 的 ${metricType}-${severity} 规则，阈值: ${threshold}`);
        await createHostAlertRule(selectedHostId, metricType, severity, threshold);
      } else {
        // 修改全局规则
        console.log(`修改全局 ${metricType}-${severity} 规则，阈值: ${threshold}`);
        await updateAlertRuleThreshold(metricType, severity, threshold);
      }
      
      // 重新加载告警规则
      await loadAlertRules();
      
      // 显示成功提示
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update threshold:', error);
    } finally {
      setUpdatingThresholds(prev => ({ ...prev, [key]: false }));
    }
  };
  
  // 检查是否有未保存的修改
  const hasUnsavedChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h2>
          <p className="text-gray-600 dark:text-gray-400">配置监控系统参数和个性化设置</p>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">设置已保存</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置默认
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={hasUnsavedChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 设置分类 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 监控设置 */}
        <Card className="monitor-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              监控设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">数据刷新间隔</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">设置自动刷新数据的时间间隔</p>
              </div>
              <Select
                value={localSettings.refreshInterval.toString()}
                onValueChange={(value: string) => setLocalSettings({
                  ...localSettings,
                  refreshInterval: parseInt(value)
                })}
              >
                <SelectTrigger className="min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10秒</SelectItem>
                  <SelectItem value="30">30秒</SelectItem>
                  <SelectItem value="60">1分钟</SelectItem>
                  <SelectItem value="120">2分钟</SelectItem>
                  <SelectItem value="300">5分钟</SelectItem>
                  <SelectItem value="5">5秒</SelectItem>
                  <SelectItem value="3">3秒</SelectItem>
                  <SelectItem value="1">1秒</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">历史数据点数</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">图表显示的历史数据点数量</p>
              </div>
              <Select
                value={localSettings.historyPoints.toString()}
                onValueChange={(value: string) => setLocalSettings({
                  ...localSettings,
                  historyPoints: parseInt(value)
                })}
              >
                <SelectTrigger className="min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10个</SelectItem>
                  <SelectItem value="20">20个</SelectItem>
                  <SelectItem value="50">50个</SelectItem>
                  <SelectItem value="100">100个</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">启用自动刷新</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">自动定时刷新监控数据</p>
              </div>
              <button
                onClick={() => setLocalSettings({
                  ...localSettings,
                  autoRefresh: !localSettings.autoRefresh
                })}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  localSettings.autoRefresh
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {localSettings.autoRefresh ? '已启用' : '已禁用'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 告警设置 */}
        <Card className="monitor-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              告警设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 主机选择器 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium">选择主机</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedHostId 
                    ? `为主机 ${hosts.find(h => h.id === selectedHostId)?.display_name || selectedHostId} 创建特定告警规则` 
                    : '修改全局告警规则（适用于所有主机）'
                  }
                </p>
              </div>
              <div className="min-w-[200px]">
                {loadingHosts ? (
                  <span className="text-sm text-gray-500">加载中...</span>
                ) : (
                  <Select
                    value={selectedHostId?.toString() || 'global'}
                    onValueChange={(value: string) => setSelectedHostId(value === 'global' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="全局规则" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">全局规则</SelectItem>
                      {Array.isArray(hosts) && hosts.map((host) => (
                        <SelectItem key={host.id} value={host.id.toString()}>
                          {host.display_name} ({host.hostname})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            {loadingRules ? (
              <div className="text-center py-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">加载告警规则中...</span>
              </div>
            ) : (
              <>
                {/* CPU告警阈值 */}
                {(() => {
                  const cpuWarningRule = getAlertRuleByTypeAndSeverity(alertRules, 'cpu', 'warning');
                  const cpuCriticalRule = getAlertRuleByTypeAndSeverity(alertRules, 'cpu', 'critical');
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">CPU使用率告警阈值</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedHostId 
                              ? `为主机 ${hosts.find(h => h.id === selectedHostId)?.display_name || selectedHostId} 设置CPU告警阈值` 
                              : '全局CPU告警阈值设置'
                            }
                            {cpuWarningRule && ` (持续${formatDuration(cpuWarningRule.duration)}触发警告)`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {cpuWarningRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">警告:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('cpu', 'warning') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('cpu', 'warning', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['cpu-warning']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('cpu', 'warning') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                          {cpuCriticalRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500">严重:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('cpu', 'critical') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('cpu', 'critical', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['cpu-critical']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('cpu', 'critical') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 内存告警阈值 */}
                {(() => {
                  const memoryWarningRule = getAlertRuleByTypeAndSeverity(alertRules, 'memory', 'warning');
                  const memoryCriticalRule = getAlertRuleByTypeAndSeverity(alertRules, 'memory', 'critical');
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">内存使用率告警阈值</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedHostId 
                              ? `为主机 ${hosts.find(h => h.id === selectedHostId)?.display_name || selectedHostId} 设置内存告警阈值` 
                              : '全局内存告警阈值设置'
                            }
                            {memoryWarningRule && ` (持续${formatDuration(memoryWarningRule.duration)}触发警告)`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {memoryWarningRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">警告:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('memory', 'warning') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('memory', 'warning', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['memory-warning']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('memory', 'warning') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                          {memoryCriticalRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500">严重:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('memory', 'critical') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('memory', 'critical', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['memory-critical']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('memory', 'critical') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 磁盘告警阈值 */}
                {(() => {
                  const diskWarningRule = getAlertRuleByTypeAndSeverity(alertRules, 'disk', 'warning');
                  const diskCriticalRule = getAlertRuleByTypeAndSeverity(alertRules, 'disk', 'critical');
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">磁盘使用率告警阈值</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedHostId 
                              ? `为主机 ${hosts.find(h => h.id === selectedHostId)?.display_name || selectedHostId} 设置磁盘告警阈值` 
                              : '全局磁盘告警阈值设置'
                            }
                            {diskWarningRule && ` (持续${formatDuration(diskWarningRule.duration)}触发警告)`}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {diskWarningRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">警告:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('disk', 'warning') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('disk', 'warning', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['disk-warning']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('disk', 'warning') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                          {diskCriticalRule && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500">严重:</span>
                              <input 
                                type="number" 
                                value={getEffectiveThreshold('disk', 'critical') || ''}
                                onChange={(e) => {
                                  const newThreshold = parseFloat(e.target.value);
                                  if (!isNaN(newThreshold)) {
                                    updateThreshold('disk', 'critical', newThreshold);
                                  }
                                }}
                                disabled={updatingThresholds['disk-critical']}
                                className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                              />
                              <span className="text-sm">%</span>
                              {selectedHostId && hasHostSpecificRule('disk', 'critical') && (
                                <span className="text-xs text-blue-500">特定</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </CardContent>
        </Card>

        {/* 界面设置 */}
        <Card className="monitor-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              界面设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">主题模式</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">选择界面主题风格</p>
              </div>
              <Select defaultValue="system">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">跟随系统</SelectItem>
                  <SelectItem value="light">浅色模式</SelectItem>
                  <SelectItem value="dark">深色模式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">侧边栏默认状态</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">侧边栏的默认展开状态</p>
              </div>
              <Select defaultValue="expanded">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">展开</SelectItem>
                  <SelectItem value="collapsed">折叠</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">启用动画效果</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">界面切换和数据更新的动画效果</p>
              </div>
              <Badge variant="outline">启用</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 网络设置 */}
        <Card className="monitor-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              网络设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">API服务器地址</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">后端API服务器的地址</p>
              </div>
              <input 
                type="text" 
                defaultValue="http://localhost:9000" 
                className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-600" 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">请求超时时间</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">API请求的超时时间（秒）</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  defaultValue="10" 
                  className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                />
                <span className="text-sm">秒</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">启用HTTPS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">使用HTTPS协议连接API服务器</p>
              </div>
              <Badge variant="secondary">禁用</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统信息 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            系统信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">应用版本</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">监控系统 v1.0.0</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">构建日期</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">2024-01-15 10:30:00</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">技术栈</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next.js + Go + Gin</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">数据源</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">gopsutil 系统库</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">许可证</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">MIT License</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">作者</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">监控团队</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}