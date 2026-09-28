import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneOutgoing, 
  Clock, 
  Users, 
  Navigation, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  Share2
} from 'lucide-react';
import type { LocationDetails, EmergencyContact, JourneySession } from '../types';
import { triggerHaptic } from '../utils/audio';

interface SosSectionProps {
  onTriggerSos: () => void;
  onTriggerFakeCall: () => void;
  onOpenCheckIn: () => void;
  onOpenContacts: () => void;
  onOpenShareApp: () => void;
  location: LocationDetails | null;
  isLoadingLocation: boolean;
  contacts: EmergencyContact[];
  activeJourney: JourneySession | null;
  fakeCallCountdown: number | null;
}

export const SosSection: React.FC<SosSectionProps> = ({
  onTriggerSos,
  onTriggerFakeCall,
  onOpenCheckIn,
  onOpenContacts,
  onOpenShareApp,
  location,
  isLoadingLocation,
  contacts,
  activeJourney,
  fakeCallCountdown,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Active Fake Call Countdown Banner */}
      {fakeCallCountdown !== null && (
        <div className="bg-purple-900/80 border border-purple-500 rounded-2xl p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <PhoneOutgoing className="w-5 h-5 text-purple-300 animate-bounce" />
            <div>
              <p className="text-xs font-bold text-white">Fake Call Incoming in {fakeCallCountdown}s</p>
              <p className="text-[11px] text-purple-200">Prepare to hold phone to your ear</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-700 text-white">
            00:0{fakeCallCountdown}
          </span>
        </div>
      )}

      {/* Active Journey Check-In Indicator */}
      {activeJourney?.isRunning && (
        <div 
          onClick={onOpenCheckIn}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onOpenCheckIn(); }}
          className="bg-teal-950/60 border border-teal-500/40 hover:border-teal-400 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-teal-300 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-200">Journey Sentinel Active</p>
              <p className="text-[11px] text-slate-300 truncate max-w-[200px]">
                Heading to: {activeJourney.destination}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-teal-400 bg-teal-900/50 px-2 py-1 rounded-lg">
            {Math.floor(activeJourney.remainingSeconds / 60)}:
            {(activeJourney.remainingSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Central Tactile SOS Beacon */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-6">
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Aura */}
          <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-red-600/15 animate-ping opacity-60" />
          <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-red-600/25 to-rose-500/20 animate-sos-pulse" />

          {/* Primary SOS Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic([150, 80, 150]);
              onTriggerSos();
            }}
            aria-label="Activate Emergency SOS Distress Alert"
            className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-red-500 via-rose-600 to-red-700 text-white font-black shadow-2xl shadow-red-950/80 flex flex-col items-center justify-center border-4 border-red-300/40 active:scale-95 active:brightness-110 transition-all cursor-pointer group"
          >
            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
            <span className="text-2xl sm:text-3xl font-black tracking-widest mt-1 drop-shadow">
              SOS
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-red-100 uppercase tracking-wider opacity-90">
              Tap for Distress
            </span>
          </button>
        </div>

        <p className="mt-4 text-xs font-medium text-slate-400 text-center max-w-xs">
          Instantly broadcasts live GPS location, sounds deterrence siren &amp; opens WhatsApp dispatch.
        </p>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 gap-3">
        {/* Fake Call Trigger */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic([60]);
            onTriggerFakeCall();
          }}
          className="min-h-[56px] p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 hover:border-purple-400 active:scale-[0.98] text-left transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
              Fake Call Escape
            </span>
            <PhoneOutgoing className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Trigger 3s delay incoming call to exit awkward situations.
          </p>
        </button>

        {/* Safety Check-In Sentinel */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic([60]);
            onOpenCheckIn();
          }}
          className="min-h-[56px] p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950/40 border border-teal-500/30 hover:border-teal-400 active:scale-[0.98] text-left transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
              Journey Timer
            </span>
            <Clock className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Set cab or commute timer with automatic overdue alert.
          </p>
        </button>
      </div>

      {/* Live Geolocation Card */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>Live Location Sentinel</span>
          </div>
          {location && (
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
            >
              Open Maps <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {isLoadingLocation ? (
          <div className="py-2 flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
            <span>Retrieving live GPS &amp; OpenStreetMap reverse geocode...</span>
          </div>
        ) : location ? (
          <div>
            <p className="text-xs font-medium text-slate-200 leading-snug line-clamp-2">
              {location.address}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{location.coords.latitude.toFixed(4)}°, {location.coords.longitude.toFixed(4)}°</span>
              <span>•</span>
              <span className="text-teal-400">
                Updated {new Date(location.coords.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-xs text-slate-400 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Tap SOS to initialize instant geolocation tracking.</span>
          </div>
        )}
      </div>

      {/* Trusted Circle / Quick Contacts Preview */}
      <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Emergency Contacts ({contacts.length})</span>
          </div>
          <button
            onClick={onOpenContacts}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-medium underline"
          >
            Manage
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex-shrink-0 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs min-w-[110px]"
            >
              <div className="font-semibold text-slate-200 truncate">{contact.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{contact.relationship}</div>
              {contact.isPrimary && (
                <div className="text-[9px] text-teal-400 font-medium mt-0.5">Primary Contact</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Share App with Friends Card */}
      <div 
        onClick={onOpenShareApp}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') onOpenShareApp(); }}
        className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-teal-900/40 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
            <Share2 className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <p className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
              Share Security4Her with Friends
            </p>
            <p className="text-[11px] text-slate-400">
              Send the public web app link via WhatsApp or copy URL
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-teal-400 group-hover:text-teal-300 underline">
          Share
        </span>
      </div>
    </div>
  );
};