"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

const SENTIMENT_COLORS: Record<string, string> = {
  Позитивные: "#10b981",
  Нейтральные: "#6366f1",
  Негативные: "#ef4444",
}

const PRIORITY_COLORS: Record<string, string> = {
  Критический: "#dc2626",
  Высокий: "#f59e0b",
  Средний: "#3b82f6",
  Низкий: "#10b981",
}

export function Analytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default empty data structure
  const emptyData = {
    total_complaints: 0,
    resolved_complaints: 0,
    resolution_rate: 0,
    average_sentiment_score: 0,
    average_resolution_time: 0,
    complaints_by_day: [],
    complaints_by_category: [],
    sentiment_data: [],
    priority_data: []
  }

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)
        const analyticsData = await apiClient.getAnalytics()
        setData(analyticsData)
      } catch (err) {
        console.error('Failed to load analytics:', err)
        setData(emptyData)
        setError('Не удалось загрузить данные аналитики. Проверьте подключение к серверу.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Аналитика и отчёты</h1>
          <p className="text-muted-foreground mt-1">Загрузка данных...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Use empty data as fallback
  const analyticsData = data || emptyData

  // Normalize data keys (support both snake_case from API and camelCase)
  const sentimentData = analyticsData.sentiment_data || analyticsData.sentimentData || []
  const priorityData = analyticsData.priority_data || analyticsData.priorityData || []
  const complaintsByDay = analyticsData.complaints_by_day || analyticsData.complaintsByDay || []
  const complaintsByCategory = analyticsData.complaints_by_category || analyticsData.complaintsByCategory || []

  const coloredSentimentData = sentimentData.map((item: any) => ({
    ...item,
    fill: SENTIMENT_COLORS[item.name] || "#888888",
  }))

  const coloredPriorityData = priorityData.map((item: any) => ({
    ...item,
    fill: PRIORITY_COLORS[item.name] || "#888888",
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📊 Аналитика и отчёты
          </h1>
          <p className="text-muted-foreground mt-1">Анализ всех жалоб и отзывов за период</p>
          {error && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              ⚠️ {error}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setLoading(true)
            apiClient.getAnalytics()
              .then(setData)
              .catch((err) => {
                console.error('Failed to refresh analytics:', err)
                setError('Ошибка обновления данных')
              })
              .finally(() => setLoading(false))
          }}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            '🔄'
          )}
          Обновить
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm card-hover animate-fade-in-up-delay-1">
          <div className="text-blue-700 text-sm font-medium flex items-center gap-2">
            📋 Всего жалоб
          </div>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
            {analyticsData.total_complaints || analyticsData.totalComplaints || 0}
          </div>
          <div className="text-xs text-blue-600/70 mt-2">За последние 30 дней</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm card-hover animate-fade-in-up-delay-2">
          <div className="text-emerald-700 text-sm font-medium flex items-center gap-2">
            ✅ Разрешено
          </div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {analyticsData.resolved_complaints || analyticsData.resolvedComplaints || 0}
          </div>
          <div className="text-xs text-emerald-600/70 mt-2">
            {analyticsData.resolution_rate || analyticsData.resolutionRate || 0}% разрешено
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 shadow-sm card-hover animate-fade-in-up-delay-3">
          <div className="text-rose-700 text-sm font-medium flex items-center gap-2">
            💬 Средняя тональность
          </div>
          <div className="text-4xl font-bold mt-2">
            <span className={(analyticsData.average_sentiment_score || analyticsData.averageSentimentScore || 0) > 50 ? "text-red-600" : "text-emerald-600"}>
              {analyticsData.average_sentiment_score || analyticsData.averageSentimentScore || 0}%
            </span>
          </div>
          <div className="text-xs text-rose-600/70 mt-2">Негативность отзывов</div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 shadow-sm card-hover animate-fade-in-up">
          <div className="text-violet-700 text-sm font-medium flex items-center gap-2">
            ⏱️ Время решения
          </div>
          <div className="text-4xl font-bold text-violet-600 mt-2">
            {analyticsData.average_resolution_time || analyticsData.averageResolutionTime || 0}ч
          </div>
          <div className="text-xs text-violet-600/70 mt-2">Среднее время</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Complaints Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            📈 Тренд жалоб по дням
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complaintsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#4A90E2" name="Всего" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" stroke="#50C878" name="Разрешено" strokeWidth={2} />
              <Line type="monotone" dataKey="new" stroke="#FFA500" name="Новые" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            📊 Жалобы по категориям
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={complaintsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
              <Bar dataKey="value" fill="#4A90E2" name="Количество" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution - Using fill from data */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            😊 Распределение тональности
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={coloredSentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                dataKey="value"
              />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution - Using fill from data */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            🎯 Распределение приоритетов
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={coloredPriorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                dataKey="value"
              />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Statistics Table */}
      {complaintsByCategory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-fade-in-up">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            📋 Статистика по категориям
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Категория</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Количество</th>
                </tr>
              </thead>
              <tbody>
                {complaintsByCategory.map((category: any) => (
                  <tr key={category.name} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{category.name}</td>
                    <td className="text-right py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{category.value}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
