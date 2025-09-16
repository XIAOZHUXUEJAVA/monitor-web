'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Settings, 
  Users, 
  Server,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { hostAPI } from '@/lib/host-api'
import { Host, HostListResponse } from '@/types/host'

interface HostListProps {
  onHostSelect?: (host: Host) => void
  onHostEdit?: (host: Host) => void
  onHostConfig?: (host: Host) => void
}

export default function HostList({ onHostSelect, onHostEdit, onHostConfig }: HostListProps) {
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(20)
  const [selectedHosts, setSelectedHosts] = useState<Set<string>>(new Set())

  // Use the singleton instance

  const fetchHosts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        size: pageSize,
        ...(searchKeyword && { keyword: searchKeyword }),
        ...(selectedEnvironment && { environment: selectedEnvironment }),
        ...(selectedStatus && { status: selectedStatus })
      }
      
      const response: HostListResponse = await hostAPI.getHosts(params)
      setHosts(response.hosts)
      setTotalCount(response.total)
    } catch (error) {
      console.error('Failed to fetch hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHosts()
  }, [currentPage, searchKeyword, selectedEnvironment, selectedStatus])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchHosts()
  }

  const handleSelectHost = (hostId: string) => {
    const newSelected = new Set(selectedHosts)
    if (newSelected.has(hostId)) {
      newSelected.delete(hostId)
    } else {
      newSelected.add(hostId)
    }
    setSelectedHosts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedHosts.size === hosts.length) {
      setSelectedHosts(new Set())
    } else {
      setSelectedHosts(new Set(hosts.map(h => h.id.toString())))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'online': return 'default'
      case 'offline': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Host Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor your infrastructure hosts
          </p>
        </div>
        <Button onClick={() => onHostEdit?.({} as Host)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Host
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Online Hosts</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {hosts.filter(h => h.status === 'online').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Offline Hosts</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {hosts.filter(h => h.status === 'offline').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Warning</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {hosts.filter(h => h.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Hosts</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search hosts by name, IP, or tags..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex gap-3">
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
            </select>

            <Button variant="outline" onClick={fetchHosts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedHosts.size > 0 && (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {selectedHosts.size} host(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Bulk Config
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Host Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={hosts.length > 0 && selectedHosts.size === hosts.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  OS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
                        <div>
                          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                  </tr>
                ))
              ) : hosts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Server className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No hosts found</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Try adjusting your search criteria or add a new host
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                hosts.map((host) => (
                  <tr 
                    key={host.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => onHostSelect?.(host)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedHosts.has(host.id.toString())}
                        onChange={() => handleSelectHost(host.id.toString())}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Server className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {host.hostname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {host.ip_address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(host.status)}`}></div>
                        <Badge variant={getStatusBadgeVariant(host.status)}>
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
                        {host.os} {host.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {host.last_seen ? new Date(host.last_seen).toLocaleString() : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHostSelect?.(host)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHostEdit?.(host)}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onHostConfig?.(host)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="bg-white dark:bg-gray-900 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * pageSize >= totalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}