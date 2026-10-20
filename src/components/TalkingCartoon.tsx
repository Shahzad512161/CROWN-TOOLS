import React, { useState, useEffect, useCallback } from 'react';

export interface TalkingCartoonProps {
  onInteract?: () => void;
  className?: string;
}

export default function TalkingCartoon({ onInteract, className = '' }: TalkingCartoonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [hasSpokenOnce, setHasSpokenOnce] = useState(false);

  const englishGreeting = "Hello! Which free tool do you need today? 👑";
  const fullSpeechText = "Hello! Which free tool do you need today?";

  const speakNow = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setSpeaking(true);

      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      // Prefer an English voice when one is available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setSpeaking(false);
      };

      utterance.onerror = () => {
        setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeaking(false);
    }
  }, [fullSpeechText]);

  // Page load auto speech with 1.5s delay (gracefully handles autoplay restrictions)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSpokenOnce) {
        speakNow();
        setHasSpokenOnce(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [hasSpokenOnce, speakNow]);

  const handleCartoonClick = () => {
    if (onInteract) onInteract();
    speakNow();
  };

  return (
    <div className={`flex flex-col items-center lg:items-start gap-4 select-none ${className}`}>
      
      {/* Speech Bubble */}
      <div 
        onClick={handleCartoonClick}
        className={`relative bg-yellow-50 dark:bg-yellow-950/60 border-[3px] border-black dark:border-amber-400 rounded-[20px] p-4 sm:p-5 shadow-[6px_6px_0px_black] dark:shadow-[6px_6px_0px_#f59e0b] max-w-[360px] cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
          speaking ? 'scale-105 ring-4 ring-amber-400/50' : ''
        }`}
        title="Click cartoon to speak greeting"
      >
        {/* Status indicator badge */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] bg-yellow-200 dark:bg-yellow-900/80 text-black dark:text-yellow-200 font-extrabold inline-block px-2.5 py-0.5 rounded-full border border-black dark:border-amber-400">
            100% Unlocked • Zero Login
          </span>
          {speaking && (
            <span className="flex items-center gap-1 text-[11px] font-black text-rose-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Speaking...
            </span>
          )}
        </div>

        {/* Dynamic speech status & greeting */}
        <p className="font-black text-[18px] sm:text-[20px] leading-tight text-black dark:text-yellow-300 tracking-wide">
          {speaking ? '🔊 Speaking...' : `👋 ${englishGreeting}`}
        </p>

        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 font-medium">
          5000+ Free Online Tools • Instant Calculations
        </p>

        {/* Bubble Pointer Tail */}
        <div className="absolute -bottom-3 left-10 sm:left-14 w-5 h-5 bg-yellow-50 dark:bg-yellow-950/60 border-r-[3px] border-b-[3px] border-black dark:border-amber-400 transform rotate-45 pointer-events-none"></div>
      </div>

      {/* Cartoon Character Avatar & Click-to-Speak Control */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
        
        {/* Clickable Animated Cartoon Character */}
        <div 
          onClick={handleCartoonClick}
          className="relative cursor-pointer group flex items-center justify-center p-1 rounded-3xl hover:bg-amber-100/40 dark:hover:bg-slate-800/50 transition-all"
          title="Click me to talk!"
        >
          {/* Audio Waves Effect when speaking */}
          {speaking && (
            <div className="absolute -inset-2 rounded-full bg-amber-400/20 dark:bg-amber-400/10 animate-ping pointer-events-none"></div>
          )}

          <svg 
            className={`w-36 h-44 sm:w-44 sm:h-52 filter drop-shadow-lg transition-transform duration-200 group-hover:scale-105 ${speaking ? 'animate-bounce' : ''}`} 
            viewBox="0 0 200 240" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="charGoldGradVoice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="30%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="capeGradVoice" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <linearGradient id="robeGradVoice" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>

            {/* Royal Cape */}
            <path d="M50 130 C40 180 35 220 30 235 C70 240 130 240 170 235 C165 220 160 180 150 130 Z" fill="url(#capeGradVoice)" />

            {/* Body / Royal Robe */}
            <path d="M60 130 C60 120 140 120 140 130 L145 230 C145 235 55 235 55 230 Z" fill="url(#robeGradVoice)" stroke="#CBD5E1" strokeWidth="2" />
            
            {/* Gold Belt & Buckle */}
            <rect x="62" y="180" width="76" height="12" rx="4" fill="#F59E0B" />
            <rect x="92" y="177" width="16" height="18" rx="3" fill="#FFD700" stroke="#B45309" strokeWidth="1.5" />

            {/* Neck */}
            <rect x="88" y="115" width="24" height="20" rx="6" fill="#FCD34D" />

            {/* Left Arm (Relaxed) */}
            <path d="M62 135 C50 150 45 175 48 190 C54 195 62 195 65 185 C64 175 68 155 74 140 Z" fill="#2563EB" />
            <circle cx="50" cy="195" r="9" fill="#FCD34D" />

            {/* Head / Face */}
            <circle cx="100" cy="85" r="42" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />

            {/* Friendly Big Eyes with highlights */}
            <circle cx="86" cy="82" r="7" fill="#0F172A" />
            <circle cx="88" cy="80" r="2.5" fill="#FFFFFF" />
            <circle cx="114" cy="82" r="7" fill="#0F172A" />
            <circle cx="116" cy="80" r="2.5" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <circle cx="76" cy="94" r="5" fill="#F87171" opacity="0.6" />
            <circle cx="124" cy="94" r="5" fill="#F87171" opacity="0.6" />

            {/* Big Warm Friendly Smile (Animates open when speaking) */}
            {speaking ? (
              <ellipse cx="100" cy="102" rx="10" ry="7" fill="#B91C1C" stroke="#78350F" strokeWidth="2" />
            ) : (
              <>
                <path d="M88 98 C95 110 105 110 112 98" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M92 101 C97 106 103 106 108 101" fill="#EF4444" opacity="0.8" />
              </>
            )}

            {/* Neat Hair */}
            <path d="M64 75 C60 60 70 48 85 45 C100 42 118 42 130 50 C140 56 142 68 138 78 C135 68 125 58 115 56 C95 54 75 62 64 75 Z" fill="#451A03" />

            {/* Golden King Crown */}
            <g>
              <path d="M72 48 L68 25 L84 34 L100 15 L116 34 L132 25 L128 48 Z" fill="url(#charGoldGradVoice)" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="70" y="47" width="60" height="7" rx="2" fill="#D97706" />
              <circle cx="68" cy="24" r="3" fill="#FFF275" />
              <circle cx="100" cy="14" r="3.5" fill="#FFF275" />
              <circle cx="132" cy="24" r="3" fill="#FFF275" />
              <circle cx="100" cy="50" r="2" fill="#EF4444" />
              <circle cx="85" cy="50" r="1.5" fill="#3B82F6" />
              <circle cx="115" cy="50" r="1.5" fill="#3B82F6" />
            </g>

            {/* ANIMATED WAVING RIGHT ARM & HAND */}
            <g className="wave-animation">
              <path d="M136 135 C148 120 158 95 168 85 C174 88 180 94 176 102 C168 115 156 138 144 148 Z" fill="#2563EB" />
              <circle cx="174" cy="80" r="11" fill="#FCD34D" />
              <rect x="170" y="65" width="4" height="12" rx="2" fill="#FCD34D" transform="rotate(-15 170 65)" />
              <rect x="175" y="64" width="4" height="13" rx="2" fill="#FCD34D" transform="rotate(-5 175 64)" />
              <rect x="180" y="66" width="4" height="12" rx="2" fill="#FCD34D" transform="rotate(8 180 66)" />
              <rect x="164" y="74" width="4" height="8" rx="2" fill="#FCD34D" transform="rotate(-40 164 74)" />
            </g>
          </svg>
        </div>

        {/* Click To Speak Button & Label */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
          <button
            onClick={handleCartoonClick}
            type="button"
            className="group/btn flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-[12px] sm:text-[13px] px-4 py-2 rounded-full font-bold shadow-[3px_3px_0px_#f59e0b] hover:shadow-[4px_4px_0px_#f59e0b] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer border border-amber-400"
          >
            <span className={`text-base ${speaking ? 'animate-bounce' : 'group-hover/btn:scale-125 transition-transform'}`}>
              🔊
            </span>
            <span>{speaking ? 'Speaking...' : 'Click to Speak'}</span>
          </button>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold pl-1">
            👑 AI Royal Mascot • Voice & Audio Greeting
          </span>
        </div>

      </div>

    </div>
  );
}
