'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Square, Play, Pause, Upload, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  ComplaintPriority,
  ComplaintCategory,
  IntakeChannel,
  ProcessingResult,
  PRIORITY_DISPLAY_NAMES,
  CATEGORY_DISPLAY_NAMES
} from '@/lib/types';
import { apiClient } from '@/lib/api-client';

interface RecordComplaintProps {
  onSubmitSuccess?: (caseData: ProcessingResult) => void;
  onNavigateToComplaints?: () => void;
}

export function RecordComplaint({ onSubmitSuccess, onNavigateToComplaints }: RecordComplaintProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as ComplaintCategory | '',
    priority: ComplaintPriority.NORMAL,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<ProcessingResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Не удалось начать запись. Проверьте разрешения на доступ к микрофону.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      setRecordingTime(0);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let result: ProcessingResult;

      if (audioBlob) {
        // Convert Blob to File
        const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
        // Submit audio complaint
        result = await apiClient.submitAudioComplaint(audioFile, IntakeChannel.MOBILE_APP);
      } else {
        // Submit text complaint
        const text = formData.description || formData.title;
        const categoryHint = formData.category || undefined;

        result = await apiClient.submitTextComplaint(
          text,
          IntakeChannel.WEB_FORM,
          categoryHint
        );
      }

      setSubmitResult(result);

      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '' as '',
      priority: ComplaintPriority.NORMAL,
    });
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitError(error instanceof Error ? error.message : 'Произошла ошибка при отправке');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canSubmit = (formData.title.trim() || formData.description.trim() || audioBlob) && !isSubmitting;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Записать жалобу
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Recording Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Аудиозапись</Label>

            <div className="flex items-center justify-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600"
                  size="lg"
                >
                  <Mic className="w-5 h-5" />
                  <span>Начать запись</span>
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600"
                  size="lg"
                >
                  <Square className="w-5 h-5" />
                  <span>Остановить ({formatTime(recordingTime)})</span>
                </Button>
              )}
            </div>

            {/* File Upload Alternative */}
            <div className="text-center">
              <Label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700">
                  <Upload className="w-4 h-4" />
                  <span>Или загрузить аудиофайл</span>
                </div>
                <Input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Label>
            </div>

            {/* Audio Playback */}
            {audioUrl && (
              <div className="space-y-2">
                <Label>Прослушать запись:</Label>
                <div className="flex items-center space-x-2">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <Button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    variant="outline"
                    size="sm"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {recordingTime > 0 ? formatTime(recordingTime) : 'Аудиофайл загружен'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Заголовок жалобы *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Кратко опишите проблему"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, category: value as ComplaintCategory | '' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ComplaintCategory).map(category => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_DISPLAY_NAMES[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Приоритет</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: ComplaintPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="mt-1">
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

            <div>
              <Label htmlFor="description">Описание (необязательно, если есть аудиозапись)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Подробно опишите вашу жалобу или вопрос"
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Отправить жалобу</span>
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {submitError && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {submitResult && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Жалоба успешно отправлена!</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Номер кейса:</strong> {submitResult.case.id}</p>
                    {submitResult.case.reporter_pin && (
                      <p><strong>PIN-код:</strong> {submitResult.case.reporter_pin}</p>
                    )}
                    <p><strong>Статус:</strong> {submitResult.case.status_display || submitResult.case.status}</p>
                    <p><strong>Время обработки:</strong> {submitResult.processing_time.toFixed(2)}s</p>
                    {submitResult.case.metrics && (
                      <div className="mt-2">
                        <p><strong>Категория:</strong> {submitResult.case.metrics.category_display || submitResult.case.metrics.category}</p>
                        <p><strong>Тональность:</strong> {submitResult.case.metrics.sentiment_display || submitResult.case.metrics.sentiment}</p>
                        <p><strong>Срочность:</strong> {submitResult.case.metrics.urgency_display || submitResult.case.metrics.urgency}</p>
                      </div>
                    )}
                  </div>
                  {onNavigateToComplaints && (
                    <Button
                      onClick={onNavigateToComplaints}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Посмотреть все жалобы
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <h4 className="font-semibold mb-2">Информация:</h4>
            <ul className="space-y-1">
              <li>• Вы можете записать аудио или загрузить существующий файл</li>
              <li>• Обязательно заполните заголовок</li>
              <li>• Добавьте описание или используйте только аудиозапись</li>
              <li>• Ваша жалоба будет обработана ИИ для автоматической категоризации</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
