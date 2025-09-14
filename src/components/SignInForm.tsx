import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function SignInForm() {
  const { signInWithPassword, signUp, resetPassword, error: authError, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // If already authenticated, redirect away from signin
  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    if (mode !== 'forgot' && (!email || !password || (mode === 'signup' && !fullName))) {
      setMessage('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        navigate('/');
      } else if (mode === 'signup') {
        const { requiresEmailConfirmation } = await signUp(email, password, fullName);
        if (requiresEmailConfirmation) {
          setMessage('Please check your inbox to confirm your email before signing in.');
        } else {
          navigate('/');
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setMessage('Please enter your email address');
        } else {
          await resetPassword(email);
          setMessage('If that email exists, you will receive a password reset link shortly.');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication error. Please try again.';
      const friendly =
        msg.includes('Invalid login') || msg.includes('Invalid login credentials')
          ? 'Invalid email or password.'
          : msg.includes('Email not confirmed')
          ? 'Please confirm your email before signing in.'
          : msg.includes('User already registered')
          ? 'That email is already registered. Try signing in instead.'
          : msg;
      const errorMessage = friendly;
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'signin' ? 'Sign in to FITProve' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="full-name" className="sr-only">Full name</label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {(message || authError) && (
            <div className="text-sm text-center">
              <p className={authError || (message && message.toLowerCase().includes('error')) ? 'text-red-500' : 'text-gray-700'}>
                {message || (authError && authError.message)}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Sign Up'
                : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setMessage('');
              }}
              className="w-full text-sm text-indigo-600 hover:text-indigo-700"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('forgot'); setMessage(''); }}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};