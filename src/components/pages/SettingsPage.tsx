"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/app-store";
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
  
  // 同步store中的设置到本地状态
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // 初始化加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
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
              <select 
                value={localSettings.refreshInterval}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  refreshInterval: parseInt(e.target.value)
                })}
                className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-600 min-w-[100px]"
              >
                <option value={10}>10秒</option>
                <option value={30}>30秒</option>
                <option value={60}>1分钟</option>
                <option value={120}>2分钟</option>
                <option value={300}>5分钟</option>
                <option value={5}>5秒</option>
                <option value={3}>3秒</option>
                <option value={1}>1秒</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">历史数据点数</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">图表显示的历史数据点数量</p>
              </div>
              <select 
                value={localSettings.historyPoints}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  historyPoints: parseInt(e.target.value)
                })}
                className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-600 min-w-[100px]"
              >
                <option value={10}>10个</option>
                <option value={20}>20个</option>
                <option value={50}>50个</option>
                <option value={100}>100个</option>
              </select>
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">CPU使用率阈值</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">触发CPU告警的使用率阈值</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  defaultValue="80" 
                  className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                />
                <span className="text-sm">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">内存使用率阈值</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">触发内存告警的使用率阈值</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  defaultValue="85" 
                  className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                />
                <span className="text-sm">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">磁盘空间阈值</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">触发磁盘空间告警的剩余空间阈值</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  defaultValue="10" 
                  className="w-16 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600" 
                />
                <span className="text-sm">%</span>
              </div>
            </div>
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
              <select className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                <option value="system">跟随系统</option>
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">侧边栏默认状态</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">侧边栏的默认展开状态</p>
              </div>
              <select className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-600">
                <option value="expanded">展开</option>
                <option value="collapsed">折叠</option>
              </select>
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