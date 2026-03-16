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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Desktop Navigation - Enhanced */}
        <nav className="hidden md:flex gap-2 mb-8 p-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              currentView === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
            }`}
          >
            🏠 Панель управления
          </button>
          <button
            onClick={() => handleNavigate('complaints')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              currentView === 'complaints' || currentView === 'details' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
            }`}
          >
            📋 Жалобы
          </button>
          <button
            onClick={() => handleNavigate('record')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              currentView === 'record' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
            }`}
          >
            ➕ Новая жалоба
          </button>
          <button
            onClick={() => handleNavigate('analytics')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              currentView === 'analytics' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/80'
            }`}
          >
            📊 Аналитика
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
