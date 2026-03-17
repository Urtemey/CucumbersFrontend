"use client"

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"

// Consistent, intentional color palette
const CHART_COLORS = {
  primary:   '#3b82f6',
  success:   '#16a34a',
  warning:   '#d97706',
  danger:    '#dc2626',
  neutral:   '#94a3b8',
  purple:    '#7c3aed',
}

const SENTIMENT_COLORS: Record<string, string> = {
  Позитивные: CHART_COLORS.success,
  Нейтральные: CHART_COLORS.neutral,
  Негативные: CHART_COLORS.danger,
}

const PRIORITY_COLORS: Record<string, string> = {
  Критический: CHART_COLORS.danger,
  Высокий:     CHART_COLORS.warning,
  Средний:     CHART_COLORS.primary,
  Низкий:      CHART_COLORS.success,
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#0f172a',
}

const emptyData = {
  total_complaints: 0,
  resolved_complaints: 0,
  resolution_rate: 0,
  average_sentiment_score: 0,
  average_resolution_time: 0,
  complaints_by_day: [],
  complaints_by_category: [],
  sentiment_data: [],
  priority_data: [],
}

export function Analytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getAnalytics()
      setData(result)
    } catch (err) {
      setData(emptyData)
      setError('Не удалось загрузить данные. Проверьте подключение к серверу.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnalytics() }, [])

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-36 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 skeleton rounded-lg" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-72 skeleton rounded-lg" />)}
        </div>
      </div>
    )
  }

  const d = data || emptyData
  const sentimentData  = d.sentiment_data  || d.sentimentData  || []
  const priorityData   = d.priority_data   || d.priorityData   || []
  const byDay          = d.complaints_by_day      || d.complaintsByDay      || []
  const byCategory     = d.complaints_by_category || d.complaintsByCategory || []
  const total          = d.total_complaints   || d.totalComplaints   || 0
  const resolved       = d.resolved_complaints || d.resolvedComplaints || 0
  const rate           = d.resolution_rate    || d.resolutionRate    || 0
  const sentScore      = d.average_sentiment_score || d.averageSentimentScore || 0
  const avgTime        = d.average_resolution_time || d.averageResolutionTime || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Аналитика</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Сводка за период</p>
        </div>
        <Button onClick={loadAnalytics} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative bg-card border border-border rounded-lg p-4 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Всего</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{total}</p>
          <p className="text-xs text-muted-foreground mt-1">обращений</p>
        </div>

        <div className="relative bg-card border border-border rounded-lg p-4 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg" />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Решено</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{resolved}</p>
          <p className="text-xs text-muted-foreground mt-1">{rate}% от всех</p>
        </div>

        <div className="relative bg-card border border-border rounded-lg p-4 overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${sentScore > 50 ? 'bg-red-500' : 'bg-border'}`} />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Негативность</p>
          <p className={`text-2xl font-bold tabular-nums ${sentScore > 50 ? 'text-red-600' : 'text-foreground'}`}>
            {sentScore}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">средняя</p>
        </div>

        <div className="relative bg-card border border-border rounded-lg p-4 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-l-lg" />
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Время решения</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {avgTime > 0 ? <>{avgTime}<span className="text-sm font-normal text-muted-foreground ml-1">ч</span></> : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">среднее</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily trend */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Динамика по дням</h2>
          {byDay.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total"    stroke={CHART_COLORS.primary}  name="Всего"          strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="resolved" stroke={CHART_COLORS.success}  name="Решено за день" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="new"      stroke={CHART_COLORS.warning}  name="В ожидании"     strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By category */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">По категориям</h2>
          {byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={CHART_COLORS.primary} name="Количество" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sentiment pie */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Тональность</h2>
          {sentimentData.length === 0 || sentimentData.every((e: any) => e.value === 0) ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={sentimentData.filter((e: any) => e.value > 0)}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={48}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {sentimentData.filter((e: any) => e.value > 0).map((entry: any, i: number) => (
                    <Cell key={i} fill={SENTIMENT_COLORS[entry.name] || CHART_COLORS.neutral} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => [val, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority pie */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Приоритеты</h2>
          {priorityData.length === 0 || priorityData.every((e: any) => e.value === 0) ? (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">Нет данных</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={priorityData.filter((e: any) => e.value > 0)}
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={48}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {priorityData.filter((e: any) => e.value > 0).map((entry: any, i: number) => (
                    <Cell key={i} fill={PRIORITY_COLORS[entry.name] || CHART_COLORS.neutral} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => [val, name]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category table */}
      {byCategory.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Категории — подробно</h2>
          </div>
          <div className="divide-y divide-border">
            {byCategory.map((cat: any) => (
              <div key={cat.name} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-foreground">{cat.name}</span>
                <span className="text-sm font-medium tabular-nums text-foreground">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
