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
import { mockComplaints } from "@/lib/mock-data"
import { generateAnalyticsData } from "@/lib/analytics-data"

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
  const data = generateAnalyticsData(mockComplaints)

  const coloredSentimentData = data.sentimentData.map((item) => ({
    ...item,
    fill: SENTIMENT_COLORS[item.name] || "#888888",
  }))

  const coloredPriorityData = data.priorityData.map((item) => ({
    ...item,
    fill: PRIORITY_COLORS[item.name] || "#888888",
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Аналитика и отчёты</h1>
        <p className="text-muted-foreground mt-1">Анализ всех жалоб и отзывов за период</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-muted-foreground text-sm font-medium">Всего жалоб</div>
          <div className="text-3xl font-bold text-foreground mt-2">{data.totalComplaints}</div>
          <div className="text-xs text-muted-foreground mt-2">За последние 30 дней</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-muted-foreground text-sm font-medium">Разрешено</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{data.resolvedComplaints}</div>
          <div className="text-xs text-muted-foreground mt-2">{data.resolutionRate}% разрешено</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-muted-foreground text-sm font-medium">Средняя тональность</div>
          <div className="text-3xl font-bold mt-2">
            <span className={data.averageSentimentScore > 50 ? "text-red-600" : "text-green-600"}>
              {data.averageSentimentScore}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">Негативность отзывов</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-muted-foreground text-sm font-medium">Время решения</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{data.averageResolutionTime}ч</div>
          <div className="text-xs text-muted-foreground mt-2">Среднее время</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Complaints Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Тренд жалоб по дням</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.complaintsByDay}>
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
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Жалобы по категориям</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.complaintsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
              <Bar dataKey="value" fill="#4A90E2" name="Количество" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution - Using fill from data */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Распределение тональности</h2>
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
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Распределение приоритетов</h2>
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
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Статистика по категориям</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Категория</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Всего</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Разрешено</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">% Негатива</th>
              </tr>
            </thead>
            <tbody>
              {data.complaintsByCategory.map((category) => {
                const categoryComplaints = mockComplaints.filter((c) => c.category === category.name)
                const resolved = categoryComplaints.filter((c) => c.status === "resolved").length
                const negativePercent = Math.round(
                  (categoryComplaints.filter((c) => c.sentiment === "negative").length / categoryComplaints.length) *
                    100,
                )
                return (
                  <tr key={category.name} className="border-b border-border hover:bg-accent transition-colors">
                    <td className="py-3 px-4 text-foreground">{category.name}</td>
                    <td className="text-right py-3 px-4 text-foreground">{category.value}</td>
                    <td className="text-right py-3 px-4 text-green-600">{resolved}</td>
                    <td className="text-right py-3 px-4">
                      <span className={negativePercent > 50 ? "text-red-600" : "text-yellow-600"}>
                        {negativePercent}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
