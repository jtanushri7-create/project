import { useState, useEffect, useRef } from 'react';
import type { 
  ActiveTab, 
  LocationDetails, 
  EmergencyContact, 
  JourneySession, 
  FakeCallSettings 
} from './types';
import { 
  getCurrentLocation, 
  reverseGeocode 
} from './utils/geo';
import { 
  getStoredContacts, 
  saveStoredContacts, 
  getStoredFakeCallSettings, 
  saveStoredFakeCallSettings, 
  getStoredJourney, 
  saveStoredJourney,
  getStoredSafetyPin 
} from './utils/storage';
import { triggerHaptic } from './utils/audio';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { SosSection } from './components/SosSection';
import { SosModal } from './components/SosModal';
import { FakeCallModal } from './components/FakeCallModal';
import { CheckInTimer } from './components/CheckInTimer';
import { ContactsManager } from './components/ContactsManager';
import { SafetyTools } from './components/SafetyTools';
import { DisguiseScreen } from './components/DisguiseScreen';
import { ShareAppModal } from './components/ShareAppModal';
import { PhoneOutgoing, Play } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sos');
  
  // Geolocation & Address state
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  
  // Storage states
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => getStoredContacts());
  const [fakeCallSettings, setFakeCallSettings] = useState<FakeCallSettings>(() => getStoredFakeCallSettings());
  const [activeJourney, setActiveJourney] = useState<JourneySession | null>(() => getStoredJourney());
  const [safetyPin] = useState<string>(() => getStoredSafetyPin());

  // Modal & Overlay states
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isFakeCallModalOpen, setIsFakeCallModalOpen] = useState(false);
  const [fakeCallCountdown, setFakeCallCountdown] = useState<number | null>(null);
  const [isDisguiseActive, setIsDisguiseActive] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Countdown timer reference
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const coords = await getCurrentLocation();
      const details = await reverseGeocode(coords.latitude, coords.longitude);
      setLocation(details);
    } catch (e) {
      console.warn('Location initialization error:', e);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSaveContacts = (updated: EmergencyContact[]) => {
    setContacts(updated);
    saveStoredContacts(updated);
  };

  const handleUpdateFakeCallSettings = (updated: FakeCallSettings) => {
    setFakeCallSettings(updated);
    saveStoredFakeCallSettings(updated);
  };

  const handleTriggerFakeCall = (customDelay?: number) => {
    const delay = customDelay !== undefined ? customDelay : fakeCallSettings.delaySeconds;
    
    if (delay === 0) {
      setIsFakeCallModalOpen(true);
      return;
    }

    setFakeCallCountdown(delay);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let remaining = delay;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setFakeCallCountdown(null);
        setIsFakeCallModalOpen(true);
      } else {
        setFakeCallCountdown(remaining);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!activeJourney || !activeJourney.isRunning) return;

    const interval = setInterval(() => {
      setActiveJourney((prev) => {
        if (!prev || !prev.isRunning) return null;

        const newRemaining = prev.remainingSeconds - 1;
        if (newRemaining <= 0) {
          const expiredJourney: JourneySession = {
            ...prev,
            remainingSeconds: 0,
            isRunning: false,
            isExpired: true,
          };
          saveStoredJourney(expiredJourney);
          setActiveTab('checkin');
          return expiredJourney;
        }

        const updated: JourneySession = {
          ...prev,
          remainingSeconds: newRemaining,
        };
        saveStoredJourney(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJourney?.isRunning]);

  const handleStartJourney = (journey: JourneySession) => {
    setActiveJourney(journey);
    saveStoredJourney(journey);
  };

  const handleCancelJourney = () => {
    setActiveJourney(null);
    saveStoredJourney(null);
  };

  const handleExtendJourney = (additionalMinutes: number) => {
    if (!activeJourney) return;
    const additionalSecs = additionalMinutes * 60;
    const updated: JourneySession = {
      ...activeJourney,
      totalSeconds: activeJourney.totalSeconds + additionalSecs,
      remainingSeconds: activeJourney.remainingSeconds + additionalSecs,
      durationMinutes: activeJourney.durationMinutes + additionalMinutes,
      isRunning: true,
      isExpired: false,
    };
    setActiveJourney(updated);
    saveStoredJourney(updated);
  };

  const handleTriggerSos = () => {
    setIsSosModalOpen(true);
    fetchLocation();
  };

  if (isDisguiseActive) {
    return <DisguiseScreen onExitDisguise={() => setIsDisguiseActive(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      <div className="w-full max-w-md mx-auto flex flex-col min-h-screen bg-slate-950 border-x border-slate-900 relative shadow-2xl">
        
        <Header
          onToggleDisguise={() => setIsDisguiseActive(true)}
          gpsActive={!!location}
          onOpenHelpline={() => setActiveTab('tools')}
          onOpenShareApp={() => setIsShareModalOpen(true)}
        />

        <main className="flex-1 px-4 pt-4 pb-20 overflow-y-auto">
          {activeTab === 'sos' && (
            <SosSection
              onTriggerSos={handleTriggerSos}
              onTriggerFakeCall={() => handleTriggerFakeCall()}
              onOpenCheckIn={() => setActiveTab('checkin')}
              onOpenContacts={() => setActiveTab('contacts')}
              onOpenShareApp={() => setIsShareModalOpen(true)}
              location={location}
              isLoadingLocation={isLoadingLocation}
              contacts={contacts}
              activeJourney={activeJourney}
              fakeCallCountdown={fakeCallCountdown}
            />
          )}

          {activeTab === 'checkin' && (
            <CheckInTimer
              journey={activeJourney}
              onStartJourney={handleStartJourney}
              onCancelJourney={handleCancelJourney}
              onExtendJourney={handleExtendJourney}
              currentLocation={location}
              contacts={contacts}
              savedPin={safetyPin}
            />
          )}

          {activeTab === 'fakecall' && (
            <div className="space-y-4 pb-8 animate-in fade-in">
              <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <PhoneOutgoing className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Fake Call Escape Trigger
                    </h2>
                    <p className="text-xs text-slate-400">
                      Discreetly exit uncomfortable or unsafe situations with a realistic incoming call.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic([60]);
                    handleTriggerFakeCall(3);
                  }}
                  className="min-h-[56px] w-full rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/50 transition-all cursor-pointer"
                >
                  <PhoneOutgoing className="w-5 h-5" />
                  <span>Trigger Fake Call (3s Delay)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic([40]);
                      handleTriggerFakeCall(0);
                    }}
                    className="min-h-[46px] rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 text-teal-400" />
                    <span>Instant Call (0s)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic([40]);
                      handleTriggerFakeCall(10);
                    }}
                    className="min-h-[46px] rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PhoneOutgoing className="w-3.5 h-3.5 text-purple-400" />
                    <span>10s Delay</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Caller Identity Setup
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Mom', num: '+1 (555) 349-2091', script: "Hey honey! Where are you? I'm waiting outside in the car with the hazards on. Come out right now!" },
                    { name: 'Dad', num: '+1 (555) 882-1920', script: "Hey, I just pulled up to your location. Are you walking out now?" },
                    { name: 'Roommate Maya', num: '+1 (555) 412-8833', script: "Hey! The Uber is here outside. Meet us at the front entrance in 1 minute." },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        triggerHaptic([30]);
                        handleUpdateFakeCallSettings({
                          ...fakeCallSettings,
                          callerName: preset.name,
                          callerNumber: preset.num,
                          customScript: preset.script,
                        });
                      }}
                      className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-center transition-all ${
                        fakeCallSettings.callerName === preset.name
                          ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold truncate">{preset.name}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={fakeCallSettings.callerName}
                    onChange={(e) => handleUpdateFakeCallSettings({ ...fakeCallSettings, callerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Display Number
                  </label>
                  <input
                    type="text"
                    value={fakeCallSettings.callerNumber}
                    onChange={(e) => handleUpdateFakeCallSettings({ ...fakeCallSettings, callerNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Simulated Voice Script (spoken when answered)
                  </label>
                  <textarea
                    rows={2}
                    value={fakeCallSettings.customScript}
                    onChange={(e) => handleUpdateFakeCallSettings({ ...fakeCallSettings, customScript: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <ContactsManager
              contacts={contacts}
              onSaveContacts={handleSaveContacts}
              location={location}
            />
          )}

          {activeTab === 'tools' && <SafetyTools />}
        </main>

        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isJourneyActive={!!activeJourney?.isRunning}
        />

        <SosModal
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
          location={location}
          isLoadingLocation={isLoadingLocation}
          contacts={contacts}
          onRefreshLocation={fetchLocation}
        />

        <FakeCallModal
          isOpen={isFakeCallModalOpen}
          onClose={() => setIsFakeCallModalOpen(false)}
          settings={fakeCallSettings}
          onUpdateSettings={handleUpdateFakeCallSettings}
        />

        <ShareAppModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      </div>
    </div>
  );
}