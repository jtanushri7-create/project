import React from 'react';
import { ShieldAlert, Clock, PhoneOutgoing, Users, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { triggerHaptic } from '../utils/audio';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isJourneyActive: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  isJourneyActive,
}) => {
  const tabs = [
    { id: 'sos' as ActiveTab, label: 'SOS Alert', icon: ShieldAlert, badge: null, accentColor: 'text-red-400' },
    { id: 'checkin' as ActiveTab, label: 'Check-In', icon: Clock, badge: isJourneyActive ? 'ON' : null, accentColor: 'text-teal-400' },
    { id: 'fakecall' as ActiveTab, label: 'Fake Call', icon: PhoneOutgoing, badge: null, accentColor: 'text-purple-400' },
    { id: 'contacts' as ActiveTab, label: 'Circle', icon: Users, badge: null, accentColor: 'text-purple-400' },
    { id: 'tools' as ActiveTab, label: 'Toolkit', icon: Sparkles, badge: null, accentColor: 'text-teal-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic([30]);
                onSelectTab(tab.id);
              }}
              className="relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-all group cursor-pointer focus:outline-none"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    isActive ? `${tab.accentColor} scale-110` : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-teal-400 text-slate-900 text-[8px] font-black rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
              {isActive && <span className="absolute bottom-1 w-4 h-0.5 rounded-full bg-teal-400" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Also export default so it works either way!
export default Navigation;