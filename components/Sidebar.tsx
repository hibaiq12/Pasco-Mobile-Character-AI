
import React from 'react';
import { Users, Settings, Sparkles, History, Hexagon } from 'lucide-react';
import { ViewState } from '../types';
import { t } from '../services/translationService';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isMobileHeader?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isMobileHeader = false }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, icon: <Users size={22} />, label: t('nav.hub') },
    { id: ViewState.FORGE, icon: <Sparkles size={22} />, label: t('nav.forge') },
    { id: ViewState.HISTORY, icon: <History size={22} />, label: t('nav.history') },
    { id: ViewState.SETTINGS, icon: <Settings size={22} />, label: t('nav.system') },
  ];

  return (
    <>
      {/* Desktop Sidebar - Minimalist & Modern */}
      <div className="hidden md:flex flex-col w-[88px] h-full border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl z-50 items-center py-10 flex-shrink-0">
        
        {/* Logo Area */}
        <div className="mb-16 group cursor-pointer" onClick={() => onChangeView(ViewState.DASHBOARD)}>
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-500 relative overflow-hidden">
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Hexagon className="text-white fill-white/20" size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-6 w-full px-4">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`
                  group relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-100' 
                    : 'text-zinc-500 hover:text-white hover:bg-white/10 hover:scale-105'
                  }
                `}
                title={item.label}
              >
                {item.icon}
                
                {/* Active Indicator Dot */}
                {isActive && (
                   <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full hidden xl:block"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Version / Brand Vertical Text */}
        <div className="flex flex-col items-center justify-end pb-8 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-zinc-500 to-transparent mb-4"></div>
            <span className="text-[10px] font-mono text-zinc-500 writing-vertical-lr tracking-widest uppercase">
                v0.8.2.5
            </span>
        </div>
      </div>

      {/* Mobile Floating Dock (Dynamic Position with Slide Animation) */}
      {currentView !== ViewState.CHAT && currentView !== ViewState.FORGE && (
        <div 
            className={`
                md:hidden fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] 
                backdrop-blur-xl rounded-[2rem] z-50 flex justify-between items-center px-6 ring-1 ring-white/5
                transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
                ${isMobileHeader 
                    ? 'top-4 h-[60px] bg-zinc-900/90 border-violet-500/30 shadow-[0_5px_30px_-5px_rgba(124,58,237,0.3)]' 
                    : 'top-[calc(100dvh-90px)] h-[70px] bg-black/80 border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'
                }
            `}
        >
          {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChangeView(item.id)}
                  className={`
                    relative flex flex-col items-center justify-center gap-1 transition-all duration-300
                    ${isActive ? 'text-violet-400 -translate-y-1' : 'text-zinc-500 hover:text-zinc-300'}
                  `}
                >
                  <div className={`
                     p-2 rounded-2xl transition-all duration-300
                     ${isActive ? 'bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] scale-110 ring-1 ring-violet-500/30' : 'bg-transparent'}
                  `}>
                      {React.cloneElement(item.icon as any, { size: isMobileHeader ? 20 : 22 })}
                  </div>
                  
                  {isActive && !isMobileHeader && (
                      <span className="absolute -bottom-4 text-[9px] font-bold tracking-wider uppercase text-white animate-fade-in opacity-80">
                          {item.label}
                      </span>
                  )}
                  
                  {/* Active Dot for non-active items hover effect */}
                  {!isActive && <div className="w-1 h-1 bg-zinc-700 rounded-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                </button>
              );
          })}
        </div>
      )}
    </>
  );
};
