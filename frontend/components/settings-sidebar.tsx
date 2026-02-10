'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Cog,
  Palette,
} from 'lucide-react';

const menuItems = [
  { icon: User, label: 'Personal Info', href: '/account/info' },
  { icon: Lock, label: 'Security', href: '/account/security' },
  { icon: Bell, label: 'Notifications', href: '/account/notifications' },
  { icon: CreditCard, label: 'Payment Methods', href: '/account/payments' },
  { icon: Palette, label: 'Theme & Display', href: '/account/theme' },
  { icon: Cog, label: 'Account Preferences', href: '/account/preferences' },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-56 space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-foreground/70 hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          </Link>
        );
      })}
    </aside>
  );
}
