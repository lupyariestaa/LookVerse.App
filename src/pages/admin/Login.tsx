import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirection target after logging in
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'UNAUTHORIZED SPECIMEN: INVALID EMAIL OR ACCESS CODE PASSWORD.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('SERVER CONNECTIVITY INTERRUPTED. PLEASE TRY AGAIN.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-admin-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 font-sans relative">
      
      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-[12px] bg-white dark:bg-admin-dark-surface border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-admin-primary dark:hover:text-admin-secondary hover:border-admin-primary/40 dark:hover:border-admin-secondary/40 transition-all cursor-pointer shadow-xs"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        {/* Animated Brand Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-12 h-12 bg-admin-primary rounded-[16px] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(255,77,0,0.3)]"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.div>
        
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 -skew-x-2">
            LOOKVERSE CMS
          </h2>
          <p className="mt-1.5 text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
            Secure Operator Gateway Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-admin-dark-surface py-8 px-6 sm:px-10 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 space-y-6"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-500 rounded-[10px] p-3.5 flex items-start gap-2.5 text-[11px] font-mono font-black uppercase leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email/Username Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                Operator Username or Email_
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. lupyariestaa"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                />
                <Mail className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                Security Access Code_
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-10 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                />
                <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-admin-primary text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-[10px] bg-admin-primary hover:bg-[#E04400] text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shadow-admin-primary/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
