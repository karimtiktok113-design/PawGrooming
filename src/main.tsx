import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Intercept benign AbortErrors / cancellations (e.g. from tab switches, Firestore WebChannel reconnects, or user aborts)
const isBenignAbort = (msg?: string, err?: any) => {
  const str = `${msg || ''} ${err?.message || ''} ${err?.name || ''} ${String(err || '')}`.toLowerCase();
  return (
    str.includes('signal is aborted without reason') ||
    str.includes('the user aborted a request') ||
    str.includes('aborterror') ||
    str.includes('aborted')
  );
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason || '');
  if (isBenignAbort(message, reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }
}, true);

window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (isBenignAbort(message, event.error)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
