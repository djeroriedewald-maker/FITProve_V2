import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Add spinner animation CSS
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

interface SplashScreenProps {
  onAuthSuccess: () => void;
}

export default function SplashScreen({ onAuthSuccess }: SplashScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign In
        console.log('Attempting to sign in with:', { email, password });
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          console.error('Sign in error:', error);
          setError(error.message);
          return;
        }

        console.log('Sign in successful:', data);
        onAuthSuccess();
      } else {
        // Sign Up
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        console.log('Attempting to sign up with:', { email, password, fullName });
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          console.error('Sign up error:', error);
          setError(error.message);
          return;
        }

        console.log('Sign up successful:', data);

        if (data.user && !data.session) {
          setError('Please check your email to confirm your account');
        } else {
          onAuthSuccess();
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
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
        overflow: 'auto',
        zIndex: 9999,
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: 'clamp(20px, 5vw, 32px)',
          width: 'calc(100% - 40px)',
          maxWidth: '380px',
          margin: '20px',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontWeight: 'bold',
              margin: '0 0 8px 0',
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
              margin: 0,
            }}
          >
            {isLogin ? 'Welcome Back' : 'Join the Community'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              required={!isLogin}
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            required
          />

          {/* Error Display */}
          {error && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                fontSize: '14px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: loading
                ? 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 12px rgba(79, 70, 229, 0.3)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(79, 70, 229, 0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Signing {isLogin ? 'In' : 'Up'}...
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 8px 0' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Quick Test */}
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: '0 0 12px 0' }}>
            Quick Test:
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail('djeroriedewald@gmail.com');
              setPassword('Djero05586!@');
              setIsLogin(true);
              setError('');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            Use Test Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
