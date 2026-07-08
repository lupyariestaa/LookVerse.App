import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Key,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Server
} from 'lucide-react';

export const Profile: React.FC = () => {
  // Load current values or fallback to default
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility triggers
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status handlers
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Validation State
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    setName(localStorage.getItem('adminName') || 'Super Admin');
    setEmail(localStorage.getItem('adminEmail') || 'scout@lookverse.io');
    // For safety, let's keep track of current active password in localStorage
    const savedPass = localStorage.getItem('adminPassword') || 'password';
    // We will ask for it before change is allowed
  }, []);

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || name.trim().length < 3) {
      tempErrors.name = 'Operator Name must be at least 3 characters long.';
    }

    if (!email || !emailRegex.test(email)) {
      tempErrors.email = 'Please provide a valid operator email address.';
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        tempErrors.newPassword = 'New Access Code must be at least 6 characters (Milestone 02 requirement).';
      }
      if (newPassword === 'password') {
        tempErrors.newPassword = 'For security, do not use the default "password" string.';
      }
      if (newPassword !== confirmPassword) {
        tempErrors.confirmPassword = 'Confirmation Access Code does not match your new entry.';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) {
      return;
    }

    // Check password if trying to update
    const activePassword = localStorage.getItem('adminPassword') || 'password';
    if (newPassword && currentPassword !== activePassword) {
      setErrorMsg('VERIFICATION FAILURE: CURRENT SECURITY ACCESS CODE IS INCORRECT.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      // Save changes
      localStorage.setItem('adminName', name);
      localStorage.setItem('adminEmail', email);
      
      if (newPassword) {
        localStorage.setItem('adminPassword', newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      setSuccessMsg('OPERATOR CREDENTIALS UPDATED SUCCESSFULLY. PARAMS SYNCD.');
      setIsSaving(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-admin-border dark:border-admin-dark-border transition-colors duration-300">
        <div className="space-y-1.5">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 -skew-x-2">
            Operator Profile_
          </h1>
          <p className="text-xs text-admin-text-secondary dark:text-admin-dark-text-secondary font-medium">
            Review and adjust Super Administrator credentials, passwords, and security access parameters.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-3 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-widest shrink-0">
          <Shield className="w-3.5 h-3.5" />
          <span>ROLES // SUPER ADMIN</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-[12px] flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider"
          >
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-500/20 text-red-500 rounded-[12px] flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Overview Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-admin-dark-surface p-6 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm flex flex-col items-center text-center transition-colors duration-300">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-900 rounded-full border-2 border-admin-primary/20 flex items-center justify-center text-admin-primary dark:text-admin-secondary shadow-inner relative">
              <User className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-admin-dark-surface flex items-center justify-center" title="Active Secured Session">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                {name || 'Super Admin'}
              </h3>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">
                LOOKVERSE OPERATOR
              </p>
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50 space-y-3.5 text-left text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">EMAIL:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] font-mono">{email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">STATUS:</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">SECURITY LEVEL:</span>
                <span className="font-mono font-bold text-[#4F46E5]">TIER-1</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-admin-border dark:border-admin-dark-border rounded-[16px] p-5 space-y-3">
            <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-admin-primary" />
              <span>SECURE CONSOLE STATS</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              This terminal is bound locally. Credentials modified here will take effect immediately inside this browser container.
            </p>
          </div>
        </div>

        {/* Right Side: Security Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-admin-dark-surface p-6 rounded-[20px] border border-admin-border dark:border-admin-dark-border shadow-sm space-y-6 transition-colors duration-300">
            
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-admin-primary" />
                <span>PROFILE & SECURITY CREDENTIALS</span>
              </h3>
            </div>

            {/* Profile Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                  Operator Name_
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Super Admin"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                  />
                  <User className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.name && (
                  <p className="text-[10px] font-mono font-bold text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                  Operator Email_
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. scout@lookverse.io"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-4 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {errors.email && (
                  <p className="text-[10px] font-mono font-bold text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Security Passwords Section */}
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 space-y-5">
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-[12px] border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Shield className="w-4 h-4 text-admin-primary shrink-0 mt-0.5" />
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-relaxed uppercase">
                  Leave new access code fields <span className="text-[#4F46E5] font-black">empty</span> if you only wish to change your Operator name or email credentials.
                </p>
              </div>

              {/* Current Password - Required ONLY if trying to update new password */}
              {newPassword && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-red-500 block">
                    Verify Current Access Code_ (Required)
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required={!!newPassword}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-10 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1 hover:text-admin-primary text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Grid for new and confirm passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                    New Access Code_
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-10 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 hover:text-admin-primary text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[10px] font-mono font-bold text-red-500 leading-snug">{errors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 block">
                    Confirm New Access Code_
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-10 pr-10 py-3 rounded-[10px] focus:outline-none focus:border-admin-primary transition-colors font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1 hover:text-admin-primary text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] font-mono font-bold text-red-500 leading-snug">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

            </div>

            {/* Save profile actions button panel */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-[10px] bg-admin-primary text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Commit Settings</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
