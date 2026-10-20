import React from 'react';

/**
 * Super Crown brand mark — a hand-drawn geometric crown (vector paths,
 * not generated imagery). Single color via currentColor so it follows
 * the theme: set text-amber-500 for the brand gold, or slate/white.
 */
export const LogoMark: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 45 L2.5 17 L19 28.5 L32 11 L45 28.5 L61.5 17 L58 45 Z" />
    <rect x="6" y="49.5" width="52" height="5" rx="2" stroke="none" />
  </svg>
);

export default LogoMark;
