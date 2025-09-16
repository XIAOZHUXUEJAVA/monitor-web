'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Server,
  Database,
  Shield,
  Network,
  Monitor,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { HostAPI } from '@/lib/host-api'
import { Host, HostConfig, CreateHostConfigRequest } from '@/types/host'

interface HostConfigModalProps {
  isOpen: boolean
  onClose: () => void
  host: Host | null
  onSave?: (configs: HostConfig[]) => void
}

const CONFIG_CATEGORIES = [
  { key: 'monitoring', label: 'Monitoring', icon: Monitor, color: 'blue' },
  { key: 'database', label: 'Database', icon: Database, color: 'green' },
  { key: 'security', label: 'Security', icon: Shield, color: 'red' },
  { key: 'network', label: 'Network', icon: Network, color: 'purple' },
  { key: 'system', label: 'System', icon: Settings, color: 'gray' },
  { key: 'application', label: 'Application', icon: Server, color: 'orange' }
]

const PRESET_CONFIGS = {
  monitoring: [
    { key: 'check_interval', value: '60', description: 'Health check interval in seconds' },
    { key: 'timeout', value: '30', description: 'Request timeout in seconds' },
    { key: 'retry_count', value: '3', description: 'Number of retry attempts' }
  ],
  database: [
    { key: 'max_connections', value: '100', description: 'Maximum database connections' },
    { key: 'connection_timeout', value: '30', description: 'Connection timeout in seconds' },
    { key: 'query_timeout', value: '60', description: 'Query timeout in seconds' }
  ],
  security: [
    { key: 'ssl_enabled', value: 'true', description: 'Enable SSL/TLS encryption' },
    { key: 'auth_required', value: 'true', description: 'Require authentication' },
    { key: 'token_expiry', value: '3600', description: 'Token expiry time in seconds' }
  ],
  network: [
    { key: 'port', value: '8080', description: 'Application port' },
    { key: 'proxy_enabled', value: 'false', description: 'Enable proxy' },
    { key: 'load_balancer', value: 'round_robin', description: 'Load balancing algorithm' }
  ]
}

