'use client';

import React from "react"

import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Music, Code, Palette, Users, Utensils, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'music', label: 'Music', icon: Music },
  { id: 'tech', label: 'Tech', icon: Code },
  { id: 'arts', label: 'Art', icon: Palette },
  { id: 'networking', label: 'Networking', icon: Users },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'sports', label: 'Sports', icon: Zap },
];

export default function SignUpPage() {
  const [userType, setUserType] = useState<'user' | 'organizer'>('user');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Minimum 8 characters with at least one number.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      console.log('Sign up attempted:', {
        userType,
        username: formData.username,
        email: formData.email,
        interests: selectedInterests,
      });
      setIsLoading(false);
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
        <Link href="/login" className="text-primary hover:text-primary/80 text-sm font-medium transition">
          Already have an account? <span className="font-bold">Log in</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-lg">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                Join the Spot community to explore and organize events.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">
                  I AM JOINING AS A...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['user', 'organizer'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserType(type as 'user' | 'organizer')}
                      className={`px-4 py-2.5 rounded-full font-semibold transition-all ${userType === type
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                        }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2">
                  Unique Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground font-semibold">@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="yourname"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-8 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${focusedField === 'username'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }`}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${focusedField === 'email'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }`}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground transition-all ${focusedField === 'password'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }`}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Minimum 8 characters with at least one number.</p>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-4">
                  What are you interested in?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(category => {
                    const Icon = category.icon;
                    const isSelected = selectedInterests.includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleInterest(category.id)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-full transition-all duration-200 mt-8 shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Terms */}
              <p className="text-xs text-muted-foreground text-center mt-6">
                By clicking &quot;Create Account&quot;, you agree to our{' '}
                <Link href="#" className="text-primary hover:text-primary/80 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-primary hover:text-primary/80 font-medium">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-muted-foreground text-xs">
        © 2024 Spot Platform. All rights reserved.
      </footer>
    </div>
  );
}
