'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Plus, 
  Settings, 
  MoreHorizontal, 
  Search,
  Edit,
  Trash2,
  Copy,
  Move,
  Server,
  FolderPlus,
  UserPlus,
  MousePointer,
  ArrowRight,
  Tag,
  Filter,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { hostAPI } from '@/lib/host-api'
import { Host, HostGroup, CreateHostGroupRequest } from '@/types/host'

interface HostGroupManagerProps {
  onClose?: () => void
}

interface DragItem {
  type: 'host' | 'group'
  id: string
  data: Host | HostGroup
}

export default function HostGroupManager({ onClose }: HostGroupManagerProps) {
  const [groups, setGroups] = useState<HostGroup[]>([])
  const [hosts, setHosts] = useState<Host[]>([])
  const [ungroupedHosts, setUngroupedHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<HostGroup | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroupForm, setShowNewGroupForm] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState('')

  // Use the singleton instance
  const dragCounterRef = useRef(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, hostsResponse] = await Promise.all([
        hostAPI.getHostGroups(),
        hostAPI.getHosts({ size: 1000 }) // Get all hosts
      ])
      
      setGroups(groupsResponse.groups)
      setHosts(hostsResponse.hosts)
      
      // Calculate ungrouped hosts
      const groupedHostIds = new Set<number>()
      groupsResponse.groups.forEach((group: HostGroup) => {
        group.hosts?.forEach((host: Host) => groupedHostIds.add(host.id))
      })
      setUngroupedHosts(hostsResponse.hosts.filter((host: Host) => !groupedHostIds.has(host.id)))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async () => {
    if (!newGroupName.trim()) return

    try {
      const request: CreateHostGroupRequest = {
        name: newGroupName.trim(),
        display_name: newGroupName.trim(),
        description: `Host group: ${newGroupName.trim()}`
      }
      
      const newGroup = await hostAPI.createHostGroup(request)
      setGroups([...groups, newGroup])
      setNewGroupName('')
      setShowNewGroupForm(false)
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const updateGroup = async (groupId: string, name: string) => {
    try {
      const updatedGroup = await hostAPI.updateHostGroup(parseInt(groupId), {
        name: name.trim(),
        display_name: name.trim(),
        description: `Host group: ${name.trim()}`
      })
      setGroups(groups.map(g => g.id === parseInt(groupId) ? updatedGroup : g))
      setEditingGroup(null)
      setEditGroupName('')
    } catch (error) {
      console.error('Failed to update group:', error)
    }
  }

  const deleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      await hostAPI.deleteHostGroup(parseInt(groupId))
      setGroups(groups.filter(g => g.id !== parseInt(groupId)))
      if (selectedGroup?.id === parseInt(groupId)) {
        setSelectedGroup(null)
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const addHostsToGroup = async (groupId: string, hostIds: string[]) => {
    try {
      await hostAPI.addHostsToGroup(parseInt(groupId), hostIds.map(id => parseInt(id)))
      await fetchData() // Refresh data
    } catch (error) {
      console.error('Failed to add hosts to group:', error)
    }
  }

  const removeHostsFromGroup = async (groupId: string, hostIds: string[]) => {
    try {
      await hostAPI.removeHostsFromGroup(parseInt(groupId), hostIds.map(id => parseInt(id)))
      await fetchData() // Refresh data
    } catch (error) {
      console.error('Failed to remove hosts from group:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML)
    ;(e.currentTarget as HTMLElement).style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    ;(e.currentTarget as HTMLElement).style.opacity = '1'
    setDraggedItem(null)
    setDragOverGroup(null)
    dragCounterRef.current = 0
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    dragCounterRef.current++
    setDragOverGroup(groupId)
  }

  const handleDragLeave = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setDragOverGroup(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setDragOverGroup(null)

    if (!draggedItem) return

    if (draggedItem.type === 'host') {
      const host = draggedItem.data as Host
      
      // Remove from current group if any
      const currentGroup = groups.find(g => g.hosts?.some(h => h.id === host.id))
      if (currentGroup) {
        await removeHostsFromGroup(currentGroup.id.toString(), [host.id.toString()])
      }
      
      // Add to target group
      await addHostsToGroup(targetGroupId, [host.id.toString()])
    }

    setDraggedItem(null)
  }

  const getGroupHosts = (group: HostGroup) => {
    if (!group.hosts) return []
    return group.hosts
  }

  const filteredGroups = groups.filter(group => 
    !searchTerm || 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUngroupedHosts = ungroupedHosts.filter(host =>
    !searchTerm ||
    host.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.ip_address.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Host Groups</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and manage your hosts in groups
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowNewGroupForm(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Group
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups and hosts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* New Group Form */}
      {showNewGroupForm && (
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createGroup()}
              autoFocus
            />
            <Button onClick={createGroup} disabled={!newGroupName.trim()} size="sm">
              <Check className="w-4 h-4 mr-2" />
              Create
            </Button>
            <Button variant="outline" onClick={() => setShowNewGroupForm(false)} size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {filteredGroups.map((group) => {
          const groupHosts = getGroupHosts(group)
          const isEditing = editingGroup === group.id.toString()
          
          return (
            <Card 
              key={group.id}
              className={`p-6 transition-all duration-200 ${
                dragOverGroup === group.id.toString() 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'hover:shadow-lg'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, group.id.toString())}
              onDragLeave={(e) => handleDragLeave(e, group.id.toString())}
              onDrop={(e) => handleDrop(e, group.id.toString())}
            >
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-1">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') updateGroup(group.id.toString(), editGroupName)
                        if (e.key === 'Escape') {
                          setEditingGroup(null)
                          setEditGroupName('')
                        }
                      }}
                      onBlur={() => updateGroup(group.id.toString(), editGroupName)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{groupHosts.length} hosts</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingGroup(group.id.toString())
                      setEditGroupName(group.name)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGroup(group.id.toString())}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Drop Zone Indicator */}
              {dragOverGroup === group.id.toString() && draggedItem && (
                <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 mb-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Move className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      Drop {draggedItem.type} here
                    </span>
                  </div>
                </div>
              )}

              {/* Group Hosts */}
              <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                {groupHosts.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hosts in this group</p>
                      <p className="text-xs">Drag hosts here to add them</p>
                    </div>
                  </div>
                ) : (
                  groupHosts.map((host) => (
                    <div
                      key={host.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { type: 'host', id: host.id.toString(), data: host })}
                      onDragEnd={handleDragEnd}
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-move transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Server className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {host.hostname}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {host.ip_address}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${
                          host.status === 'online' ? 'bg-green-500' :
                          host.status === 'offline' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHostsFromGroup(group.id.toString(), [host.id.toString()])
                        }}
                        className="ml-2 text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Ungrouped Hosts */}
      {filteredUngroupedHosts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-3">
              <Server className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Ungrouped Hosts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredUngroupedHosts.length} hosts not assigned to any group
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredUngroupedHosts.map((host) => (
              <div
                key={host.id}
                draggable
                onDragStart={(e) => handleDragStart(e, { type: 'host', id: host.id.toString(), data: host })}
                onDragEnd={handleDragEnd}
                className="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-move transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {host.hostname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {host.ip_address}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${
                    host.status === 'online' ? 'bg-green-500' :
                    host.status === 'offline' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-4 mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-start">
          <MousePointer className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Drag and Drop Instructions
            </h4>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Drag hosts from ungrouped section to any group to assign them</li>
              <li>• Drag hosts between groups to move them</li>
              <li>• Click the × button to remove a host from a group</li>
              <li>• Edit group names by clicking the edit icon</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}