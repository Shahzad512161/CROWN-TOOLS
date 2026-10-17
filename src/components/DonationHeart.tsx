import React from 'react';

interface DonationHeartProps {
  onClick?: () => void;
  text?: string;
  subText?: string;
}

export const DonationHeart: React.FC<DonationHeartProps> = ({
  onClick,
  text = 'ہمارا مشن: 10 لاکھ لوگوں کی مدد',
  subText = 'Help 1M People'
}) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 rounded-full bg-gradient-to-r from-rose-500/25 via-pink-500/25 to-red-500/25 border border-rose-500/50 hover:border-rose-400 text-white transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:shadow-[0_0_18px_rgba(244,63,94,0.6)]"
      title="سپورٹ مشن: ہمارا مشن 10 لاکھ لوگوں کی مدد کرنا ہے"
    >
      {/* 3D Pulsing Animated Beating Heart */}
      <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <svg
          className="relative w-3.5 h-3.5 text-rose-400 fill-current drop-shadow-[0_0_6px_rgba(244,63,94,0.9)] group-hover:scale-115 transition-transform"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>

      {/* Urdu Mission Text */}
      <span className="font-bold text-[11px] sm:text-[12px] text-rose-100 group-hover:text-white transition-colors leading-none font-['Noto_Nastaliq_Urdu',sans-serif]">
        {text}
      </span>

      {/* Subtitle / English Badge */}
      <span className="hidden sm:inline-block text-[10px] font-semibold bg-rose-500/30 text-rose-200 px-1.5 py-0.2 rounded-full uppercase tracking-wider font-sans leading-tight">
        {subText}
      </span>
    </button>
  );
};

export default DonationHeart;
