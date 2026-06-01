/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, LockKeyhole, UserPlus } from 'lucide-react';
import { findUserByEmail, saveUser, setCurrentSession } from '../db';
import { User as UserType } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (isRegistering) {
      // Sign Up Flow
      if (!trimmedDisplayName) {
        setError('Please enter a display name or username.');
        return;
      }

      const existingUser = findUserByEmail(trimmedEmail);
      if (existingUser) {
        setError('An account with this email/username already exists.');
        return;
      }

      const newUser: UserType = {
        id: Math.random().toString(36).substring(2, 11),
        email: trimmedEmail,
        displayName: trimmedDisplayName,
        passwordHash: password, // For mock app, plain representation
        createdAt: new Date().toISOString(),
      };

      saveUser(newUser);
      setSuccess('Account created successfully! Logging you in...');
      
      setTimeout(() => {
        setCurrentSession(newUser);
        onLoginSuccess(newUser);
      }, 1200);

    } else {
      // Log In Flow
      const user = findUserByEmail(trimmedEmail);
      if (!user || user.passwordHash !== password) {
        setError('Invalid username/email or password.');
        return;
      }

      setSuccess('Welcome back! Logging you in...');
      setTimeout(() => {
        setCurrentSession(user);
        onLoginSuccess(user);
      }, 800);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setEmail('');
    setDisplayName('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Branding */}
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-4"
          >
            {isRegistering ? <UserPlus className="w-8 h-8" /> : <LockKeyhole className="w-8 h-8" />}
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegistering ? 'Create your account' : 'Sign in to your tasks'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegistering ? 'Get started with your Simple To-Do List' : 'Enter your details to manage your daily duties'}
          </p>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10"
        >
          <form className="space-y-5" onSubmit={handleAuth}>
            
            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg"
              >
                {success}
              </motion.div>
            )}

            {/* Name field (for Registration only) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {/* Email / Username field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Min. 6 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-all active:scale-98"
            >
              {isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 flex justify-center text-sm">
            <button
              onClick={toggleMode}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </motion.div>
        
        {/* Subtle Credits Footer */}
        <div className="text-center text-xs text-slate-400 mt-4 font-mono">
          Session data stored safely in client localStorage
        </div>
      </div>
    </div>
  );
}
