'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

interface DashboardProps {
  onShowAll: () => void;
  onFilterByStatus?: (status: string) => void;
}

export function Dashboard({ onShowAll, onFilterByStatus }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>('никогда');

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await apiClient.getDashboardStats();
      setStats(dashboardStats);
      setLastSync(new Date().toLocaleTimeString('ru-RU'));
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Mock robot status for now
  const robotOnline = true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Панель управления</h1>
          <p className="text-muted-foreground mt-2">Обзор жалоб и статус системы</p>
        </div>
        <Button
          onClick={loadDashboardStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* System Status Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${robotOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="font-medium">{robotOnline ? '🟢 Система онлайн' : '🔴 Система офлайн'}</p>
            <p className="text-sm text-muted-foreground">Обновлено: {lastSync}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {stats && `Всего кейсов: ${stats.total_cases}`}
        </div>
      </div>

      {/* Key Metrics - Interactive Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Всего кейсов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_cases}</div>
              <p className="text-xs text-muted-foreground mt-2">Общее количество жалоб</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500" onClick={onShowAll}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Открытые кейсы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.open_cases}</div>
              <p className="text-xs text-muted-foreground mt-2">Требуют внимания</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                SLA нарушения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.sla_breach_count}</div>
              <p className="text-xs text-muted-foreground mt-2">Просроченные кейсы</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <Card key={status} className="cursor-pointer hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium capitalize">
                  {status.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <p className="text-xs text-muted-foreground mt-2">Кейсов в этом статусе</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Category Statistics */}
      {stats && stats.by_category && stats.by_category.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Статистика по категориям</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {stats.by_category.slice(0, 6).map((category) => (
                <div key={category.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm capitalize">{category.category.replace('_', ' ')}</span>
                  <span className="font-bold">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Среднее время решения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avg_resolution_hours ? `${stats.avg_resolution_hours.toFixed(1)} ч` : 'Н/Д'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">От получения до решения</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Последнее обновление</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono">{lastSync}</div>
              <p className="text-xs text-muted-foreground mt-2">Данные актуальны</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action */}
      <Button
        onClick={onShowAll}
        className="w-full py-3"
        size="lg"
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        Показать все жалобы
      </Button>
    </div>
  );
}
