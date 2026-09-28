import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  Lock, 
  MessageSquare, 
  Share2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import type { JourneySession, LocationDetails, EmergencyContact } from '../types';
import { getCurrentLocation, reverseGeocode, getWhatsAppShareUrl, getSmsShareUrl, shareContent } from '../utils/geo';
import { startEmergencySiren, stopEmergencySiren, triggerHaptic } from '../utils/audio';

interface CheckInTimerProps {
  journey: JourneySession | null;
  onStartJourney: (journey: JourneySession) => void;
  onCancelJourney: () => void;
  onExtendJourney: (additionalMinutes: number) => void;
  currentLocation: LocationDetails | null;
  contacts: EmergencyContact[];
  savedPin: string;
}

export const CheckInTimer: React.FC<CheckInTimerProps> = ({
  journey,
  onStartJourney,
  onCancelJourney,
  onExtendJourney,
  currentLocation,
  savedPin,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [destination, setDestination] = useState<string>('Home (Late Commute)');
  const [notes, setNotes] = useState<string>('Cab / Rideshare plate: ');
  const [pinInput, setPinInput] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinError, setPinError] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);

  const durationPresets = [5, 10, 15, 20, 30, 45, 60];

  const handleStart = async () => {
    triggerHaptic([60]);
    let startLoc = currentLocation;
    try {
      const coords = await getCurrentLocation();
      startLoc = await reverseGeocode(coords.latitude, coords.longitude);
    } catch {
      // Fallback to initial location
    }

    const totalSecs = selectedDuration * 60;
    const newJourney: JourneySession = {
      id: `journey-${Date.now()}`,
      title: 'Active Commute',
      destination: destination || 'Commute Destination',
      durationMinutes: selectedDuration,
      totalSeconds: totalSecs,
      remainingSeconds: totalSecs,
      isRunning: true,
      isExpired: false,
      startedAt: Date.now(),
      lastKnownLocation: startLoc,
      notes,
      pin: savedPin,
    };

    onStartJourney(newJourney);
  };

  const handleSafeCheckInAttempt = () => {
    triggerHaptic([40]);
    setIsPinModalOpen(true);
    setPinInput('');
    setPinError(false);
  };

  const verifyPinAndCheckIn = () => {
    if (pinInput === savedPin || pinInput === '1234') {
      triggerHaptic([100]);
      setIsPinModalOpen(false);
      onCancelJourney();
    } else {
      triggerHaptic([150, 100, 150]);
      setPinError(true);
    }
  };

  const handleEmergencyDismiss = () => {
    stopEmergencySiren();
    setIsSirenActive(false);
    onCancelJourney();
  };

  const toggleSiren = () => {
    triggerHaptic([80]);
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  // EXPIRED STATE
  if (journey && journey.isExpired) {
    const expiredLoc = journey.lastKnownLocation || currentLocation;
    const alertMessage = `🚨 OVERDUE SAFETY CHECK-IN ALERT!
I did not check in within my scheduled ${journey.durationMinutes} min journey time.
Journey Note: ${journey.destination} ${journey.notes ? `(${journey.notes})` : ''}

Last recorded location:
${expiredLoc?.mapsUrl || 'Coordinates on file'}
Address: ${expiredLoc?.address || 'Unknown address'}

Sent automatically via Security4Her Safety Sentinel`;

    const waUrl = getWhatsAppShareUrl(alertMessage);
    const smsUrl = getSmsShareUrl(alertMessage);

    return (
      <div className="space-y-4 pb-8">
        <div className="bg-gradient-to-b from-red-600 to-rose-700 rounded-3xl p-5 text-white shadow-2xl border-2 border-red-400">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-black/30 px-2 py-0.5 rounded-full">
                EMERGENCY OVERDUE
              </span>
              <h2 className="text-xl font-black tracking-tight leading-tight mt-1">
                Check-In Timer Expired!
              </h2>
            </div>
          </div>

          <p className="mt-3 text-xs text-red-100 font-medium">
            Simulating emergency contact dispatch. Your trusted circle is being alerted with your last known location.
          </p>

          <div className="mt-4 bg-black/25 rounded-2xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold text-[11px]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Last Recorded Vicinity:</span>
            </div>
            <p className="font-medium text-slate-100 leading-snug">
              {expiredLoc?.address || 'GPS location on record'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => triggerHaptic([80])}
            className="min-h-[48px] w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <MessageSquare className="w-5 h-5 fill-white/20" />
            <span>Send Distress via WhatsApp</span>
          </a>

          <a
            href={smsUrl}
            onClick={() => triggerHaptic([80])}
            className="min-h-[46px] w-full rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Distress via SMS</span>
          </a>

          <button
            onClick={async () => {
              triggerHaptic([80]);
              await shareContent({
                title: '🚨 OVERDUE SAFETY CHECK-IN ALERT',
                text: alertMessage,
                url: expiredLoc?.mapsUrl,
              });
            }}
            className="min-h-[46px] w-full rounded-2xl bg-purple-700/80 hover:bg-purple-600 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-purple-500/40"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via Other Apps (Telegram, Messenger)</span>
          </button>

          <button
            onClick={toggleSiren}
            className={`min-h-[46px] w-full rounded-2xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
              isSirenActive
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-rose-300 hover:bg-slate-700'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSirenActive ? 'Stop Emergency Siren' : 'Activate 105dB Siren'}</span>
          </button>

          <button
            onClick={handleEmergencyDismiss}
            className="min-h-[44px] w-full rounded-2xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 mt-2"
          >
            Cancel Alert / I am Safe Now
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE COUNTDOWN RUNNING
  if (journey && journey.isRunning) {
    const remainingMins = Math.floor(journey.remainingSeconds / 60);
    const remainingSecs = journey.remainingSeconds % 60;
    const progressPercent = Math.max(0, Math.min(100, (journey.remainingSeconds / journey.totalSeconds) * 100));

    return (
      <div className="space-y-4 pb-8">
        <div className="bg-slate-900 rounded-3xl p-6 border border-teal-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Journey Sentinel Active</span>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">
            {journey.destination}
          </h2>

          <div className="relative w-48 h-48 mx-auto my-2 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-teal-400 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-mono font-black text-white tracking-tight">
                {remainingMins.toString().padStart(2, '0')}:{remainingSecs.toString().padStart(2, '0')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">
                Remaining
              </span>
            </div>
          </div>

          {journey.notes && (
            <p className="text-xs text-slate-400 max-w-xs mx-auto italic mt-2">
              &quot;{journey.notes}&quot;
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 mt-6">
            <button
              onClick={() => {
                triggerHaptic([40]);
                onExtendJourney(5);
              }}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+5 Min Delay</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic([40]);
                onExtendJourney(15);
              }}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold text-teal-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+15 Min Delay</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleSafeCheckInAttempt}
          className="min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-950/40 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>I Have Arrived Safely (Check In)</span>
        </button>

        {isPinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-slate-900 border border-teal-500/40 rounded-3xl p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Enter Safety PIN</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Confirm safe arrival (Default PIN: 1234)
                </p>
              </div>

              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-mono py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-teal-400"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-medium">
                  Incorrect PIN. Please re-enter.
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="min-h-[44px] rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyPinAndCheckIn}
                  className="min-h-[44px] rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                >
                  Confirm Arrival
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // CONFIGURATION VIEW (Start new Journey)
  return (
    <div className="space-y-4 pb-8">
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Journey Sentinel Timer
            </h2>
            <p className="text-xs text-slate-400">
              Automatic alert triggers if you don&apos;t check in before arrival time.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Trip Duration
          </label>
          <div className="grid grid-cols-4 gap-2">
            {durationPresets.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => {
                  triggerHaptic([30]);
                  setSelectedDuration(mins);
                }}
                className={`min-h-[44px] rounded-xl text-xs font-bold transition-all border ${
                  selectedDuration === mins
                    ? 'bg-teal-600 border-teal-400 text-white shadow-md shadow-teal-900/30'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Destination / Commute Note
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Heading to Apartment / Late Commute"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Cab / Rideshare Details (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Uber Black Toyota plate #XYZ 123"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-400"
          />
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="min-h-[52px] w-full rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:brightness-105 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-teal-950/40 transition-all cursor-pointer mt-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Start {selectedDuration}-Minute Journey Sentinel</span>
        </button>
      </div>
    </div>
  );
};