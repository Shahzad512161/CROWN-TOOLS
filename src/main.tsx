// Polyfill window.fetch setter for browser extensions that overwrite window.fetch
try {
  const origFetch = window.fetch;
  let currentFetch = origFetch ? origFetch.bind(window) : undefined;
  Object.defineProperty(window, 'fetch', {
    get: () => currentFetch,
    set: (newFetch) => {
      currentFetch = newFetch;
    },
    configurable: true,
    enumerable: true
  });
} catch (_) {
  // Ignore if already configured
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
