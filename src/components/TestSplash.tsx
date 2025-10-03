interface TestSplashProps {
  onAuthSuccess: () => void;
}

export default function TestSplash({ onAuthSuccess }: TestSplashProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#1a1a2e',
        backgroundImage:
          'url(/images/splash_screen.webp), linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          margin: '0 20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#4F46E5',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
          }}
        >
          🏋️
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #fff 0%, #e5e7eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          FITProve
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 32px 0',
          }}
        >
          Welcome to your fitness journey
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onAuthSuccess}
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Enter App (Skip Auth)
          </button>

          <button
            onClick={() => console.log('Background image should be visible')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Test Background Image
          </button>
        </div>

        <div
          style={{
            marginTop: '24px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Test Splash Screen - Background should be visible
        </div>
      </div>
    </div>
  );
}
