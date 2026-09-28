import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertOctagon, 
  MapPin, 
  MessageSquare, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import type { LocationDetails, EmergencyContact } from '../types';
import { generateSosMessage, getWhatsAppShareUrl, getSmsShareUrl, shareContent } from '../utils/geo';
import { startEmergencySiren, stopEmergencySiren, triggerHaptic } from '../utils/audio';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationDetails | null;
  isLoadingLocation: boolean;
  contacts: EmergencyContact[];
  onRefreshLocation: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  location,
  isLoadingLocation,
  contacts,
  onRefreshLocation,
}) => {
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isStrobeOn, setIsStrobeOn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string>('all');

  useEffect(() => {
    return () => {
      stopEmergencySiren();
    };
  }, []);

  if (!isOpen) return null;

  const targetContact = selectedContactId === 'all' 
    ? contacts.find(c => c.isPrimary) || contacts[0] 
    : contacts.find(c => c.id === selectedContactId);

  const sosMessage = generateSosMessage(location);
  const whatsappUrl = getWhatsAppShareUrl(sosMessage, targetContact?.phone);
  const smsUrl = getSmsShareUrl(sosMessage, targetContact?.phone);

  const toggleSiren = () => {
    triggerHaptic([80]);
    if (isSirenPlaying) {
      stopEmergencySiren();
      setIsSirenPlaying(false);
    } else {
      startEmergencySiren();
      setIsSirenPlaying(true);
    }
  };

  const toggleStrobe = () => {
    triggerHaptic([50]);
    setIsStrobeOn((prev) => !prev);
  };

  const handleUniversalShare = async () => {
    triggerHaptic([80]);
    const success = await shareContent({
      title: '🚨 EMERGENCY SOS ALERT',
      text: sosMessage,
      url: location?.mapsUrl,
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyMessage = async () => {
    triggerHaptic([80]);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sosMessage);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = sosMessage;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDismiss = () => {
    stopEmergencySiren();
    setIsSirenPlaying(false);
    setIsStrobeOn(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity ${isStrobeOn ? 'animate-emergency-strobe' : ''}`}>
      <div 
        className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-modal-title"
      >
        {/* High-Alert Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-4 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="sos-modal-title" className="text-base font-black tracking-wider uppercase">
                EMERGENCY SOS ACTIVE
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Live location captured &amp; dispatch ready
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Close emergency modal"
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 active:scale-95 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Location Card with OSM Reverse Geocoded Address */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Current Location &amp; Address</span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic([40]);
                  onRefreshLocation();
                }}
                disabled={isLoadingLocation}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer disabled:opacity-50"
              >
                {isLoadingLocation ? 'Locating...' : 'Refresh GPS'}
              </button>
            </div>

            {isLoadingLocation ? (
              <div className="py-3 flex items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                <span>Acquiring high-accuracy GPS &amp; reverse-geocoding...</span>
              </div>
            ) : location ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-100 leading-snug">
                  {location.address}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                  <span className="font-mono">
                    {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
                  </span>
                  <span>•</span>
                  <span>Accurate to ~{location.coords.accuracy || 15}m</span>
                  <span>•</span>
                  <a
                    href={location.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-0.5"
                  >
                    View Map <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-2 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">GPS location permission pending</p>
                  <p className="text-slate-400 text-[11px]">Click &quot;Refresh GPS&quot; and allow browser location access.</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Dispatch Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Send Alert To:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedContactId('all')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedContactId === 'all'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                <div className="font-semibold text-white">All Contacts</div>
                <div className="text-[10px] text-slate-400">Open WhatsApp / SMS</div>
              </button>

              {contacts.slice(0, 3).map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                    selectedContactId === contact.id
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                  }`}
                >
                  <div className="font-semibold text-white truncate">{contact.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{contact.phone}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Quick Dispatch Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* WhatsApp trigger */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerHaptic([100, 50, 100])}
              className="min-h-[48px] w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/30 transition-all px-4"
            >
              <MessageSquare className="w-5 h-5 fill-white/20" />
              <span>Send via WhatsApp</span>
            </a>

            {/* Direct SMS trigger */}
            <a
              href={smsUrl}
              onClick={() => triggerHaptic([80])}
              className="min-h-[46px] w-full rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-teal-900/30 transition-all px-4"
            >
              <Share2 className="w-4 h-4" />
              <span>Send via SMS</span>
            </a>

            {/* Native Share Sheet */}
            <button
              onClick={handleUniversalShare}
              className="min-h-[46px] w-full rounded-xl bg-purple-700/80 hover:bg-purple-600 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-purple-500/40 transition-all px-4"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via Other Apps (Telegram, Messenger)</span>
            </button>

            {/* Copy SOS Message Button */}
            <button
              onClick={handleCopyMessage}
              className="min-h-[46px] w-full rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all px-4"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Distress Message Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Distress Message &amp; Live Location</span>
                </>
              )}
            </button>
          </div>

          {/* Active Deterrence Tools */}
          <div className="pt-2 border-t border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-400 mb-2">
              Deterrence &amp; Attention Seekers:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleSiren}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isSirenPlaying
                    ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-rose-300 hover:bg-slate-700'
                }`}
              >
                {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSirenPlaying ? 'Silence Siren' : '105dB Siren'}</span>
              </button>

              <button
                type="button"
                onClick={toggleStrobe}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  isStrobeOn
                    ? 'bg-amber-500 border-amber-300 text-black font-bold'
                    : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <span>{isStrobeOn ? 'Turn Off Strobe' : 'Strobe Screen'}</span>
              </button>
            </div>
          </div>

          {/* Direct Emergency Helplines Quick Call */}
          <div className="pt-2 border-t border-slate-800">
            <span className="block text-[11px] font-semibold text-slate-400 mb-2">
              Official Police &amp; Helplines:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:911"
                className="min-h-[42px] px-2 py-1.5 rounded-xl bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3 h-3 text-red-400" />
                <span>911</span>
              </a>
              <a
                href="tel:112"
                className="min-h-[42px] px-2 py-1.5 rounded-xl bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3 h-3 text-red-400" />
                <span>112 (EU/Global)</span>
              </a>
              <a
                href="tel:1091"
                className="min-h-[42px] px-2 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/80 hover:bg-purple-900 text-purple-200 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3 h-3 text-purple-400" />
                <span>1091 (Women)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer Dismiss */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleDismiss}
            className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-lg bg-slate-800 active:scale-95 transition-all"
          >
            I am Safe / Close Modal
          </button>
        </div>
      </div>
    </div>
  );
};