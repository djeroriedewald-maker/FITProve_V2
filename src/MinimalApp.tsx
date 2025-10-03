import { useState } from 'react';

export default function MinimalApp() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1a1a1a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', margin: 0 }}>FITProve</h1>
      <p>Minimal Test - Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
      <div style={{
        position: 'absolute',
        bottom: '20px',
        fontSize: '14px',
        opacity: 0.7
      }}>
        If you see this, React is working!
      </div>
    </div>
  );
}