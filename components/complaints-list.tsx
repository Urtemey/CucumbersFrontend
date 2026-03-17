'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { CaseResponse, CaseStatus, ComplaintPriority, CaseListResponse, PRIORITY_DISPLAY_NAMES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ComplaintsListProps {
  onSelectComplaint: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  [CaseStatus.NEW]:          'Новая',
  [CaseStatus.IN_REVIEW]:    'На рассмотрении',
  [CaseStatus.ASSIGNED]:     'Назначена',
  [CaseStatus.IN_PROGRESS]:  'В работе',
  [CaseStatus.PENDING_INFO]: 'Ожидает информации',
  [CaseStatus.RESOLVED]:     'Решена',
  [CaseStatus.CLOSED]:       'Закрыта',
  [CaseStatus.REJECTED]:     'Отклонена',
};

function getPriorityDot(priority: ComplaintPriority) {
  switch (priority) {
    case ComplaintPriority.URGENT: return 'bg-red-500';
    case ComplaintPriority.HIGH:   return 'bg-amber-500';
    case ComplaintPriority.NORMAL: return 'bg-blue-500';
    case ComplaintPriority.LOW:    return 'bg-slate-400';
    default:                       return 'bg-slate-300';
  }
}

function getStatusStyle(status: CaseStatus) {
  switch (status) {
    case CaseStatus.NEW:
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case CaseStatus.IN_REVIEW:
    case CaseStatus.ASSIGNED:
    case CaseStatus.IN_PROGRESS:
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case CaseStatus.RESOLVED:
    case CaseStatus.CLOSED:
      return 'text-green-700 bg-green-50 border-green-200';
    case CaseStatus.REJECTED:
      return 'text-red-700 bg-red-50 border-red-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

const STATUS_FILTERS = [
  { value: 'all',                      label: 'Все' },
  { value: CaseStatus.NEW,             label: 'Новые' },
  { value: CaseStatus.IN_PROGRESS,     label: 'В работе' },
  { value: CaseStatus.RESOLVED,        label: 'Решены' },
];

const PRIORITY_FILTERS = [
  { value: 'all',                        label: 'Все' },
  { value: ComplaintPriority.URGENT,     label: 'Критические' },
  { value: ComplaintPriority.HIGH,       label: 'Высокие' },
  { value: ComplaintPriority.NORMAL,     label: 'Средние' },
  { value: ComplaintPriority.LOW,        label: 'Низкие' },
];

export function ComplaintsList({ onSelectComplaint }: ComplaintsListProps) {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const loadCases = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: CaseListResponse = await apiClient.getCases(
        page,
        20,
        statusFilter === 'all' ? undefined : statusFilter,
        priorityFilter === 'all' ? undefined : priorityFilter,
        undefined,
        search || undefined
      );
      setCases(response.items);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.page_size));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки обращений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadCases(1);
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    setCurrentPage(1);
    loadCases(1, debouncedSearch);
  }, [debouncedSearch]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filteredCases = cases;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Обращения</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Управление и отслеживание</p>
        </div>
        <Button
          onClick={() => loadCases(currentPage, debouncedSearch)}
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

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Поиск по ID или тексту..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 min-w-0 h-9 px-3 text-sm border border-border rounded-md bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  statusFilter === f.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-md self-start">
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPriorityFilter(f.value)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                priorityFilter === f.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-4 h-4 skeleton rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 skeleton rounded" />
                  <div className="h-3 w-64 skeleton rounded" />
                </div>
                <div className="h-5 w-20 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              {cases.length === 0 ? 'Обращений пока нет' : 'Ничего не найдено'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {cases.length === 0
                ? 'После первого обращения оно появится здесь'
                : 'Попробуйте изменить фильтры или поисковый запрос'}
            </p>
            {cases.length === 0 && (
              <Button onClick={() => loadCases(1, debouncedSearch)} variant="outline" size="sm" className="mt-4">
                Обновить
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCases.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectComplaint(c.id)}
                className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-accent transition-colors text-left group"
              >
                {/* Priority indicator */}
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDot(c.priority)}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">
                      #{c.id.slice(0, 8)}
                    </span>
                    {c.is_sla_breached && (
                      <span className="text-[10px] font-medium text-red-600 border border-red-200 bg-red-50 px-1.5 py-0.5 rounded">
                        SLA
                      </span>
                    )}
                  </div>

                  {c.text_artifacts?.original && (
                    <p className="text-sm text-foreground line-clamp-1 leading-snug">
                      {c.text_artifacts.original}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{c.metrics?.category_display || 'Категория не определена'}</span>
                    <span>·</span>
                    <span>{PRIORITY_DISPLAY_NAMES[c.priority] || c.priority}</span>
                    {c.metrics?.sentiment_display && (
                      <>
                        <span>·</span>
                        <span>{c.metrics.sentiment_display}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded border mt-0.5 ${getStatusStyle(c.status)}`}>
                  {STATUS_LABELS[c.status] || c.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => loadCases(currentPage - 1, debouncedSearch)}
              disabled={currentPage <= 1 || loading}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => loadCases(currentPage + 1, debouncedSearch)}
              disabled={currentPage >= totalPages || loading}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
