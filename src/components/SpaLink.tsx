import React from 'react';

/**
 * SpaLink — the single fix for the site's orphan / no-outgoing-links problem.
 *
 * Every internal navigation in this app used to be a <button> or <div>
 * onClick. Crawlers (Ahrefs, Googlebot, AI crawlers) follow <a href>
 * links, not onClick handlers, so in the crawled link graph every page
 * had zero incoming and zero outgoing internal links — 557 orphan pages
 * and 559 no-outgoing-link pages in the first Ahrefs audit.
 *
 * SpaLink renders a real <a href> (so crawlers see the link) while keeping
 * the existing client-side navigation: on click it prevents the full page
 * reload and calls the same handler the button used to call. No URL, slug
 * or route changes — only the element type.
 */
export const SpaLink: React.FC<{
  href: string;
  onNavigate: () => void;
  className?: string;
  title?: string;
  'aria-current'?: 'page' | 'date' | 'location' | 'step' | 'time' | 'true' | 'false' | boolean;
  'aria-label'?: string;
  children: React.ReactNode;
}> = ({ href, onNavigate, className, title, children, ...aria }) => (
  <a
    href={href}
    title={title}
    {...aria}
    className={className}
    onClick={(e) => {
      // Left-click without modifiers stays in the SPA; Ctrl/Cmd-click,
      // middle-click and right-click keep native browser behaviour
      // (new tab, etc.) exactly as a normal link.
      if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        onNavigate();
      }
    }}
  >
    {children}
  </a>
);
