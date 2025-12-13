'use client';

import { getComplaintStats } from '@/lib/complaint-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardProps {
  onShowAll: () => void;
  onFilterByStatus?: (status: string) => void;
}

export function Dashboard({ onShowAll, onFilterByStatus }: DashboardProps) {
  const stats = getComplaintStats();

  const robotOnline = true;
  const lastSync = '2 минуты назад';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Обзор жалоб и статус робота</p>
      </div>

      {/* Robot Status Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#F5F7FA', borderLeft: `4px solid ${robotOnline ? '#50C878' : '#E74C3C'}` }}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${robotOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="font-medium">{robotOnline ? '🟢 Робот онлайн' : '🔴 Робот офлайн'}</p>
            <p className="text-sm text-muted-foreground">Синхронизация: {lastSync}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics - Interactive Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего жалоб</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">Получено в этом месяце</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll} style={{ borderLeft: `4px solid #E74C3C` }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Критические</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#E74C3C' }}>{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-2">Требуют срочного внимания</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Негативные отзывы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: '#FFA500' }}>{stats.negativePercentage}%</div>
            <p className="text-xs text-muted-foreground mt-2">От общего количества</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview - Interactive Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll} style={{ borderTop: `3px solid #4A90E2` }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Новые жалобы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#4A90E2' }}>{stats.new}</div>
            <p className="text-xs text-muted-foreground mt-2">Не просмотрены</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll} style={{ borderTop: `3px solid #FFA500` }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">На рассмотрении</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#FFA500' }}>{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-2">В процессе обработки</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onShowAll} style={{ borderTop: `3px solid #50C878` }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Решено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#50C878' }}>{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-2">Закрыты • {stats.resolvedPercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Среднее время решения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime} дня</div>
            <p className="text-xs text-muted-foreground mt-2">От получения до решения</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Последнее обновление</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{stats.lastUpdated}</div>
            <p className="text-xs text-muted-foreground mt-2">Данные актуальны</p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <button
        onClick={onShowAll}
        className="w-full font-semibold py-3 px-4 rounded-lg transition-colors text-white"
        style={{ backgroundColor: '#4A90E2' }}
      >
        Показать все жалобы
      </button>
    </div>
  );
}
