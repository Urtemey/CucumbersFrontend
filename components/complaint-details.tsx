'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CaseResponse,
  CaseStatus,
  ComplaintPriority,
  SentimentLevel,
  UrgencyLevel,
  ComplaintCategory,
  PRIORITY_DISPLAY_NAMES
} from '@/lib/types';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Send,
  User,
  Download
} from 'lucide-react';

interface ComplaintDetailsProps {
  complaintId: string;
  onBack: () => void;
}

export function ComplaintDetails({ complaintId, onBack }: ComplaintDetailsProps) {
  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority | ''>('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    loadCaseDetails();
  }, [complaintId]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCase(complaintId);
      setCaseData(data);
      setSelectedStatus(data.status);
      setSelectedPriority(data.priority);
      setAssignedTo(data.assigned_to || 'none');
    } catch (err) {
      console.error('Error loading case details:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки кейса');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCase = async () => {
    if (!caseData) return;

    try {
      setUpdating(true);
      const updates: any = {};

      if (selectedStatus && selectedStatus !== caseData.status) {
        updates.status = selectedStatus;
      }

      if (selectedPriority && selectedPriority !== caseData.priority) {
        updates.priority = selectedPriority;
      }

      if (assignedTo !== (caseData.assigned_to || 'none')) {
        updates.assigned_to = assignedTo === 'none' ? undefined : assignedTo;
      }

      if (Object.keys(updates).length > 0) {
        const updatedCase = await apiClient.updateCase(caseData.id, updates);
        setCaseData(updatedCase);
      }
    } catch (err) {
      console.error('Error updating case:', err);
      setError(err instanceof Error ? err.message : 'Ошибка обновления кейса');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!caseData || !newMessage.trim()) return;

    // Note: This would need to be implemented in the API client
    // For now, just clear the message
    setNewMessage('');
  };

  const handleResolveCase = async () => {
    if (!caseData) return;

    try {
      setUpdating(true);
      await apiClient.resolveCase(caseData.id);
      await loadCaseDetails(); // Reload to get updated status
    } catch (err) {
      console.error('Error resolving case:', err);
      setError(err instanceof Error ? err.message : 'Ошибка закрытия кейса');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Загрузка деталей кейса...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к списку
          </Button>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Кейс не найден'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: SentimentLevel) => {
    switch (sentiment) {
      case SentimentLevel.VERY_NEGATIVE:
      case SentimentLevel.NEGATIVE:
        return '😞';
      case SentimentLevel.NEUTRAL:
        return '😐';
      case SentimentLevel.POSITIVE:
        return '😊';
    }
  };

  const getSentimentColor = (sentiment: SentimentLevel) => {
    switch (sentiment) {
      case SentimentLevel.VERY_NEGATIVE:
      case SentimentLevel.NEGATIVE:
        return '#E74C3C';
      case SentimentLevel.NEUTRAL:
        return '#666666';
      case SentimentLevel.POSITIVE:
        return '#50C878';
    }
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.CRITICAL:
        return '#E74C3C';
      case UrgencyLevel.HIGH:
        return '#FFA500';
      case UrgencyLevel.MEDIUM:
        return '#FFC107';
      case UrgencyLevel.LOW:
        return '#50C878';
    }
  };

  const getStatusBadgeColor = (status: CaseStatus) => {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к списку
          </Button>
          <h1 className="text-balance text-2xl font-bold">Кейс #{caseData.id}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusBadgeColor(caseData.status)}>
            {getStatusLabel(caseData.status)}
          </Badge>
          {caseData.is_sla_breached && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              SLA нарушен
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-4">
          {/* Original Complaint Text */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Текст жалобы</h2>
            {caseData.text_artifacts?.original ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Оригинальный текст:</h3>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {caseData.text_artifacts.original}
                  </p>
                </div>
                {caseData.text_artifacts.neutral && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Нейтральная версия:</h3>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed italic">
                      {caseData.text_artifacts.neutral}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Текст жалобы недоступен</p>
            )}
          </Card>

          {/* Original Audio */}
          {caseData.audio_file_path && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Оригинальная аудиозапись
              </h2>
              <div className="space-y-4">
                <audio
                  controls
                  className="w-full"
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/uploads/${caseData.audio_file_path}`}
                >
                  Ваш браузер не поддерживает аудио элемент.
                </audio>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/uploads/${caseData.audio_file_path}`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Скачать аудиофайл
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* AI Analysis */}
          {caseData.metrics && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Анализ ИИ
              </h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Sentiment Analysis */}
                <div>
                  <h4 className="font-medium mb-3">Тональность</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getSentimentIcon(caseData.metrics.sentiment)}</span>
                    <span className="font-medium" style={{ color: getSentimentColor(caseData.metrics.sentiment) }}>
                      {caseData.metrics.sentiment_display}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Токсичность: {(caseData.metrics.toxicity_score * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Category & Urgency */}
                <div>
                  <h4 className="font-medium mb-3">Категория и срочность</h4>
                  <div className="space-y-2">
                    <p><strong>Категория:</strong> {caseData.metrics.category_display}</p>
                    <p>
                      <strong>Срочность:</strong>{' '}
                      <span style={{ color: getUrgencyColor(caseData.metrics.urgency) }}>
                        {caseData.metrics.urgency_display}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Достоверность: {(caseData.metrics.credibility_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {caseData.metrics.keywords && caseData.metrics.keywords.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Ключевые слова:</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.metrics.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {(caseData.metrics.mentioned_persons?.length > 0 ||
                caseData.metrics.mentioned_locations?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Распознанные сущности:</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {caseData.metrics.mentioned_persons && caseData.metrics.mentioned_persons.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Люди:</p>
                        <div className="flex flex-wrap gap-1">
                          {caseData.metrics.mentioned_persons.map((person, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {person}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {caseData.metrics.mentioned_locations && caseData.metrics.mentioned_locations.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Локации:</p>
                        <div className="flex flex-wrap gap-1">
                          {caseData.metrics.mentioned_locations.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Messages */}
          {caseData.messages && caseData.messages.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Сообщения ({caseData.messages.length})
              </h3>
              <div className="space-y-4">
                {caseData.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {message.is_from_reporter ? (
                        <User className="w-8 h-8 p-1 bg-blue-100 rounded-full text-blue-600" />
                      ) : (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.is_from_reporter ? 'Репортер' : 'Оператор'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Send Message */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Отправить сообщение</h3>
            <div className="space-y-4">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение репортеру..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить
                </Button>
              </div>
            </div>
          </Card>

          {/* Case Management */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Управление кейсом</h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as CaseStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CaseStatus.NEW}>Новая</SelectItem>
                      <SelectItem value={CaseStatus.IN_REVIEW}>На рассмотрении</SelectItem>
                      <SelectItem value={CaseStatus.ASSIGNED}>Назначена</SelectItem>
                      <SelectItem value={CaseStatus.IN_PROGRESS}>В работе</SelectItem>
                      <SelectItem value={CaseStatus.RESOLVED}>Решена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Приоритет</label>
                  <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as ComplaintPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ComplaintPriority.LOW}>{PRIORITY_DISPLAY_NAMES[ComplaintPriority.LOW]}</SelectItem>
                      <SelectItem value={ComplaintPriority.NORMAL}>{PRIORITY_DISPLAY_NAMES[ComplaintPriority.NORMAL]}</SelectItem>
                      <SelectItem value={ComplaintPriority.HIGH}>{PRIORITY_DISPLAY_NAMES[ComplaintPriority.HIGH]}</SelectItem>
                      <SelectItem value={ComplaintPriority.URGENT}>{PRIORITY_DISPLAY_NAMES[ComplaintPriority.URGENT]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Назначить исполнителя</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выбрать исполнителя..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не назначен</SelectItem>
                    <SelectItem value="Иван Петров">Иван Петров</SelectItem>
                    <SelectItem value="Мария Иванова">Мария Иванова</SelectItem>
                    <SelectItem value="Алексей Сидоров">Алексей Сидоров</SelectItem>
                    <SelectItem value="Ольга Кузнецова">Ольга Кузнецова</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleUpdateCase}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Обновление...
                    </>
                  ) : (
                    'Обновить кейс'
                  )}
                </Button>

                {caseData.status !== CaseStatus.RESOLVED && caseData.status !== CaseStatus.CLOSED && (
                  <Button
                    onClick={handleResolveCase}
                    disabled={updating}
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Закрыть кейс
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-4">Информация о кейсе</h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">ID кейса</p>
                <p className="font-mono font-medium">{caseData.id}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Канал поступления</p>
                <p className="font-medium capitalize">{caseData.intake_channel.replace('_', ' ')}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Приоритет</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getUrgencyColor(caseData.metrics?.urgency || UrgencyLevel.MEDIUM) }}
                  />
                  <p className="font-medium">{getPriorityLabel(caseData.priority)}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Дата создания</p>
                <p className="font-medium">{formatDateTime(caseData.created_at)}</p>
              </div>

              {caseData.sla_deadline && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    SLA дедлайн
                  </p>
                  <p className={`font-medium ${caseData.is_sla_breached ? 'text-red-600' : ''}`}>
                    {formatDateTime(caseData.sla_deadline)}
                  </p>
                  {caseData.sla_remaining_hours && (
                    <p className="text-xs text-muted-foreground">
                      Осталось: {caseData.sla_remaining_hours.toFixed(1)} ч
                    </p>
                  )}
                </div>
              )}

              {assignedTo && assignedTo !== 'none' && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Исполнитель</p>
                  <p className="font-medium">{assignedTo}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-sm mb-3">Статистика обработки</h4>
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">
                Статус: <span className="font-medium">{getStatusLabel(caseData.status)}</span>
              </p>
              {caseData.metrics && (
                <>
                  <p className="text-muted-foreground">
                    Тональность: <span className="font-medium">{caseData.metrics.sentiment_display}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Категория: <span className="font-medium">{caseData.metrics.category_display}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Ключевых слов: <span className="font-medium">{caseData.metrics.keywords?.length || 0}</span>
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* PIN Code */}
          {caseData.reporter_pin && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
                PIN-код репортера
              </h4>
              <p className="font-mono text-lg font-bold text-yellow-800">
                {caseData.reporter_pin}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Репортер может использовать этот PIN для отслеживания кейса
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
