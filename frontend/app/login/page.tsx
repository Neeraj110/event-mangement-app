'use client';

import React from "react"

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        console.log('Sign in attempted:', { email, password });
        setIsLoading(false);
      } else {
        setError('Please fill in all fields');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">◆</span>
          </div>
          <span className="text-foreground font-semibold text-lg">Spot</span>
        </Link>
        <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
          Help
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-lg">
            {/* Blue Gradient Header with Icon */}
            <div className="h-32 bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-transparent rounded-full blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  <User className="w-10 h-10 text-white/60" />
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Login to Spot</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back! Please enter your details to access your dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${focusedField === 'email'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }`}
                    disabled={isLoading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <Link href="#" className="text-primary hover:text-primary/80 text-xs font-medium transition">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${focusedField === 'password'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }`}
                    disabled={isLoading}
                  />
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-primary/25"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Login to Account'}
                  {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-card text-muted-foreground text-xs font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-2.5 border border-border rounded-xl hover:border-primary/50 text-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button className="px-4 py-2.5 border border-border rounded-xl hover:border-primary/50 text-foreground hover:text-primary transition-all flex items-center justify-center gap-2 group">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                </div>
              </div>

              {/* Footer Link */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-muted-foreground text-xs space-x-4">
        <Link href="#" className="hover:text-foreground transition">Privacy Policy</Link>
        <span>•</span>
        <Link href="#" className="hover:text-foreground transition">Terms of Service</Link>
        <span>•</span>
        <Link href="#" className="hover:text-foreground transition">Contact Support</Link>
      </footer>
    </div>
  );
}
