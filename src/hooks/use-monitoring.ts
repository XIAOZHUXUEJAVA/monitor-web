import { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { useMonitoringStore } from '@/store/monitoring-store';
import type { SystemStatus } from '@/store/app-store';

/**
 * 自定义Hook：统一管理监控数据获取和系统状态同步
 */
export function useMonitoringData() {
  const updateSystemStatus = useAppStore(state => state.updateSystemStatus);
  const triggerRefresh = useAppStore(state => state.triggerRefresh);
  const refreshKey = useAppStore(state => state.refreshKey);
  
  const {
    cpuData,
    memoryData,
    diskData,
    networkData,
    loading,
    errors,
    fetchAllData,
  } = useMonitoringStore();

  // 计算系统状态
  const calculateSystemStatus = (): SystemStatus => {
    const cpuUsage = cpuData?.usage || 0;
    const memoryUsage = memoryData?.usage_percent || 0;
    
    // 计算磁盘平均使用率
    let diskUsage = 0;
    if (diskData?.disks && diskData.disks.length > 0) {
      const totalUsage = diskData.disks.reduce((sum, disk) => sum + disk.usage_percent, 0);
      diskUsage = totalUsage / diskData.disks.length;
    }
    
    // 检查网络状态
    const networkStatus = networkData?.interfaces?.some(iface => iface.is_up) || false;
    
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: diskUsage,
      network: networkStatus,
    };
  };

  // 初始化数据获取
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // 响应刷新请求
  useEffect(() => {
    if (refreshKey > 0) {
      fetchAllData();
    }
  }, [refreshKey, fetchAllData]);

  // 定时更新数据
  const settings = useAppStore(state => state.settings);
  useEffect(() => {
    if (!settings.autoRefresh) {
      return; // 如果禁用自动刷新，不设置定时器
    }
    
    const interval = setInterval(() => {
      fetchAllData();
    }, settings.refreshInterval * 1000); // 转换为毫秒

    return () => clearInterval(interval);
  }, [fetchAllData, settings.refreshInterval, settings.autoRefresh]);
  
  // 同步系统状态到应用状态
  useEffect(() => {
    if (cpuData && memoryData && diskData && networkData) {
      const systemStatus = calculateSystemStatus();
      updateSystemStatus(systemStatus);
    }
  }, [cpuData, memoryData, diskData, networkData, updateSystemStatus]);

  return {
    // 监控数据
    cpuData,
    memoryData,
    diskData,
    networkData,
    
    // 加载状态
    loading,
    errors,
    
    // 操作
    refresh: triggerRefresh,
    fetchAllData,
    
    // 计算的系统状态
    systemStatus: calculateSystemStatus(),
  };
}

/**
 * 自定义Hook：管理应用UI状态
 */
export function useAppState() {
  const {
    sidebarCollapsed,
    isDarkMode,
    activeSection,
    isRefreshing,
    settings,
    setSidebarCollapsed,
    setActiveSection,
    toggleDarkMode,
    loadSettings,
  } = useAppStore();

  // 初始化主题和设置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 加载保存的设置，会自动应用主题和侧边栏设置
      loadSettings();
    }
  }, [loadSettings]);

  // 响应式侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  return {
    sidebarCollapsed,
    isDarkMode,
    activeSection,
    isRefreshing,
    settings,
    setSidebarCollapsed,
    setActiveSection,
    toggleDarkMode,
  };
}