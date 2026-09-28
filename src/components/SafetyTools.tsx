import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  ExternalLink 
} from 'lucide-react';
import { startEmergencySiren, stopEmergencySiren, playWhistleBurst, triggerHaptic } from '../utils/audio';

export const SafetyTools: React.FC = () => {
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);

  const toggleSiren = () => {
    triggerHaptic([60]);
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  const handleWhistle = () => {
    triggerHaptic([100]);
    playWhistleBurst();
  };

  const helplines = [
    { country: 'United States & Canada', name: 'Emergency Police / Medical', number: '911' },
    { country: 'European Union & Global', name: 'Universal Emergency', number: '112' },
    { country: 'United Kingdom', name: 'Emergency', number: '999' },
    { country: 'India', name: 'Women Helpline', number: '1091' },
    { country: 'India', name: 'National Emergency', number: '112' },
    { country: 'Australia', name: 'Emergency', number: '000' },
  ];

  return (
    <div className={`space-y-4 pb-8 animate-in fade-in ${isStrobeActive ? 'animate-emergency-strobe' : ''}`}>
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Emergency Toolkit</h2>
            <p className="text-xs text-slate-400">Audio deterrents, visual beacons &amp; global helplines</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Acoustic &amp; Visual Deterrents</h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={toggleSiren}
            className={`min-h-[52px] rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSirenActive
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-rose-300 hover:bg-slate-700'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'Stop Siren' : '105dB Siren Alarm'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhistle}
            className="min-h-[52px] rounded-2xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>High-Pitch Whistle</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic([40]);
            setIsStrobeActive(!isStrobeActive);
          }}
          className={`min-h-[46px] w-full rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            isStrobeActive
              ? 'bg-amber-500 border-amber-300 text-black font-black'
              : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
          }`}
        >
          <span>{isStrobeActive ? 'Disable Screen Strobe' : 'Activate Strobe Screen Beacon'}</span>
        </button>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Official Helplines</h3>

        <div className="space-y-2">
          {helplines.map((item) => (
            <div
              key={item.number + item.country}
              className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-white">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.country}</p>
              </div>

              <a
                href={`tel:${item.number}`}
                onClick={() => triggerHaptic([50])}
                className="min-h-[38px] px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-950/40"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{item.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
