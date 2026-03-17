'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Inbox, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  new: 'Новые',
  in_review: 'На рассмотрении',
  assigned: 'Назначены',
  in_progress: 'В работе',
  pending_info: 'Ждут информации',
  resolved: 'Решены',
  closed: 'Закрыты',
  rejected: 'Отклонены',
};

const CATEGORY_LABELS: Record<string, string> = {
  medical:    'Медицинская',
  school:     'Образовательная',
  housing:    'ЖКХ',
  service:    'Обслуживание',
  hotel:      'Гостиничная',
  retail:     'Торговля',
  government: 'Государственные услуги',
  other:      'Прочее',
};

const STATUS_BAR_COLOR: Record<string, string> = {
  new: '#3b82f6',
  in_review: '#8b5cf6',
  assigned: '#f59e0b',
  in_progress: '#f97316',
  pending_info: '#64748b',
  resolved: '#16a34a',
  closed: '#94a3b8',
  rejected: '#dc2626',
};

interface DashboardProps {
  onShowAll: () => void;
  onFilterByStatus?: (status: string) => void;
}

export function Dashboard({ onShowAll, onFilterByStatus }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>('—');

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await apiClient.getDashboardStats();
      setStats(dashboardStats);
      setLastSync(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-32 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
          <div className="h-8 w-20 skeleton rounded-md" />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 skeleton rounded-lg" />)}
        </div>
        <div className="h-56 skeleton rounded-lg" />
        <div className="h-40 skeleton rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Обзор</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lastSync !== '—' ? `Обновлено в ${lastSync}` : 'Загрузка данных...'}
          </p>
        </div>
        <Button
          onClick={loadDashboardStats}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Key metrics */}
      {stats && (
        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={onShowAll}
            className="relative text-left p-5 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-sm transition-all group overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Всего
              </span>
              <Inbox className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums">{stats.total_cases}</p>
            <p className="text-xs text-muted-foreground mt-1.5">обращений в системе</p>
          </button>

          <button
            onClick={onShowAll}
            className="relative text-left p-5 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-sm transition-all group overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${stats.open_cases > 0 ? 'bg-amber-500' : 'bg-border'}`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Открытые
              </span>
              <AlertTriangle className={`w-4 h-4 transition-colors ${stats.open_cases > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums">{stats.open_cases}</p>
            <p className="text-xs text-muted-foreground mt-1.5">требуют обработки</p>
          </button>

          <div className={`relative p-5 bg-card border rounded-lg overflow-hidden ${stats.sla_breach_count > 0 ? 'border-red-200 bg-red-50/30' : 'border-border'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${stats.sla_breach_count > 0 ? 'bg-red-500' : 'bg-border'}`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                SLA нарушения
              </span>
              <ShieldAlert className={`w-4 h-4 ${stats.sla_breach_count > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-3xl font-bold tabular-nums ${stats.sla_breach_count > 0 ? 'text-red-600' : 'text-foreground'}`}>
              {stats.sla_breach_count}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">просроченных кейсов</p>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {stats && Object.entries(stats.by_status).length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">По статусам</h2>
          </div>
          <div className="divide-y divide-border">
            {Object.entries(stats.by_status)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const color = STATUS_BAR_COLOR[status] ?? '#94a3b8';
                const pct = Math.min(100, (count / Math.max(stats.total_cases, 1)) * 100);
                return (
                  <div key={status} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-sm text-foreground">
                        {STATUS_LABELS[status] ?? status.replace(/_/g, '\u00a0')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <span className="text-sm font-medium tabular-nums text-foreground w-5 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Categories */}
      {stats?.by_category && stats.by_category.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">По категориям</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.by_category.slice(0, 6).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-foreground">
                  {CATEGORY_LABELS[cat.category] ?? cat.category.replace(/_/g, '\u00a0')}
                </span>
                <span className="text-sm font-medium tabular-nums text-foreground">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row */}
      {stats && (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative p-5 bg-card border border-border rounded-lg overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-l-lg" />
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Среднее время решения
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {stats.avg_resolution_hours ? `${stats.avg_resolution_hours.toFixed(1)}\u00a0ч` : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">от приёма до закрытия</p>
          </div>

          <button
            onClick={onShowAll}
            className="relative p-5 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-sm transition-all group text-left overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/20 group-hover:bg-foreground/40 rounded-l-lg transition-colors" />
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Все обращения
            </p>
            <p className="text-sm text-foreground">Перейти к полному списку</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              <span>Открыть</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
