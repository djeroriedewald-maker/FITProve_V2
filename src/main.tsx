import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- Set theme before React renders ---
const theme = localStorage.getItem('theme');
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// --- Mount React app ---
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
