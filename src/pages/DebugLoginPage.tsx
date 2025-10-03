import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function DebugLoginPage() {
  const [email, setEmail] = useState('bartovabarbor@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Login failed: ' + error.message);
        console.error('Login error:', error);
      } else {
        toast.success('Login successful!');
        console.log('Login success:', data);
        
        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        console.log('Profile loaded:', profile);
        
        // Redirect to profile page
        window.location.href = '/profile';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Debug Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-white/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white p-3 rounded-lg font-medium"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <h3 className="text-white font-medium mb-2">Available Test Account:</h3>
          <p className="text-white/70 text-sm">Email: bartovabarbor@gmail.com</p>
          <p className="text-white/70 text-sm">This account has an avatar stored.</p>
        </div>
      </div>
    </div>
  );
}