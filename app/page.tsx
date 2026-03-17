'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Dashboard } from '@/components/dashboard';
import { ComplaintsList } from '@/components/complaints-list';
import { ComplaintDetails } from '@/components/complaint-details';
import { Analytics } from '@/components/analytics';
import { RecordComplaint } from '@/components/record-complaint';
import { BottomNavigation } from '@/components/bottom-navigation';
import { LayoutDashboard, FileText, Plus, BarChart2, Sun, Moon } from 'lucide-react';

type View = 'dashboard' | 'complaints' | 'details' | 'analytics' | 'record';

const navItems = [
  { id: 'dashboard' as const, label: 'Обзор',           icon: LayoutDashboard },
  { id: 'complaints' as const, label: 'Обращения',       icon: FileText },
  { id: 'record'     as const, label: 'Новое обращение', icon: Plus },
  { id: 'analytics'  as const, label: 'Аналитика',       icon: BarChart2 },
];

export default function Home() {
  const { theme, setTheme } = useTheme();
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

  const activeNav = currentView === 'details' ? 'complaints' : currentView;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 flex-col fixed inset-y-0 left-0 border-r border-border bg-card z-20">
        <div className="px-5 py-[18px] border-b border-border">
          <p className="text-sm font-semibold text-foreground tracking-tight">Обращения</p>
          <p className="text-xs text-muted-foreground mt-0.5">Система управления</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot-online" />
              <span className="text-xs text-muted-foreground">Система активна</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pl-56 min-w-0">
        <div className="max-w-5xl mx-auto px-5 py-8 pb-24 md:pb-10">
          {currentView === 'dashboard' && (
            <Dashboard onShowAll={() => handleNavigate('complaints')} />
          )}
          {currentView === 'complaints' && (
            <ComplaintsList onSelectComplaint={handleSelectComplaint} />
          )}
          {currentView === 'details' && selectedComplaintId && (
            <ComplaintDetails complaintId={selectedComplaintId} onBack={handleBackToList} />
          )}
          {currentView === 'record' && (
            <RecordComplaint
              onSubmitSuccess={() => {
                handleNavigate('complaints');
              }}
              onNavigateToComplaints={() => handleNavigate('complaints')}
            />
          )}
          {currentView === 'analytics' && <Analytics />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation active={activeNav} onNavigate={handleNavigate} />
    </div>
  );
}
