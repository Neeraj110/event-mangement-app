'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Camera, Trash2, Zap, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { CheckInLog } from '@/components/checkin-log';
import { useCheckInStore } from '@/lib/stores/checkInStore';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const checkIn = useCheckInStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const filteredLogs = checkIn.logs.filter(
    (log) =>
      log.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ticketType.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Check-in Manager - Summer Gala 2024" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Checked-in</p>
            <p className="text-4xl font-bold">{checkIn.totalCheckedIn}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Total Expected</p>
            <p className="text-4xl font-bold">{checkIn.totalExpected}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Event Capacity</p>
            <p className="text-4xl font-bold">{checkIn.eventCapacityPercentage.toFixed(1)}%</p>
            <p className="text-xs text-foreground/60 mt-2">{checkIn.remainingSpots} remaining spots available</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${checkIn.eventCapacityPercentage}%` }}
              />
            </div>
            <p className="text-xs text-foreground/60 mt-3 text-center">
              {checkIn.eventCapacityPercentage.toFixed(0)}% capacity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Scanner Section */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-20">
              <h3 className="text-lg font-bold">QR Code Scanner</h3>

              {/* Camera Frame */}
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-blue-900 to-gray-900 h-80 flex items-center justify-center">
                <div className="absolute inset-4 border-2 border-blue-400 rounded-lg"></div>
                <div className="text-center">
                  <Camera className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-300 text-sm">Align QR code within the frame</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-base font-semibold">
                  Check-in →
                </Button>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsScanning(!isScanning)}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isScanning ? 'Stop' : 'Start'} Scanning
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Focus className="w-4 h-4 mr-2" />
                  Focus
                </Button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-muted rounded-lg p-3 space-y-2 text-xs">
                <p className="font-semibold mb-2">Keyboard Shortcuts:</p>
                <div className="space-y-1 text-foreground/70">
                  <p><span className="font-mono bg-background px-2 py-1 rounded">ESC</span> Stop Scanning</p>
                  <p><span className="font-mono bg-background px-2 py-1 rounded">F</span> Toggle Flash</p>
                  <p><span className="font-mono bg-background px-2 py-1 rounded">M</span> Manual Check-in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-in Log Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    Check-in Log
                  </h3>
                  <span className="text-sm text-foreground/60">Real-time</span>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    placeholder="Search by name, email or ticket ID..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Logs */}
                <div className="max-h-96 overflow-y-auto">
                  <Suspense fallback={null}>
                    <CheckInLog logs={filteredLogs} />
                  </Suspense>
                </div>

                {/* View All Link */}
                <div className="text-right pt-6 border-t border-border">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Full Attendance List →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Check-in Section */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Manual Check-in</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email or ticket ID..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">Check-in</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
