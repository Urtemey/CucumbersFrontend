'use client';

import { useState } from 'react';
import { mockComplaints } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { ComplaintStatus, ComplaintPriority } from '@/lib/types';

interface ComplaintDetailsProps {
  complaintId: string;
  onBack: () => void;
}

export function ComplaintDetails({ complaintId, onBack }: ComplaintDetailsProps) {
  const complaint = mockComplaints.find(c => c.id === complaintId);
  const [adminResponse, setAdminResponse] = useState(complaint?.adminResponse || '');
  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status || 'new');
  const [priority, setPriority] = useState<ComplaintPriority>(complaint?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(complaint?.assignedTo || '');

  if (!complaint) {
    return <div>Жалоба не найдена</div>;
  }

  const admins = ['Иван Петров', 'Мария Иванова', 'Алексей Сидоров', 'Ольга Кузнецова', 'Елена Волкова', 'Петр Ромов'];

  const getSentimentLabel = (sentiment: typeof complaint.sentiment) => {
    switch (sentiment) {
      case 'negative':
        return 'Очень негативная';
      case 'neutral':
        return 'Нейтральная';
      case 'positive':
        return 'Позитивная';
    }
  };

  const getSentimentIcon = (sentiment: typeof complaint.sentiment) => {
    switch (sentiment) {
      case 'negative':
        return '😞';
      case 'neutral':
        return '😐';
      case 'positive':
        return '😊';
    }
  };

  const getPriorityLabel = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'critical':
        return 'Критичный';
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg font-medium transition-colors hover:bg-muted"
          style={{ backgroundColor: '#F5F7FA', color: '#4A90E2' }}
        >
          ← Вернуться к списку
        </button>
        <h1 className="text-balance text-2xl font-bold">{complaint.id}</h1>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-4">
          {/* Title and Description */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{complaint.title}</h2>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Анализ тональности</h3>
            
            {/* Sentiment Icon and Label */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{getSentimentIcon(complaint.sentiment)}</span>
              <span className="text-lg font-semibold px-4 py-2 rounded" style={{ 
                backgroundColor: complaint.sentiment === 'negative' ? '#FFE5E5' : 
                                complaint.sentiment === 'positive' ? '#E5F5E5' : '#F0F0F0',
                color: complaint.sentiment === 'negative' ? '#E74C3C' : 
                       complaint.sentiment === 'positive' ? '#50C878' : '#666666'
              }}>
                {getSentimentLabel(complaint.sentiment)}
              </span>
            </div>

            {/* Visual Sentiment Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-medium">
                <span>😞 Негативное</span>
                <span style={{ color: '#666666' }}>Нейтральное</span>
                <span>😊 Позитивное</span>
              </div>
              
              {/* Sentiment Bar */}
              <div className="w-full h-3 rounded-full flex overflow-hidden" style={{ backgroundColor: '#E0E0E0' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: '33%',
                    backgroundColor: '#E74C3C',
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: '34%',
                    backgroundColor: '#F0F0F0',
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: '33%',
                    backgroundColor: '#50C878',
                  }}
                />
              </div>

              {/* Indicator Position */}
              <div className="flex items-center justify-center mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all"
                  style={{
                    backgroundColor: complaint.sentiment === 'negative' ? '#E74C3C' : 
                                    complaint.sentiment === 'positive' ? '#50C878' : '#999999',
                    marginLeft: `${complaint.sentimentScore / 3}%`,
                  }}
                >
                  ●
                </div>
              </div>

              <p className="text-center text-sm font-medium">
                {complaint.sentiment === 'negative' ? '🔴' : complaint.sentiment === 'positive' ? '🟢' : '⚪'} 
                {' '}{complaint.sentimentScore}% уверенности
              </p>

              {/* Keywords */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium mb-2">Ключевые слова:</p>
                <div className="flex flex-wrap gap-2">
                  {complaint.sentiment === 'negative' && (
                    <>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#FFE5E5', color: '#E74C3C' }}>невнимательность</span>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#FFE5E5', color: '#E74C3C' }}>быстро</span>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#FFE5E5', color: '#E74C3C' }}>не ответил</span>
                    </>
                  )}
                  {complaint.sentiment === 'positive' && (
                    <>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#E5F5E5', color: '#50C878' }}>внимательно</span>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#E5F5E5', color: '#50C878' }}>вежлив</span>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#E5F5E5', color: '#50C878' }}>компетентно</span>
                    </>
                  )}
                  {complaint.sentiment === 'neutral' && (
                    <>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#F5F5F5', color: '#666666' }}>стандартно</span>
                      <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#F5F5F5', color: '#666666' }}>обычно</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Status and Priority Management */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Статус жалобы</h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#4A90E2' } as any}
              >
                <option value="new">Новая</option>
                <option value="in_progress">На рассмотрении</option>
                <option value="resolved">Решена</option>
              </select>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Приоритет</h3>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#4A90E2' } as any}
              >
                <option value="critical">🔴 Критичный</option>
                <option value="high">🟠 Высокий</option>
                <option value="medium">🟡 Средний</option>
                <option value="low">🟢 Низкий</option>
              </select>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Ответ администратора</h3>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value.slice(0, 500))}
              placeholder="Введите ответ на жалобу..."
              className="w-full px-4 py-3 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 resize-none h-28"
              style={{ '--tw-ring-color': '#4A90E2' } as any}
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">{adminResponse.length}/500 символов</p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: '#FFA500' }}
                >
                  Отправить ответ
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
                  style={{ backgroundColor: '#50C878' }}
                >
                  Отправить и закрыть
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">История действий</h3>
            <div className="space-y-4">
              {complaint.actionHistory.map((action, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: '#4A90E2' }}
                    />
                    {index < complaint.actionHistory.length - 1 && (
                      <div className="w-0.5 h-12 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.timestamp}
                      {action.actor && ` • ${action.actor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-4">Информация</h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-2">Номер жалобы</p>
                <p className="font-mono font-medium">{complaint.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Категория</p>
                <p className="font-medium">{complaint.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Приоритет</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPriorityColor(priority) }}
                  />
                  <p className="font-medium">{getPriorityLabel(priority)}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Дата создания</p>
                <p className="font-medium">{complaint.createdAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Локация робота</p>
                <p className="font-medium text-xs">{complaint.robotLocation}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-sm mb-3">Назначить ответственного</h4>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#4A90E2' } as any}
            >
              <option value="">Выбрать администратора...</option>
              {admins.map(admin => (
                <option key={admin} value={admin}>{admin}</option>
              ))}
            </select>
            {assignedTo && (
              <p className="text-xs text-muted-foreground mt-3">
                ✓ Назначено: <span className="font-medium">{assignedTo}</span>
              </p>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-4" style={{ backgroundColor: '#F5F7FA' }}>
            <h4 className="font-semibold text-sm mb-3">Быстрая статистика</h4>
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground">Время получения: <span className="font-medium">14 ноября, 14:32</span></p>
              <p className="text-muted-foreground">Дней в работе: <span className="font-medium">1.5</span></p>
              <p className="text-muted-foreground">Статус: <span className="font-medium capitalize" style={{ color: '#FFA500' }}>на рассмотрении</span></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
