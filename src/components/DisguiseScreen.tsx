import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

interface DisguiseScreenProps {
  onExitDisguise: () => void;
}

export const DisguiseScreen: React.FC<DisguiseScreenProps> = ({ onExitDisguise }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleDigit = (digit: string) => {
    triggerHaptic([20]);
    if (display === '0') {
      setDisplay(digit);
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleOp = (op: string) => {
    triggerHaptic([30]);
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    triggerHaptic([40]);
    setDisplay('0');
    setEquation('');
  };

  const handleEquals = () => {
    triggerHaptic([40]);
    if (display === '911' || display === '1234' || display === '0000') {
      onExitDisguise();
      return;
    }

    try {
      const fullExpr = equation + display;
      const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, '');
      const tokens = sanitized.split(' ').filter(Boolean);
      if (tokens.length === 1 && !isNaN(Number(tokens[0]))) {
        setDisplay(tokens[0]);
      } else {
        const result = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(result));
        setEquation('');
      }
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between pt-2 px-2 text-slate-500">
        <button
          onClick={onExitDisguise}
          className="text-[11px] text-slate-600 hover:text-slate-400 p-1 flex items-center gap-1"
          title="Return to Security4Her"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Exit Stealth</span>
        </button>
        <span className="text-[11px] font-mono">Standard Calculator</span>
      </div>

      <div className="my-auto text-right px-4 space-y-1">
        <div className="text-sm font-mono text-slate-400 h-6">{equation}</div>
        <div className="text-5xl font-mono tracking-tight text-white overflow-hidden text-ellipsis">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 pb-6">
        <button onClick={handleClear} className="h-16 rounded-full bg-slate-700 text-white text-xl font-medium active:bg-slate-600">AC</button>
        <button onClick={() => setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display)} className="h-16 rounded-full bg-slate-700 text-white text-xl font-medium active:bg-slate-600">±</button>
        <button onClick={() => handleOp('%')} className="h-16 rounded-full bg-slate-700 text-white text-xl font-medium active:bg-slate-600">%</button>
        <button onClick={() => handleOp('/')} className="h-16 rounded-full bg-amber-600 text-white text-2xl font-medium active:bg-amber-500">÷</button>

        {['7', '8', '9'].map((n) => (
          <button key={n} onClick={() => handleDigit(n)} className="h-16 rounded-full bg-slate-800 text-white text-2xl font-medium active:bg-slate-700">{n}</button>
        ))}
        <button onClick={() => handleOp('*')} className="h-16 rounded-full bg-amber-600 text-white text-2xl font-medium active:bg-amber-500">×</button>

        {['4', '5', '6'].map((n) => (
          <button key={n} onClick={() => handleDigit(n)} className="h-16 rounded-full bg-slate-800 text-white text-2xl font-medium active:bg-slate-700">{n}</button>
        ))}
        <button onClick={() => handleOp('-')} className="h-16 rounded-full bg-amber-600 text-white text-2xl font-medium active:bg-amber-500">−</button>

        {['1', '2', '3'].map((n) => (
          <button key={n} onClick={() => handleDigit(n)} className="h-16 rounded-full bg-slate-800 text-white text-2xl font-medium active:bg-slate-700">{n}</button>
        ))}
        <button onClick={() => handleOp('+')} className="h-16 rounded-full bg-amber-600 text-white text-2xl font-medium active:bg-amber-500">+</button>

        <button onClick={() => handleDigit('0')} className="h-16 col-span-2 rounded-full bg-slate-800 text-white text-2xl font-medium text-left pl-7 active:bg-slate-700">0</button>
        <button onClick={() => { if (!display.includes('.')) handleDigit('.'); }} className="h-16 rounded-full bg-slate-800 text-white text-2xl font-medium active:bg-slate-700">.</button>
        <button onClick={handleEquals} className="h-16 rounded-full bg-amber-600 text-white text-2xl font-medium active:bg-amber-500">=</button>
      </div>
    </div>
  );
};