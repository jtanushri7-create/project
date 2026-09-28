import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  MicOff, 
  Grid, 
  Volume2, 
  User, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';
import type { FakeCallSettings } from '../types';
import { 
  startPhoneRingtone, 
  stopPhoneRingtone, 
  speakSimulatedCaller, 
  stopSimulatedCaller, 
  triggerHaptic 
} from '../utils/audio';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FakeCallSettings;
  onUpdateSettings?: (updated: FakeCallSettings) => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setDurationSeconds(0);
      setIsMuted(false);
      setShowKeypad(false);
      startPhoneRingtone();
    } else {
      stopPhoneRingtone();
      stopSimulatedCaller();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      stopPhoneRingtone();
      stopSimulatedCaller();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  const handleAnswer = () => {
    triggerHaptic([60]);
    stopPhoneRingtone();
    setCallState('connected');
    speakSimulatedCaller(settings.customScript);

    timerRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleDeclineOrEnd = () => {
    triggerHaptic([80]);
    stopPhoneRingtone();
    stopSimulatedCaller();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 max-w-md mx-auto select-none">
      
      {/* Top Caller Info */}
      <div className="pt-10 flex flex-col items-center text-center space-y-2">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-xl mb-2 overflow-hidden">
          <User className="w-12 h-12 text-slate-300" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          {settings.callerName}
        </h1>

        <p className="text-xs text-slate-400 font-mono">
          {settings.callerNumber}
        </p>

        <div className="pt-1">
          {callState === 'incoming' && (
            <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase animate-pulse">
              Incoming Call...
            </span>
          )}

          {callState === 'connected' && (
            <span className="text-sm font-mono text-teal-400 font-medium">
              {formatTimer(durationSeconds)}
            </span>
          )}

          {callState === 'ended' && (
            <span className="text-xs text-red-400 font-medium">
              Call Ended
            </span>
          )}
        </div>
      </div>

      {/* Connected State - In-Call Grid */}
      {callState === 'connected' && (
        <div className="space-y-6 my-auto">
          <div className="grid grid-cols-3 gap-6 max-w-[280px] mx-auto text-center">
            {/* Mute Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic([30]);
                setIsMuted(!isMuted);
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
                <MicOff className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-slate-400">Mute</span>
            </button>

            {/* Keypad */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic([30]);
                setShowKeypad(!showKeypad);
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white">
                <Grid className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-slate-400">Keypad</span>
            </button>

            {/* Speaker */}
            <button
              type="button"
              onClick={() => triggerHaptic([30])}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white">
                <Volume2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] text-slate-400">Speaker</span>
            </button>
          </div>

          {/* Quick Voice Prompt Replay */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                triggerHaptic([40]);
                speakSimulatedCaller(settings.customScript);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 rounded-full"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Replay Caller Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Control Actions */}
      <div className="pb-12">
        {callState === 'incoming' && (
          <div className="flex items-center justify-around px-4">
            {/* Decline Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleDeclineOrEnd}
                aria-label="Decline Call"
                className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center shadow-lg shadow-red-950/60 transition-all cursor-pointer"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>
              <span className="text-xs text-slate-400 font-medium">Decline</span>
            </div>

            {/* Answer Button */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleAnswer}
                aria-label="Answer Call"
                className="w-18 h-18 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 flex items-center justify-center shadow-lg shadow-emerald-950/60 transition-all animate-ring-shake cursor-pointer"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
              <span className="text-xs text-slate-400 font-medium">Accept</span>
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleDeclineOrEnd}
              aria-label="End Call"
              className="w-18 h-18 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center shadow-xl shadow-red-950/60 transition-all cursor-pointer"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};