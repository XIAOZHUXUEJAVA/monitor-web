// API客户端相关类型定义
export interface Host {
  id: number;
  hostname: string;
  display_name: string;
  ip_address: string;
  environment: string;
  location?: string;
  tags?: string;
  description?: string;
  status: 'online' | 'offline' | 'maintenance' | 'unknown';
  monitoring_enabled: boolean;
  last_seen?: string;
  os?: string;
  platform?: string;
  cpu_cores?: number;
  total_memory?: number;
  agent: boolean;
  created_at: string;
  updated_at: string;
  configs?: HostConfig[];
  groups?: HostGroup[];
}

export interface HostConfig {
  id: number;
  host_id: number;
  key: string;
  value: string;
  type: 'string' | 'int' | 'float' | 'bool' | 'json';
  category: 'monitoring' | 'alert' | 'system';
  description?: string;
  editable: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostGroup {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  environment?: string;
  tags?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  hosts?: Host[];
}

export interface CreateHostRequest {
  hostname: string;
  display_name: string;
  ip_address: string;
  environment: string;
  location?: string;
  tags?: string;
  description?: string;
  monitoring_enabled?: boolean;
  os?: string;
  platform?: string;
  cpu_cores?: number;
  total_memory?: number;
  agent?: boolean;
}

export interface UpdateHostRequest {
  display_name?: string;
  ip_address?: string;
  environment?: string;
  location?: string;
  tags?: string;
  description?: string;
  status?: string;
  monitoring_enabled?: boolean;
  os?: string;
  platform?: string;
  cpu_cores?: number;
  total_memory?: number;
  agent?: boolean;
}

export interface HostListResponse {
  hosts: Host[];
  total: number;
  page: number;
  size: number;
}

export interface HostStatsResponse {
  status_stats: Record<string, number>;
  environment_stats: Record<string, number>;
  total_hosts: number;
  online_hosts: number;
}

export interface CreateHostGroupRequest {
  name: string;
  display_name: string;
  description?: string;
  environment?: string;
  tags?: string;
  enabled?: boolean;
}

export interface CreateHostConfigRequest {
  host_id: number;
  key: string;
  value: string;
  type: 'string' | 'int' | 'float' | 'bool' | 'json';
  category: 'monitoring' | 'alert' | 'system';
  description?: string;
  editable?: boolean;
}

export interface GroupStats {
  group_id: number;
  group_name: string;
  host_count: number;
  online_count: number;
  environment: string;
}