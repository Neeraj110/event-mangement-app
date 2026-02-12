'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { SettingsSidebar } from '@/components/settings-sidebar';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useAuthQueries';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, type AccountFormValues } from '@/lib/validations/auth';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';

export default function AccountPage() {
  const { data: profileData, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const user = profileData?.user;

  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      email: '',
    },
    mode: 'onBlur',
  });

  // Populate form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: AccountFormValues) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', values.name);
      formDataToSend.append('email', values.email);
      await updateProfileMutation.mutateAsync(formDataToSend);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    form.reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader title="Account Settings" />
        <div className="flex items-center justify-center h-96">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const parts = user.name.split(' ');
    if (parts.length > 1) {
      return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
    }
    return parts[0].charAt(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Account Settings" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Section */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Account Settings</h2>
                <p className="text-foreground/60">
                  Manage your account information and preferences
                </p>
              </div>

              {/* Profile Header */}
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-foreground/60">{user.role}</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                        Full Name
                      </FieldLabel>
                      <input
                        {...field}
                        id={field.name}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background disabled:bg-muted/50 disabled:text-foreground/60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-500/20"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Email Field */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="text-sm font-semibold">
                        Email Address
                      </FieldLabel>
                      <input
                        {...field}
                        id={field.name}
                        type="email"
                        aria-invalid={fieldState.invalid}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background disabled:bg-muted/50 disabled:text-foreground/60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-500/20"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Information
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-foreground/60 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
