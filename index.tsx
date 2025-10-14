import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import './i18n/config';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
