import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/helpers';
import { Spinner } from '../../components/shared/UIComponents';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent if email exists!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <span className="text-5xl">📧</span>
              <p className="text-white font-semibold mt-4">Check your inbox!</p>
              <p className="text-slate-400 text-sm mt-2">We've sent a password reset link to <strong className="text-primary-300">{email}</strong></p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label text-slate-200">Email Address</label>
                <input type="email" className="w-full px-3.5 py-2.5 rounded-lg border border-white/20 text-sm bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Spinner size="sm"/> Sending...</> : 'Send Reset Link'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300">← Back to Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
