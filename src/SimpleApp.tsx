import { useState } from 'react';
import TestSplash from './components/TestSplash';

export default function SimpleApp() {
  const [showSplash, setShowSplash] = useState(true);

  const handleAuthSuccess = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <TestSplash onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0F172A',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        gap: '20px',
      }}
    >
      <h1 style={{ fontSize: '3rem', margin: 0 }}>🎉 FITProve Main App</h1>
      <p>Authentication successful! You're now in the main app.</p>
      <button
        onClick={() => setShowSplash(true)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Back to Splash
      </button>
    </div>
  );
}
