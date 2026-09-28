import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Info } from 'lucide-react';
import { shareContent, getWhatsAppShareUrl } from '../utils/geo';
import { triggerHaptic } from '../utils/audio';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PUBLIC_APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://security4her.app';

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out Security4Her — a free women's safety web app with one-tap SOS GPS broadcasting, realistic fake call escape, and journey check-in timer: ${PUBLIC_APP_URL}`;
  const whatsappUrl = getWhatsAppShareUrl(shareText);

  const handleCopy = async () => {
    triggerHaptic([60]);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(PUBLIC_APP_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = PUBLIC_APP_URL;
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

  const handleNativeShare = async () => {
    triggerHaptic([60]);
    const success = await shareContent({
      title: 'Security4Her - Women Safety App',
      text: "Security4Her — One-Tap SOS, Fake Call Escape & Journey Check-In Sentinel.",
      url: PUBLIC_APP_URL,
    });
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 px-5 py-4 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Share Security4Her</h2>
              <p className="text-xs text-purple-100">Send the live app link to friends or family</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 active:scale-95 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-100">Share with Anyone:</p>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                Send the live link below to friends or family so they can use Security4Her directly in their mobile browser without downloading an app.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Public Shareable Link:</span>
              <span className="text-teal-400">Open to Anyone</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700/80 font-mono text-xs text-slate-200 break-all select-all">
              {PUBLIC_APP_URL}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerHaptic([80])}
              className="min-h-[48px] w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 transition-all px-4"
            >
              <MessageSquare className="w-5 h-5 fill-white/20" />
              <span>Share via WhatsApp</span>
            </a>

            <button
              onClick={handleCopy}
              className="min-h-[48px] w-full rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all px-4"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span>Public Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copy Public App Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="min-h-[44px] w-full rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all px-4"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via Other Apps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};