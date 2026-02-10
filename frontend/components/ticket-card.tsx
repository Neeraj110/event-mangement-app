'use client';

import Image from 'next/image';
import { Calendar, MapPin, QrCode, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket as TicketType } from '@/lib/slices/ticketsSlice';

interface TicketCardProps extends TicketType {}

export function TicketCard(ticket: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'payment_processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'attended':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'payment_processing':
        return 'PAYMENT PROCESSING';
      case 'attended':
        return 'ATTENDED';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Ticket Header with Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        <Image
          src={ticket.eventImage || "/placeholder.svg"}
          alt={ticket.eventTitle}
          fill
          className="object-cover"
        />
        <div className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold ${getStatusColor(ticket.status)}`}>
          {getStatusLabel(ticket.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Event Title */}
        <h3 className="text-lg font-semibold">{ticket.eventTitle}</h3>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{ticket.eventDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{ticket.eventTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{ticket.eventLocation}</span>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="pt-4 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">TICKET NUMBER</span>
            <span className="font-mono font-semibold">{ticket.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">PURCHASED</span>
            <span className="font-semibold">{ticket.purchaseDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm">
            <QrCode className="w-4 h-4 mr-2" />
            View Ticket
          </Button>
          <Button variant="outline" className="flex-1 text-sm bg-transparent">
            <Ticket className="w-4 h-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
