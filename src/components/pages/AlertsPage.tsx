"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getAlertRules, AlertRule, formatDuration } from "@/lib/alert-api";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Filter,
  Search,
  Clock
} from "lucide-react";

export function AlertsPage() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  // 加载告警规则
  useEffect(() => {
    const loadAlertRules = async () => {
      try {
        setLoadingRules(true);
        const rules = await getAlertRules();
        setAlertRules(rules);
      } catch (error) {
        console.error('Failed to load alert rules:', error);
      } finally {
        setLoadingRules(false);
      }
    };

    loadAlertRules();
  }, []);

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "CPU使用率过高",
      message: "CPU使用率持续超过80%已达5分钟",
      timestamp: "2024-01-15 14:30:25",
      source: "CPU监控",
      resolved: false,
    },
    {
      id: 2,
      type: "error",
      title: "磁盘空间不足",
      message: "/var 分区剩余空间不足10%",
      timestamp: "2024-01-15 14:25:10",
      source: "磁盘监控",
      resolved: false,
    },
    {
      id: 3,
      type: "info",
      title: "系统重启完成",
      message: "系统已成功重启，所有服务正常运行",
      timestamp: "2024-01-15 09:15:30",
      source: "系统监控",
      resolved: true,
    },
    {
      id: 4,
      type: "warning",
      title: "内存使用率警告",
      message: "内存使用率超过85%",
      timestamp: "2024-01-15 13:45:12",
      source: "内存监控",
      resolved: true,
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBadge = (type: string, resolved: boolean) => {
    if (resolved) {
      return <Badge variant="secondary">已解决</Badge>;
    }
    
    switch (type) {
      case "error":
        return <Badge variant="destructive">严重</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">警告</Badge>;
      case "info":
        return <Badge variant="outline">信息</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const unResolvedCount = alerts.filter(alert => !alert.resolved).length;

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          {/* <h2 className="text-2xl font-bold text-gray-900 dark:text-white">告警中心</h2> */}
          <p className="text-gray-600 dark:text-gray-400">
            监控系统告警和通知 · 共 {alerts.length} 条告警，{unResolvedCount} 条待处理
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            配置
          </Button>
        </div>
      </div>

      {/* 告警统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="monitor-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总告警数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="monitor-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">严重告警</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.type === "error" && !a.resolved).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="monitor-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">警告告警</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.type === "warning" && !a.resolved).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="monitor-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">已解决</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.resolved).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 告警列表 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            告警列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  alert.resolved 
                    ? "bg-gray-50 dark:bg-gray-800/50 opacity-75" 
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {alert.title}
                        </h4>
                        {getAlertBadge(alert.type, alert.resolved)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>来源: {alert.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.resolved && (
                      <Button variant="outline" size="sm">
                        标记已解决
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      详情
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 告警规则配置 */}
      <Card className="monitor-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            告警规则
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRules ? (
            <div className="text-center py-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">加载告警规则中...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {rule.metric_type.toUpperCase()}使用率{rule.operator}{rule.threshold}%持续{formatDuration(rule.duration)}时触发
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {rule.host_id ? `主机特定规则 (ID: ${rule.host_id})` : '全局规则'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={rule.severity === 'critical' ? 'destructive' : 
                              rule.severity === 'warning' ? 'default' : 'secondary'}
                    >
                      {rule.severity === 'critical' ? '严重' : 
                       rule.severity === 'warning' ? '警告' : '信息'}
                    </Badge>
                    <Badge variant={rule.enabled ? "outline" : "secondary"}>
                      {rule.enabled ? '启用' : '禁用'}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {alertRules.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">暂无告警规则</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}