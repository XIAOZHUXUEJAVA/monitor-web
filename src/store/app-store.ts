import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 系统状态接口
export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: boolean;
}

// 应用状态接口
interface AppState {
  // UI状态
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  activeSection: string;
  refreshKey: number;
  isRefreshing: boolean;
  
  // 系统监控数据
  systemStatus: SystemStatus;
  lastUpdated: string;
  
  // 设置配置
  settings: {
    refreshInterval: number; // 数据刷新间隔（秒）
    historyPoints: number;   // 历史数据点数
    autoRefresh: boolean;    // 是否启用自动刷新
  };
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDarkMode: (isDark: boolean) => void;
  setActiveSection: (section: string) => void;
  triggerRefresh: () => void;
  updateSystemStatus: (status: SystemStatus) => void;
  toggleDarkMode: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  loadSettings: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      sidebarCollapsed: false,
      isDarkMode: false,
      activeSection: 'overview',
      refreshKey: 0,
      isRefreshing: false,
      
      systemStatus: {
        cpu: 0,
        memory: 0,
        disk: 0,
        network: true,
      },
      lastUpdated: new Date().toISOString(),
      
      // 默认设置
      settings: {
        refreshInterval: 5,     // 默认5秒刷新
        historyPoints: 20,      // 默认20个历史数据点
        autoRefresh: true,      // 默认启用自动刷新
      },
      
      // Actions
      setSidebarCollapsed: (collapsed) => 
        set({ sidebarCollapsed: collapsed }, false, 'setSidebarCollapsed'),
      
      setDarkMode: (isDark) => {
        // 更新DOM类
        if (typeof window !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
        set({ isDarkMode: isDark }, false, 'setDarkMode');
      },
      
      setActiveSection: (section) => 
        set({ activeSection: section }, false, 'setActiveSection'),
      
      triggerRefresh: () => {
        set({ isRefreshing: true }, false, 'triggerRefresh/start');
        set(
          (state) => ({ 
            refreshKey: state.refreshKey + 1 
          }), 
          false, 
          'triggerRefresh/increment'
        );
        // 模拟刷新延迟
        setTimeout(() => {
          set({ isRefreshing: false }, false, 'triggerRefresh/end');
        }, 1000);
      },
      
      updateSystemStatus: (status) => 
        set({ 
          systemStatus: status,
          lastUpdated: new Date().toISOString()
        }, false, 'updateSystemStatus'),
      
      toggleDarkMode: () => {
        const currentMode = get().isDarkMode;
        get().setDarkMode(!currentMode);
      },
      
      updateSettings: (newSettings) => {
        const currentSettings = get().settings;
        const updatedSettings = { ...currentSettings, ...newSettings };
        
        // 保存到localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('monitoring-settings', JSON.stringify(updatedSettings));
        }
        
        set({ settings: updatedSettings }, false, 'updateSettings');
      },
      
      loadSettings: () => {
        if (typeof window !== 'undefined') {
          const savedSettings = localStorage.getItem('monitoring-settings');
          if (savedSettings) {
            try {
              const settings = JSON.parse(savedSettings);
              set({ settings }, false, 'loadSettings');
            } catch (error) {
              console.error('Failed to load settings:', error);
            }
          }
        }
      },
    }),
    {
      name: 'monitoring-app-store',
    }
  )
);