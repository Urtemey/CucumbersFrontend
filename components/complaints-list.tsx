'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { CaseResponse, CaseStatus, ComplaintPriority, CaseListResponse, PRIORITY_DISPLAY_NAMES } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ComplaintsListProps {
  onSelectComplaint: (id: string) => void;
}

export function ComplaintsList({ onSelectComplaint }: ComplaintsListProps) {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCases = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response: CaseListResponse = await apiClient.getCases(
        page,
        20, // pageSize
        statusFilter === 'all' ? undefined : statusFilter,
        priorityFilter === 'all' ? undefined : priorityFilter
      );

      setCases(response.items);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.page_size));
    } catch (err) {
      console.error('Error loading cases:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки жалоб');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [statusFilter, priorityFilter]);

  const filteredCases = cases.filter(caseItem => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const title = caseItem.id; // Case ID as title for now
    const description = caseItem.text_artifacts?.original || '';

    return title.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  const getPriorityColor = (priority: ComplaintPriority) => {
    switch (priority) {
      case ComplaintPriority.URGENT:
        return '#E74C3C';
      case ComplaintPriority.HIGH:
        return '#FFA500';
      case ComplaintPriority.NORMAL:
        return '#FFC107';
      case ComplaintPriority.LOW:
        return '#50C878';
    }
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case CaseStatus.IN_REVIEW:
      case CaseStatus.ASSIGNED:
      case CaseStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800';
      case CaseStatus.RESOLVED:
      case CaseStatus.CLOSED:
        return 'bg-green-100 text-green-800';
      case CaseStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.NEW:
        return 'Новая';
      case CaseStatus.IN_REVIEW:
        return 'На рассмотрении';
      case CaseStatus.ASSIGNED:
        return 'Назначена';
      case CaseStatus.IN_PROGRESS:
        return 'В работе';
      case CaseStatus.PENDING_INFO:
        return 'Ожидает информации';
      case CaseStatus.RESOLVED:
        return 'Решена';
      case CaseStatus.CLOSED:
        return 'Закрыта';
      case CaseStatus.REJECTED:
        return 'Отклонена';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: ComplaintPriority) => {
    return PRIORITY_DISPLAY_NAMES[priority] || priority;
  };

  // Calculate status counts from loaded cases
  const statusCounts = cases.reduce((acc, caseItem) => {
    const status = caseItem.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  statusCounts.all = cases.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">Жалобы</h1>
          <p className="text-muted-foreground mt-2">Управление и отслеживание жалоб клиентов</p>
        </div>
        <Button
          onClick={() => loadCases(currentPage)}
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

      {/* Search */}
      <input
        type="text"
        placeholder="Поиск по ID кейса или тексту..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Status Filters */}
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
          Все ({statusCounts.all || 0})
        </button>
        <button
          onClick={() => setStatusFilter(CaseStatus.NEW)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === CaseStatus.NEW
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === CaseStatus.NEW ? { backgroundColor: '#4A90E2' } : {}}
        >
          Новые ({statusCounts[CaseStatus.NEW] || 0})
        </button>
        <button
          onClick={() => setStatusFilter(CaseStatus.IN_PROGRESS)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === CaseStatus.IN_PROGRESS
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === CaseStatus.IN_PROGRESS ? { backgroundColor: '#4A90E2' } : {}}
        >
          В работе ({statusCounts[CaseStatus.IN_PROGRESS] || 0})
        </button>
        <button
          onClick={() => setStatusFilter(CaseStatus.RESOLVED)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            statusFilter === CaseStatus.RESOLVED
              ? 'text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
          style={statusFilter === CaseStatus.RESOLVED ? { backgroundColor: '#4A90E2' } : {}}
        >
          Решены ({statusCounts[CaseStatus.RESOLVED] || 0})
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <p className="text-muted-foreground font-medium">Загрузка жалоб...</p>
            </div>
          </Card>
        ) : filteredCases.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-muted-foreground font-medium">
              {cases.length === 0 ? 'Жалоб пока нет' : 'Жалоб по выбранным фильтрам не найдено'}
            </p>
            <Button
              onClick={() => loadCases(1)}
              className="mt-4"
            >
              Обновить
            </Button>
          </Card>
        ) : (
          filteredCases.map(caseItem => (
            <Card
              key={caseItem.id}
              onClick={() => onSelectComplaint(caseItem.id)}
              className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
            >
              <div className="flex gap-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: getPriorityColor(caseItem.priority) }}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        Кейс #{caseItem.id}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {caseItem.metrics?.category_display || 'Категория не определена'}
                      </p>
                      {caseItem.text_artifacts?.original && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {caseItem.text_artifacts.original.substring(0, 150)}...
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadge(caseItem.status)}`}>
                        {getStatusLabel(caseItem.status)}
                      </span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>🕐 {new Date(caseItem.created_at).toLocaleString('ru-RU')}</span>
                    <span>•</span>
                    <span>Приоритет: {getPriorityLabel(caseItem.priority)}</span>
                    {caseItem.metrics && (
                      <>
                        <span>•</span>
                        <span>Тональность: {caseItem.metrics.sentiment_display}</span>
                      </>
                    )}
                    {caseItem.is_sla_breached && (
                      <>
                        <span>•</span>
                        <span className="text-red-600 font-medium">SLA нарушен</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            onClick={() => loadCases(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            variant="outline"
            size="sm"
          >
            Назад
          </Button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            onClick={() => loadCases(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            variant="outline"
            size="sm"
          >
            Далее
          </Button>
        </div>
      )}
    </div>
  );
}
