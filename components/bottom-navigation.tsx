'use client';

interface BottomNavigationProps {
  active: 'dashboard' | 'complaints' | 'analytics';
  onNavigate: (tab: 'dashboard' | 'complaints' | 'analytics') => void;
}

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card md:hidden">
      <div className="flex">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            active === 'dashboard' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Панель
        </button>
        <button
          onClick={() => onNavigate('complaints')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            active === 'complaints' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Жалобы
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`flex-1 py-4 text-center font-medium transition-colors ${
            active === 'analytics' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-muted-foreground'
          }`}
        >
          Аналитика
        </button>
      </div>
    </nav>
  );
}
