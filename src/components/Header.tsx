import React from 'react';
import { ShieldCheck, EyeOff, PhoneCall, Share2 } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

interface HeaderProps {
  onToggleDisguise: () => void;
  gpsActive: boolean;
  onOpenHelpline: () => void;
  onOpenShareApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleDisguise,
  gpsActive,
  onOpenHelpline,
  onOpenShareApp,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 text-white">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-teal-400 flex items-center justify-center shadow-sm shadow-purple-900/40">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Security4Her
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${gpsActive ? 'bg-teal-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{gpsActive ? 'GPS Protected' : 'Standby'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic([40]);
              onOpenShareApp();
            }}
            title="Share App With Friends"
            aria-label="Share App With Friends"
            className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 active:scale-95 text-xs font-semibold text-purple-200 flex items-center gap-1.5 transition-all border border-purple-500/40"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-xs">Share</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic([50]);
              onOpenHelpline();
            }}
            title="Helplines & Police"
            aria-label="Helplines & Police"
            className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-all border border-slate-700/60"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">911</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic([40]);
              onToggleDisguise();
            }}
            title="Discreet Disguise Mode (Calculator)"
            aria-label="Discreet Disguise Mode"
            className="min-h-[40px] min-w-[40px] rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all border border-slate-700/60"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};