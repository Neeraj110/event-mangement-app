'use client';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { CheckInRecord } from '@/lib/slices/checkInSlice';

interface CheckInLogProps {
  logs: CheckInRecord[];
}

export function CheckInLog({ logs }: CheckInLogProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'duplicate':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'invalid':
      case 'denied':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'duplicate':
        return 'bg-yellow-50 dark:bg-yellow-950/20';
      case 'invalid':
      case 'denied':
        return 'bg-red-50 dark:bg-red-950/20';
      default:
        return '';
    }
  };

  const getBadgeColor = (badge: string) => {
    if (badge === 'SUCCESS') return 'bg-green-100 text-green-700';
    if (badge === 'DUPLICATE') return 'bg-yellow-100 text-yellow-700';
    if (badge === 'DENIED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className={`flex items-center gap-4 p-4 rounded-lg border border-border transition ${getStatusBgColor(log.status)}`}
        >
          <div className="flex-shrink-0">{getStatusIcon(log.status)}</div>
          <div className="flex-1">
            <p className="font-semibold">{log.attendeeName}</p>
            <p className="text-sm text-foreground/60">{log.ticketType}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-foreground/60 mb-1">{log.timestamp}</p>
            <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${getBadgeColor(log.badge || '')}`}>
              {log.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
