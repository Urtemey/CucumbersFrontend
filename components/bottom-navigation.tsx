'use client';

import { Home, List, Mic, BarChart2 } from 'lucide-react';

interface BottomNavigationProps {
  active: 'dashboard' | 'complaints' | 'analytics' | 'record';
  onNavigate: (tab: 'dashboard' | 'complaints' | 'analytics' | 'record') => void;
}

const navItems = [
  { id: 'dashboard'  as const, label: 'Обзор',     icon: Home },
  { id: 'complaints' as const, label: 'Обращения', icon: List },
  { id: 'record'     as const, label: 'Запись',    icon: Mic },
  { id: 'analytics'  as const, label: 'Аналитика', icon: BarChart2 },
];

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-foreground rounded-b-full" />
              )}
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
