'use client';

import Image from 'next/image';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pass } from '@/lib/slices/passesSlice';

interface PassCardProps extends Pass {}

export function PassCard(pass: PassCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Pass Image */}
      <div className="relative h-56 bg-muted overflow-hidden">
        <Image
          src={pass.eventImage || "/placeholder.svg"}
          alt={pass.eventTitle}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
          {pass.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div>
          <div className="text-xs font-bold text-blue-600 uppercase mb-1">PASS STATUS: {pass.status}</div>
          <h3 className="text-lg font-semibold">{pass.name}</h3>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-foreground/60">Duration Progress</span>
            <span className="text-xs font-semibold text-foreground">{pass.durationPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${pass.durationPercentage}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">VALID UNTIL</span>
            <span className="font-semibold">{pass.validUntil}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">MEMBER ID</span>
            <span className="font-semibold">{pass.memberId}</span>
          </div>
        </div>

        {/* Features */}
        <div className="pt-4 border-t border-border space-y-2">
          {pass.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <span className="text-blue-600">✓</span>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* QR Code Button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <QrCode className="w-4 h-4 mr-2" />
          Expand
        </Button>
      </div>
    </div>
  );
}
