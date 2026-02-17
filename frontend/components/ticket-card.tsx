'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin, QrCode, Ticket, X, Download, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TicketCardProps {
  ticket: {
    _id: string;
    ticketCode: string;
    qrPayload: string;
    status: 'valid' | 'used' | 'cancelled';
    checkedInAt?: string;
    createdAt: string;
    eventId: {
      _id: string;
      title: string;
      coverImage: string;
      startDate: string;
      location: {
        city: string;
      };
    };
  };
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const event = ticket.eventId;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-700';
      case 'used':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid':
        return 'CONFIRMED';
      case 'used':
        return 'USED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'UNKNOWN';
    }
  };

  const eventDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const eventTime = new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const purchaseDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate QR code URL using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.qrPayload)}`;

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
        {/* Ticket Header with Image */}
        <div className="relative h-40 bg-muted overflow-hidden">
          <Image
            src={event.coverImage || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold ${getStatusColor(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold">{event.title}</h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{eventDate} · {eventTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{event.location?.city || 'TBA'}</span>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="pt-4 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-foreground/60">TICKET CODE</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-semibold">{ticket.ticketCode}</span>
                <button onClick={handleCopyCode} className="p-1 hover:bg-muted rounded transition">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-foreground/40" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">PURCHASED</span>
              <span className="font-semibold">{purchaseDate}</span>
            </div>
            {ticket.checkedInAt && (
              <div className="flex justify-between">
                <span className="text-foreground/60">CHECKED IN</span>
                <span className="font-semibold">
                  {new Date(ticket.checkedInAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowQR(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled={ticket.status === 'cancelled'}
            >
              <QrCode className="w-4 h-4 mr-2" />
              View Pass
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm bg-transparent"
              onClick={handleCopyCode}
            >
              <Ticket className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-bold">Entry Pass</h2>
              <button onClick={() => setShowQR(false)} className="p-2 hover:bg-muted rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={220}
                  height={220}
                  className="rounded"
                  unoptimized
                />
              </div>

              <h3 className="text-lg font-bold mb-1">{event.title}</h3>
              <p className="text-sm text-foreground/60 mb-1">{eventDate} · {eventTime}</p>
              <p className="text-sm text-foreground/60 mb-4">{event.location?.city}</p>

              <div className="w-full bg-muted/50 rounded-lg p-3 text-center mb-4">
                <p className="text-xs text-foreground/50 mb-1">TICKET CODE</p>
                <p className="font-mono font-bold text-lg tracking-wider">{ticket.ticketCode}</p>
              </div>

              <p className="text-xs text-foreground/40 text-center">
                Show this QR code at the venue entrance for check-in
              </p>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border flex gap-2">
              <a
                href={qrCodeUrl}
                download={`ticket-${ticket.ticketCode}.png`}
                className="flex-1"
              >
                <Button variant="outline" className="w-full text-sm bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Save QR
                </Button>
              </a>
              <Button
                onClick={() => { handleCopyCode(); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
