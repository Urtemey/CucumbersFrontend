'use client';

interface BottomNavigationProps {
  active: 'dashboard' | 'complaints' | 'analytics' | 'record';
  onNavigate: (tab: 'dashboard' | 'complaints' | 'analytics' | 'record') => void;
}

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden">
      <div className="grid grid-cols-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`py-3 text-center font-medium transition-colors text-xs ${
            active === 'dashboard' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Панель
        </button>
        <button
          onClick={() => onNavigate('complaints')}
          className={`py-3 text-center font-medium transition-colors text-xs ${
            active === 'complaints' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Жалобы
        </button>
        <button
          onClick={() => onNavigate('record')}
          className={`py-3 text-center font-medium transition-colors text-xs ${
            active === 'record' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Запись
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`py-3 text-center font-medium transition-colors text-xs ${
            active === 'analytics' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Аналитика
        </button>
      </div>
    </nav>
  );
}
