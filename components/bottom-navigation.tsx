'use client';

import { Home, List, Mic, BarChart3 } from 'lucide-react';

interface BottomNavigationProps {
  active: 'dashboard' | 'complaints' | 'analytics' | 'record';
  onNavigate: (tab: 'dashboard' | 'complaints' | 'analytics' | 'record') => void;
}

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Панель', icon: Home },
    { id: 'complaints' as const, label: 'Жалобы', icon: List },
    { id: 'record' as const, label: 'Запись', icon: Mic },
    { id: 'analytics' as const, label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 md:hidden safe-area-pb">
      <div className="grid grid-cols-4 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          
          return (
        <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative py-3 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-full" />
              )}
              
              {/* Icon container */}
              <span className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-100 scale-110' 
                  : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 ${
                  isActive ? 'animate-bounce-subtle' : ''
                }`} />
              </span>
              
              {/* Label */}
              <span className={`text-[10px] font-medium transition-all duration-300 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
        </button>
          );
        })}
      </div>
    </nav>
  );
}
