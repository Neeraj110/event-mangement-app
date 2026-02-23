'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  Search,
  Camera,
  CameraOff,
  Keyboard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  QrCode,
  Users,
  Ticket,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { useOrganizerEvents } from '@/lib/hooks/useOrganizerQueries';
import {
  useCheckinStats,
  useCheckinLogs,
  useCheckinMutation,
} from '@/lib/hooks/useCheckinQueries';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

function CheckInPageContent() {
  const searchParams = useSearchParams();
  const paramEventId = searchParams.get('eventId');

  // State
  const [selectedEventId, setSelectedEventId] = useState(paramEventId || '');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    type: 'success' | 'error';
    message: string;
    ticketCode?: string;
  } | null>(null);

  const scannerRef = useRef<any>(null);
  const scannerContainerId = 'qr-reader';

  // Queries
  const { data: events, isLoading: eventsLoading } = useOrganizerEvents();
  const {
    data: stats,
    isLoading: statsLoading,
  } = useCheckinStats(selectedEventId);
  const { data: logs } = useCheckinLogs(selectedEventId);
  const checkinMutation = useCheckinMutation();

  // Auto-set first event if none selected
  useEffect(() => {
    if (!selectedEventId && events && events.length > 0) {
      setSelectedEventId(events[0]._id);
    }
  }, [events, selectedEventId]);

  // QR Scanner
  const startScanner = useCallback(async () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          handleQrResult(decodedText);
        },
        () => {
          // ignore scan errors (continuous scanning)
        },
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Scanner start error:', err);
      toast.error(
        err?.message?.includes('NotAllowed')
          ? 'Camera permission denied. Please allow camera access.'
          : 'Failed to start camera. Make sure no other app is using it.',
      );
      setIsScanning(false);
    }
  }, [selectedEventId]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // Scanner may already be stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
        scannerRef.current = null;
      }
    };
  }, []);

  // Handle QR scan result
  const handleQrResult = useCallback(
    async (decodedText: string) => {
      if (checkinMutation.isPending) return;

      // Stop scanner briefly to prevent duplicate scans
      await stopScanner();

      let ticketCode = decodedText;

      // Try to parse as JSON (our QR payload format)
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.ticketCode) {
          ticketCode = parsed.ticketCode;
        }
      } catch {
        // Not JSON — use raw text as ticket code
      }

      performCheckin(ticketCode);
    },
    [selectedEventId, checkinMutation.isPending],
  );

  // Perform check-in
  const performCheckin = useCallback(
    (ticketCode: string) => {
      if (!selectedEventId) {
        toast.error('Please select an event first');
        return;
      }

      if (!ticketCode.trim()) {
        toast.error('Please enter a ticket code');
        return;
      }

      checkinMutation.mutate(
        { ticketCode: ticketCode.trim(), eventId: selectedEventId },
        {
          onSuccess: (data) => {
            setLastResult({
              type: 'success',
              message: data.message,
              ticketCode,
            });
            setManualCode('');
            toast.success(`✅ ${data.message} — ${ticketCode}`);
          },
          onError: (error: any) => {
            const msg = error?.message || 'Check-in failed';
            setLastResult({ type: 'error', message: msg, ticketCode });
            toast.error(`❌ ${msg}`);
          },
        },
      );
    },
    [selectedEventId, checkinMutation],
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheckin(manualCode);
  };

  const capacityPercentage =
    stats && stats.capacity > 0
      ? ((stats.checkedIn / stats.capacity) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={stats?.eventTitle ? `Check-in — ${stats.eventTitle}` : 'Check-in Manager'}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground/70 mb-2">
            Select Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              stopScanner();
              setLastResult(null);
            }}
            className="w-full max-w-md px-4 py-3 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={eventsLoading}
          >
            <option value="">
              {eventsLoading ? 'Loading events...' : '— Choose an event —'}
            </option>
            {events?.map((event) => (
              <option key={event._id} value={event._id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {/* All Checked In Banner */}
        {stats?.allCheckedIn && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">
                All tickets checked in!
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                All {stats.totalSold} ticket(s) have been scanned. No more entries to verify.
              </p>
            </div>
          </div>
        )}

        {selectedEventId && (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-foreground/60">Checked In</p>
                </div>
                <p className="text-3xl font-bold">
                  {statsLoading ? '—' : stats?.checkedIn ?? 0}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-foreground/60">Tickets Sold</p>
                </div>
                <p className="text-3xl font-bold">
                  {statsLoading ? '—' : stats?.totalSold ?? 0}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-foreground/60">Event Capacity</p>
                </div>
                <p className="text-3xl font-bold">
                  {statsLoading ? '—' : stats?.capacity ?? 0}
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-sm text-foreground/60">Capacity Used</p>
                </div>
                <p className="text-3xl font-bold">{capacityPercentage}%</p>
                <div className="mt-3 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(capacityPercentage), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Scanner + Manual Entry */}
              <div className="lg:col-span-1 space-y-6">
                {/* QR Scanner */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-500" />
                    QR Code Scanner
                  </h3>

                  {/* Camera Frame */}
                  <div
                    className="relative rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center"
                    style={{ minHeight: isScanning ? 'auto' : '260px' }}
                  >
                    <div id={scannerContainerId} className="w-full" />

                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">
                            Click Start to activate camera
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scanner Controls */}
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-5 text-base font-semibold"
                        onClick={startScanner}
                        disabled={!selectedEventId || stats?.allCheckedIn}
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Scanner
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 py-5 text-base font-semibold border-red-300 text-red-600 hover:bg-red-50"
                        onClick={stopScanner}
                      >
                        <CameraOff className="w-5 h-5 mr-2" />
                        Stop Scanner
                      </Button>
                    )}
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-purple-500" />
                    Manual Entry
                  </h3>
                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter ticket code (e.g. TICKET-AB12CD34)"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      disabled={!selectedEventId || stats?.allCheckedIn}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 py-5 text-base font-semibold"
                      disabled={
                        !manualCode.trim() ||
                        checkinMutation.isPending ||
                        !selectedEventId ||
                        stats?.allCheckedIn
                      }
                    >
                      {checkinMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Ticket →'
                      )}
                    </Button>
                  </form>
                </div>

                {/* Last Result */}
                {lastResult && (
                  <div
                    className={`rounded-xl border p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${lastResult.type === 'success'
                        ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                      }`}
                  >
                    {lastResult.type === 'success' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-semibold ${lastResult.type === 'success'
                            ? 'text-green-800 dark:text-green-300'
                            : 'text-red-800 dark:text-red-300'
                          }`}
                      >
                        {lastResult.message}
                      </p>
                      {lastResult.ticketCode && (
                        <p className="text-sm text-foreground/60 font-mono mt-1">
                          {lastResult.ticketCode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Check-in Log */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      Recent Check-ins
                    </h3>
                    <span className="text-xs text-foreground/50 bg-muted px-3 py-1 rounded-full">
                      Auto-refreshing
                    </span>
                  </div>

                  {!logs || logs.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-block p-4 bg-muted rounded-xl mb-4">
                        <Users className="w-10 h-10 text-foreground/30" />
                      </div>
                      <p className="text-foreground/50 text-sm">
                        No check-ins yet. Start scanning to see entries here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {logs.map((log) => (
                        <div
                          key={log._id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border bg-green-50/50 dark:bg-green-950/10 hover:bg-green-50 dark:hover:bg-green-950/20 transition"
                        >
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {log.ticketId?.userId?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-foreground/50 truncate">
                              {log.ticketId?.userId?.email || '—'}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-mono text-xs text-foreground/70 mb-1">
                              {log.ticketId?.ticketCode || '—'}
                            </p>
                            <p className="text-xs text-foreground/40">
                              {new Date(log.scannedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Event Selected */}
        {!selectedEventId && !eventsLoading && (
          <div className="text-center py-20">
            <div className="inline-block p-5 bg-muted rounded-2xl mb-4">
              <QrCode className="w-14 h-14 text-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Select an Event</h2>
            <p className="text-foreground/50 max-w-md mx-auto">
              Choose an event from the dropdown above to start scanning tickets
              and verifying entry.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <CheckInPageContent />
    </Suspense>
  );
}
