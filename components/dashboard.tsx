'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, MessageSquare, Clock, Zap, Activity } from 'lucide-react';

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

  // Loading skeleton
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 skeleton rounded-lg" />
            <div className="h-4 w-48 skeleton rounded-lg" />
          </div>
          <div className="h-9 w-24 skeleton rounded-lg" />
        </div>
        <div className="h-20 skeleton rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Панель управления
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Обзор жалоб и статус системы
          </p>
        </div>
        <Button
          onClick={loadDashboardStats}
          disabled={loading}
          variant="outline"
          size="sm"
          className="card-hover"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50 animate-fade-in-up">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* System Status Banner - Enhanced */}
      <div className={`flex items-center justify-between p-5 rounded-xl ${robotOnline ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'} animate-fade-in-up-delay-1`}>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${robotOnline ? 'status-dot-online animate-pulse-glow' : 'status-dot-offline'}`} />
          <div>
            <p className="font-semibold text-lg">{robotOnline ? 'Система онлайн' : 'Система офлайн'}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Обновлено: {lastSync}
            </p>
          </div>
        </div>
        <div className="text-right">
          {stats && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-lg">{stats.total_cases}</span>
              <span className="text-muted-foreground text-sm">кейсов</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics - Interactive Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md animate-fade-in-up-delay-1" onClick={onShowAll}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                <div className="p-2 bg-blue-100 rounded-lg mr-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                Всего кейсов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stats.total_cases}</div>
              <p className="text-xs text-blue-600/70 mt-2">Общее количество жалоб</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover bg-gradient-to-br from-rose-50 to-red-50 border-none shadow-md animate-fade-in-up-delay-2" onClick={onShowAll}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-red-700">
                <div className="p-2 bg-red-100 rounded-lg mr-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                Открытые кейсы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">{stats.open_cases}</div>
              <p className="text-xs text-red-600/70 mt-2">Требуют внимания</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer card-hover bg-gradient-to-br from-amber-50 to-orange-50 border-none shadow-md animate-fade-in-up-delay-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-orange-700">
                <div className="p-2 bg-orange-100 rounded-lg mr-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                SLA нарушения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">{stats.sla_breach_count}</div>
              <p className="text-xs text-orange-600/70 mt-2">Просроченные кейсы</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Overview */}
      {stats && Object.entries(stats.by_status).length > 0 && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Статусы кейсов
          </h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(stats.by_status).map(([status, count], index) => (
              <Card key={status} className="cursor-pointer card-hover border-none bg-white/50 backdrop-blur shadow-sm hover:bg-white/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-muted-foreground">
                  {status.replace('_', ' ')}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{count}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (count / stats.total_cases) * 100)}%` }}
                    />
                  </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}

      {/* Category Statistics */}
      {stats && stats.by_category && stats.by_category.length > 0 && (
        <Card className="animate-fade-in-up border-none shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              📊 Статистика по категориям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.by_category.slice(0, 6).map((category, index) => (
                <div 
                  key={category.category} 
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 card-hover"
                >
                  <span className="text-sm font-medium capitalize">{category.category.replace('_', ' ')}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in-up">
          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
                <Clock className="w-4 h-4" />
                Среднее время решения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats.avg_resolution_hours ? `${stats.avg_resolution_hours.toFixed(1)} ч` : '—'}
              </div>
              <p className="text-xs text-purple-600/70 mt-2">От получения до решения</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                Последнее обновление
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-emerald-600">{lastSync}</div>
              <p className="text-xs text-emerald-600/70 mt-2">Данные актуальны</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Call to Action */}
      <Button
        onClick={onShowAll}
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up"
        size="lg"
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        Показать все жалобы
      </Button>
    </div>
  );
}

