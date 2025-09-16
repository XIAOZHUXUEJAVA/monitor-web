import { 
  Host, 
  HostConfig, 
  HostGroup, 
  CreateHostRequest, 
  UpdateHostRequest,
  HostListResponse,
  HostStatsResponse,
  CreateHostGroupRequest,
  CreateHostConfigRequest,
  GroupStats
} from '@/types/host';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1';

class HostAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 主机管理API
  async getHosts(params?: {
    page?: number;
    size?: number;
    environment?: string;
    status?: string;
    keyword?: string;
  }): Promise<HostListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());
    if (params?.environment) searchParams.append('environment', params.environment);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<HostListResponse>(`/hosts${query}`);
  }

  async getHost(id: number, include?: string): Promise<Host> {
    const query = include ? `?include=${include}` : '';
    return this.request<Host>(`/hosts/${id}${query}`);
  }

  async createHost(data: CreateHostRequest): Promise<Host> {
    return this.request<Host>('/hosts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHost(id: number, data: UpdateHostRequest): Promise<Host> {
    return this.request<Host>(`/hosts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHost(id: number): Promise<void> {
    await this.request<void>(`/hosts/${id}`, {
      method: 'DELETE',
    });
  }

  async getHostStats(): Promise<HostStatsResponse> {
    return this.request<HostStatsResponse>('/hosts/stats');
  }

  async batchUpdateHostStatus(hostIds: number[], status: string): Promise<void> {
    await this.request<void>('/hosts/batch/status', {
      method: 'PUT',
      body: JSON.stringify({ host_ids: hostIds, status }),
    });
  }

  // 主机配置API
  async getHostConfigs(hostId: number, category?: string): Promise<{ configs: HostConfig[]; total: number }> {
    const query = category ? `?category=${category}` : '';
    return this.request<{ configs: HostConfig[]; total: number }>(`/hosts/${hostId}/configs${query}`);
  }

  async getHostConfig(hostId: number, key: string): Promise<HostConfig> {
    return this.request<HostConfig>(`/hosts/${hostId}/configs/${key}`);
  }

  async updateHostConfigValue(hostId: number, key: string, value: string): Promise<void> {
    await this.request<void>(`/hosts/${hostId}/configs/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  async createHostConfig(data: CreateHostConfigRequest): Promise<HostConfig> {
    return this.request<HostConfig>('/host-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteHostConfig(id: number): Promise<void> {
    await this.request<void>(`/host-configs/${id}`, {
      method: 'DELETE',
    });
  }

  async batchCreateHostConfigs(hostId: number, configs: Omit<CreateHostConfigRequest, 'host_id'>[]): Promise<void> {
    await this.request<void>('/host-configs/batch', {
      method: 'POST',
      body: JSON.stringify({ host_id: hostId, configs }),
    });
  }

  // 主机组API
  async getHostGroups(params?: {
    page?: number;
    size?: number;
    environment?: string;
    enabled?: boolean;
  }): Promise<{ groups: HostGroup[]; total: number; page: number; size: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());
    if (params?.environment) searchParams.append('environment', params.environment);
    if (params?.enabled !== undefined) searchParams.append('enabled', params.enabled.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ groups: HostGroup[]; total: number; page: number; size: number }>(`/host-groups${query}`);
  }

  async getHostGroup(id: number, include?: string): Promise<HostGroup> {
    const query = include ? `?include=${include}` : '';
    return this.request<HostGroup>(`/host-groups/${id}${query}`);
  }

  async createHostGroup(data: CreateHostGroupRequest): Promise<HostGroup> {
    return this.request<HostGroup>('/host-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHostGroup(id: number, data: Partial<CreateHostGroupRequest>): Promise<HostGroup> {
    return this.request<HostGroup>(`/host-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHostGroup(id: number): Promise<void> {
    await this.request<void>(`/host-groups/${id}`, {
      method: 'DELETE',
    });
  }

  async getHostGroupStats(): Promise<{ stats: GroupStats[]; total: number }> {
    return this.request<{ stats: GroupStats[]; total: number }>('/host-groups/stats');
  }

  async getGroupHosts(groupId: number): Promise<Host[]> {
    return this.request<Host[]>(`/host-groups/${groupId}/hosts`);
  }

  async addHostsToGroup(groupId: number, hostIds: number[]): Promise<void> {
    await this.request<void>(`/host-groups/${groupId}/hosts`, {
      method: 'POST',
      body: JSON.stringify({ host_ids: hostIds }),
    });
  }

  async removeHostsFromGroup(groupId: number, hostIds: number[]): Promise<void> {
    await this.request<void>(`/host-groups/${groupId}/hosts`, {
      method: 'DELETE',
      body: JSON.stringify({ host_ids: hostIds }),
    });
  }

  async getHostGroups(hostId: number): Promise<HostGroup[]> {
    return this.request<HostGroup[]>(`/hosts/${hostId}/groups`);
  }
}

export const hostAPI = new HostAPI();