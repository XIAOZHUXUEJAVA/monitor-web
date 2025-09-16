'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Server,
  Settings,
  Activity,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

// 临时的Host类型定义
interface Host {
  id: number
  hostname: string
  display_name: string
  ip_address: string
  environment: string
  status: string
  os?: string
  platform?: string
  last_seen?: string
}

interface HostListResponse {
  hosts: Host[]
  total: number
  page: number
  size: number
}

// 简单的API调用
const API_BASE_URL = 'http://localhost:9000/api/v1'

const fetchHosts = async (): Promise<HostListResponse> => {
  const response = await fetch(`${API_BASE_URL}/hosts`)
  if (!response.ok) {
    throw new Error('Failed to fetch hosts')
  }
  return response.json()
}

export default function HostManagementPage() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHosts()
      setHosts(data.hosts || [])
    } catch (err) {
      console.error('Failed to load hosts:', err)
      setError('Failed to load hosts: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHosts()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">主机管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理和监控基础设施主机
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadHosts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            添加主机
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">在线主机</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {hosts.filter(h => h.status === 'online').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">离线主机</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {hosts.filter(h => h.status === 'offline').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">总主机数</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{hosts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">配置管理</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">活跃</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Host List */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">主机列表</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              错误: {error}
            </div>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : hosts.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无主机数据</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">请检查后端API连接</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      主机名
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP地址
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      环境
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      系统
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      最后在线
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {hosts.map((host) => (
                    <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {host.display_name || host.hostname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {host.hostname}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                          {host.ip_address}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(host.status)}`}></div>
                          <Badge variant={host.status === 'online' ? 'default' : 'destructive'}>
                            {host.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {host.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {host.os && host.platform ? `${host.os} ${host.platform}` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {host.last_seen ? new Date(host.last_seen).toLocaleString('zh-CN') : '从未在线'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}