export default function HostConfigModal({ isOpen, onClose, host, onSave }: HostConfigModalProps) {
  const [configs, setConfigs] = useState<HostConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('monitoring')
  const [newConfig, setNewConfig] = useState({ key: '', value: '', description: '' })
  const [showValues, setShowValues] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const hostAPI = new HostAPI()

  useEffect(() => {
    if (isOpen && host) {
      fetchConfigs()
    }
  }, [isOpen, host])

  const fetchConfigs = async () => {
    if (!host) return
    
    try {
      setLoading(true)
      const response = await hostAPI.getHostConfigs(host.id)
      setConfigs(response.data)
    } catch (error) {
      console.error('Failed to fetch host configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!host || configs.length === 0) return

    try {
      setSaving(true)
      const newConfigs = configs.filter(c => !c.id)
      
      if (newConfigs.length > 0) {
        const createRequests: CreateHostConfigRequest[] = newConfigs.map(config => ({
          host_id: host.id,
          category: config.category,
          config_key: config.config_key,
          config_value: config.config_value,
          description: config.description,
          is_sensitive: config.is_sensitive
        }))
        
        await hostAPI.batchCreateHostConfigs(createRequests)
      }

      onSave?.(configs)
      onClose()
    } catch (error) {
      console.error('Failed to save configs:', error)
    } finally {
      setSaving(false)
    }
  }

  const addConfig = () => {
    if (!newConfig.key || !newConfig.value) return

    const config: HostConfig = {
      id: '', // Will be assigned by server
      host_id: host?.id || '',
      category: selectedCategory,
      config_key: newConfig.key,
      config_value: newConfig.value,
      description: newConfig.description,
      is_sensitive: newConfig.key.toLowerCase().includes('password') || 
                   newConfig.key.toLowerCase().includes('secret') ||
                   newConfig.key.toLowerCase().includes('token'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setConfigs([...configs, config])
    setNewConfig({ key: '', value: '', description: '' })
  }

  const removeConfig = (index: number) => {
    setConfigs(configs.filter((_, i) => i !== index))
  }

  const toggleShowValue = (configKey: string) => {
    const newShowValues = new Set(showValues)
    if (newShowValues.has(configKey)) {
      newShowValues.delete(configKey)
    } else {
      newShowValues.add(configKey)
    }
    setShowValues(newShowValues)
  }

  const addPresetConfig = (preset: { key: string, value: string, description: string }) => {
    const exists = configs.some(c => c.config_key === preset.key && c.category === selectedCategory)
    if (exists) return

    const config: HostConfig = {
      id: '',
      host_id: host?.id || '',
      category: selectedCategory,
      config_key: preset.key,
      config_value: preset.value,
      description: preset.description,
      is_sensitive: preset.key.toLowerCase().includes('password') || 
                   preset.key.toLowerCase().includes('secret') ||
                   preset.key.toLowerCase().includes('token'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setConfigs([...configs, config])
  }

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory
    const matchesSearch = !searchTerm || 
      config.config_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    const categoryConfig = CONFIG_CATEGORIES.find(c => c.key === category)
    return categoryConfig?.icon || Settings
  }

  const getCategoryColor = (category: string) => {
    const categoryConfig = CONFIG_CATEGORIES.find(c => c.key === category)
    return categoryConfig?.color || 'gray'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg mr-4">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Host Configuration</h2>
              <p className="text-blue-100">{host?.name} ({host?.ip_address})</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Sidebar - Categories */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Categories
              </button>
              {CONFIG_CATEGORIES.map((category) => {
                const Icon = category.icon
                const configCount = configs.filter(c => c.category === category.key).length
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.key 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {category.label}
                    </div>
                    {configCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {configCount}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Preset Configs */}
            {selectedCategory !== 'all' && PRESET_CONFIGS[selectedCategory as keyof typeof PRESET_CONFIGS] && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Add</h3>
                <div className="space-y-2">
                  {PRESET_CONFIGS[selectedCategory as keyof typeof PRESET_CONFIGS].map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => addPresetConfig(preset)}
                      className="w-full text-left px-3 py-2 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      disabled={configs.some(c => c.config_key === preset.key && c.category === selectedCategory)}
                    >
                      <div className="font-medium">{preset.key}</div>
                      <div className="text-gray-500 dark:text-gray-400 truncate">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Search and Add Form */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {selectedCategory !== 'all' && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Add New {CONFIG_CATEGORIES.find(c => c.key === selectedCategory)?.label} Config
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Config Key"
                      value={newConfig.key}
                      onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newConfig.value}
                      onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newConfig.description}
                      onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <Button 
                      onClick={addConfig} 
                      size="sm"
                      disabled={!newConfig.key || !newConfig.value}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Config List */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {selectedCategory === 'all' ? 'No configurations found' : `No ${selectedCategory} configurations`}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Add some configurations to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConfigs.map((config, index) => {
                    const Icon = getCategoryIcon(config.category)
                    const isNewConfig = !config.id
                    return (
                      <Card key={`${config.category}-${config.config_key}-${index}`} 
                            className={`p-4 transition-all ${isNewConfig ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className={`p-2 rounded-lg mr-4 bg-${getCategoryColor(config.category)}-100 dark:bg-${getCategoryColor(config.category)}-900/30`}>
                              <Icon className={`w-4 h-4 text-${getCategoryColor(config.category)}-600 dark:text-${getCategoryColor(config.category)}-400`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{config.config_key}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {config.category}
                                </Badge>
                                {config.is_sensitive && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Sensitive
                                  </Badge>
                                )}
                                {isNewConfig && (
                                  <Badge variant="default" className="text-xs bg-green-500">
                                    <Plus className="w-3 h-3 mr-1" />
                                    New
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                  {config.is_sensitive && !showValues.has(config.config_key) 
                                    ? '••••••••' 
                                    : config.config_value}
                                </span>
                                {config.is_sensitive && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleShowValue(config.config_key)}
                                    className="ml-2 h-6 w-6 p-0"
                                  >
                                    {showValues.has(config.config_key) ? (
                                      <EyeOff className="w-3 h-3" />
                                    ) : (
                                      <Eye className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </div>
                              {config.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {config.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(config.config_value)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeConfig(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            {configs.length} configuration(s) total
            {configs.filter(c => !c.id).length > 0 && (
              <span className="ml-4 text-green-600 dark:text-green-400">
                {configs.filter(c => !c.id).length} new config(s) to save
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || configs.filter(c => !c.id).length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}