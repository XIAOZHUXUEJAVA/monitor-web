// 主机管理相关API
import { Host } from '@/types/host';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// 通用API调用函数
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// 获取所有主机
export async function getHosts(): Promise<Host[]> {
  try {
    const result = await apiCall<any>('/api/v1/hosts');
    // 处理不同的返回格式
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.hosts)) {
      return result.hosts;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn('Unexpected hosts response format:', result);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch hosts:', error);
    return []; // 返回空数组作为默认值
  }
}

// 获取主机统计信息
export async function getHostStats(): Promise<any> {
  return apiCall<any>('/api/v1/hosts/stats');
}

// 创建主机
export async function createHost(host: Partial<Host>): Promise<Host> {
  return apiCall<Host>('/api/v1/hosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(host),
  });
}