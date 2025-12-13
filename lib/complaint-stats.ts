import { mockComplaints } from './mock-data';
import { ComplaintStatus } from './types';

export function getComplaintStats() {
  const total = mockComplaints.length;
  const critical = mockComplaints.filter(c => c.priority === 'critical').length;
  const negativePercentage = Math.round(
    (mockComplaints.filter(c => c.sentiment === 'negative').length / total) * 100
  );

  const statusCounts = {
    new: mockComplaints.filter(c => c.status === 'new').length,
    in_progress: mockComplaints.filter(c => c.status === 'in_progress').length,
    resolved: mockComplaints.filter(c => c.status === 'resolved').length,
  };

  const resolvedComplaints = mockComplaints.filter(c => c.status === 'resolved' && c.resolvedAt);
  const resolvedPercentage = Math.round((resolvedComplaints.length / total) * 100);
  
  // Calculate average resolution time in days (mock calculation)
  const avgResolutionTime = resolvedComplaints.length > 0 ? 3.2 : 0;

  return {
    total,
    critical,
    negativePercentage,
    resolvedPercentage,
    avgResolutionTime,
    lastUpdated: new Date().toLocaleString('ru-RU'),
    ...statusCounts,
  };
}
