import type { Complaint } from "./types"

export function generateAnalyticsData(complaints: Complaint[]) {
  // Daily complaints trend
  const complaintsByDay = complaints.reduce(
    (acc, complaint) => {
      const date = complaint.createdAt.split(",")[0]
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.total++
        if (complaint.status === "resolved") existing.resolved++
        if (complaint.status === "in_progress") existing.inProgress++
        if (complaint.status === "new") existing.new++
      } else {
        acc.push({
          date,
          total: 1,
          resolved: complaint.status === "resolved" ? 1 : 0,
          inProgress: complaint.status === "in_progress" ? 1 : 0,
          new: complaint.status === "new" ? 1 : 0,
        })
      }
      return acc
    },
    [] as Array<{ date: string; total: number; resolved: number; inProgress: number; new: number }>,
  )

  // Complaints by category
  const complaintsByCategory = complaints.reduce(
    (acc, complaint) => {
      const existing = acc.find((item) => item.name === complaint.category)
      if (existing) {
        existing.value++
      } else {
        acc.push({ name: complaint.category, value: 1 })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  // Sentiment distribution
  const sentimentData = [
    { name: "Позитивные", value: complaints.filter((c) => c.sentiment === "positive").length, color: "#10b981" }, // green
    { name: "Нейтральные", value: complaints.filter((c) => c.sentiment === "neutral").length, color: "#6366f1" }, // indigo
    { name: "Негативные", value: complaints.filter((c) => c.sentiment === "negative").length, color: "#ef4444" }, // red
  ]

  // Priority distribution
  const priorityData = [
    { name: "Критический", value: complaints.filter((c) => c.priority === "critical").length, color: "#dc2626" }, // dark red
    { name: "Высокий", value: complaints.filter((c) => c.priority === "high").length, color: "#f59e0b" }, // amber
    { name: "Средний", value: complaints.filter((c) => c.priority === "medium").length, color: "#3b82f6" }, // blue
    { name: "Низкий", value: complaints.filter((c) => c.priority === "low").length, color: "#10b981" }, // green
  ]

  // Resolution rate
  const totalComplaints = complaints.length
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved").length
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0

  // Average sentiment score
  const averageSentimentScore =
    totalComplaints > 0 ? Math.round(complaints.reduce((sum, c) => sum + c.sentimentScore, 0) / totalComplaints) : 0

  // Average resolution time (in hours - mock data)
  const averageResolutionTime = 4.2

  return {
    complaintsByDay,
    complaintsByCategory,
    sentimentData,
    priorityData,
    resolutionRate,
    averageSentimentScore,
    averageResolutionTime,
    totalComplaints,
    resolvedComplaints,
  }
}
