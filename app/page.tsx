'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { ComplaintsList } from '@/components/complaints-list';
import { ComplaintDetails } from '@/components/complaint-details';
import { Analytics } from '@/components/analytics';
import { RecordComplaint } from '@/components/record-complaint';
import { BottomNavigation } from '@/components/bottom-navigation';

type View = 'dashboard' | 'complaints' | 'details' | 'analytics' | 'record';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const handleSelectComplaint = (id: string) => {
    setSelectedComplaintId(id);
    setCurrentView('details');
  };

  const handleBackToList = () => {
    setCurrentView('complaints');
    setSelectedComplaintId(null);
  };

  const handleNavigate = (tab: 'dashboard' | 'complaints' | 'analytics' | 'record') => {
    setCurrentView(tab);
    setSelectedComplaintId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 mb-8 border-b border-border pb-4">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              currentView === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Панель управления
          </button>
          <button
            onClick={() => handleNavigate('complaints')}
            className={`px-4 py-2 font-medium transition-colors ${
              currentView === 'complaints' || currentView === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Жалобы
          </button>
          <button
            onClick={() => handleNavigate('record')}
            className={`px-4 py-2 font-medium transition-colors ${
              currentView === 'record' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Новая жалоба
          </button>
          <button
            onClick={() => handleNavigate('analytics')}
            className={`px-4 py-2 font-medium transition-colors ${
              currentView === 'analytics' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Аналитика
          </button>
        </nav>

        {/* Content */}
        {currentView === 'dashboard' && <Dashboard onShowAll={() => handleNavigate('complaints')} />}
        {currentView === 'complaints' && <ComplaintsList onSelectComplaint={handleSelectComplaint} />}
        {currentView === 'details' && selectedComplaintId && (
          <ComplaintDetails complaintId={selectedComplaintId} onBack={handleBackToList} />
        )}
        {currentView === 'record' && (
          <RecordComplaint
            onSubmitSuccess={(caseData) => {
              // Could navigate to the specific case details or just show success
              console.log('Complaint submitted:', caseData);
            }}
            onNavigateToComplaints={() => handleNavigate('complaints')}
          />
        )}
        {currentView === 'analytics' && <Analytics />}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        active={currentView === 'dashboard' ? 'dashboard' : currentView === 'analytics' ? 'analytics' : currentView === 'record' ? 'record' : 'complaints'}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
