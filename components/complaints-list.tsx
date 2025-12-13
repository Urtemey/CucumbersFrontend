'use client';

import { useState } from 'react';
import { mockComplaints } from '@/lib/mock-data';
import { ComplaintStatus, ComplaintPriority } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface ComplaintsListProps {
  onSelectComplaint: (id: string) => void;
}

export function ComplaintsList({ onSelectComplaint }: ComplaintsListProps) {
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'critical':
        return '#E74C3C';
      case 'high':
        return '#FFA500';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#50C878';
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusLabel = (status: ComplaintStatus) => {
    switch (status) {
      case 'new':
        return 'Новая';
      case 'in_progress':
        return 'На рассмотрении';
      case 'resolved':
        return 'Решена';
    }
  };

  const statusCounts = {
    all: mockComplaints.length,
    new: mockComplaints.filter(c => c.status === 'new').length,
    in_progress: mockComplaints.filter(c => c.status === 'in_progress').length,
    resolved: mockComplaints.filter(c => c.status === 'resolved').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">Жалобы</h1>
        <p className="text-muted-foreground mt-2">Управление и отслеживание жалоб клиентов</p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Поиск по тексту жалобы..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'all'
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === 'all' ? { backgroundColor: '#4A90E2' } : {}}
        >
          Все ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('new')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'new'
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === 'new' ? { backgroundColor: '#4A90E2' } : {}}
        >
          Новые ({statusCounts.new})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'in_progress'
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === 'in_progress' ? { backgroundColor: '#4A90E2' } : {}}
        >
          На рассмотрении ({statusCounts.in_progress})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === 'resolved'
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === 'resolved' ? { backgroundColor: '#4A90E2' } : {}}
        >
          Решены ({statusCounts.resolved})
        </button>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-muted-foreground font-medium">Отличные новости! Жалоб не найдено</p>
            <button
              onClick={() => setStatusFilter('all')}
              className="mt-4 px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#4A90E2', color: 'white' }}
            >
              Обновить
            </button>
          </Card>
        ) : (
          filteredComplaints.map(complaint => (
            <Card
              key={complaint.id}
              onClick={() => onSelectComplaint(complaint.id)}
              className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
            >
              <div className="flex gap-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground truncate">{complaint.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{complaint.category}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadge(complaint.status)}`}>
                        {getStatusLabel(complaint.status)}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>🕐 {complaint.createdAt}</span>
                    <span>•</span>
                    <span>🏥 {complaint.robotLocation}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
