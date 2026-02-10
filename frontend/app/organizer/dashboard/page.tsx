'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Ticket, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { useAppSelector } from '@/lib/hooks';

export default function OrganizerDashboard() {
  const dashboard = useAppSelector((state) => state.dashboard);

  const chartData = [
    { name: '12 AM', revenue: 1200 },
    { name: '4 AM', revenue: 1900 },
    { name: '8 AM', revenue: 9800 },
    { name: '12 PM', revenue: 2100 },
    { name: '4 PM', revenue: 2290 },
    { name: '8 PM', revenue: 2000 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Dashboard - Organizer View" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold">${dashboard.metrics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{dashboard.metrics.revenueChange}% from last month
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tickets Sold */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Tickets Sold</p>
                <p className="text-3xl font-bold">{dashboard.metrics.ticketsSold}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{dashboard.metrics.ticketsChange}% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Check-ins */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Checked-In</p>
                <p className="text-3xl font-bold">{dashboard.metrics.eventCapacity}</p>
                <p className="text-xs text-foreground/60 mt-2">Live Now</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Event Capacity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Event Capacity</p>
                <p className="text-3xl font-bold">{dashboard.metrics.eventCapacityPercentage.toFixed(1)}%</p>
                <p className="text-xs text-foreground/60 mt-2">
                  {dashboard.metrics.remainingSpots} remaining spots
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ticket Sales Velocity */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold">Ticket Sales Velocity</h3>
              <p className="text-sm text-foreground/60">Real-time data from the last 24 hours</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboard.salesData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="timestamp" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#2563eb" fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-bold">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Event Occupancy</span>
                  <span className="text-sm font-semibold">{dashboard.metrics.eventCapacityPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${dashboard.metrics.eventCapacityPercentage}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-sm text-foreground/60">
                  <span className="font-semibold text-foreground">{dashboard.metrics.totalExpected}</span> total expected
                </p>
                <p className="text-sm text-foreground/60">
                  <span className="font-semibold text-foreground">{dashboard.metrics.eventCapacity}</span> checked in
                </p>
                <p className="text-sm text-foreground/60">
                  <span className="font-semibold text-foreground">{dashboard.metrics.remainingSpots}</span> remaining spots
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-6">Recent Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">EVENT NAME</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">DATE</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">STATUS</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">EXPECTED</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">CHECKED IN</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground/60">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.events.map((event) => (
                  <tr key={event.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-4 py-4 font-semibold">{event.name}</td>
                    <td className="px-4 py-4 text-sm">{event.date}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'live'
                            ? 'bg-green-100 text-green-700'
                            : event.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {event.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">{event.expectedAttendees}</td>
                    <td className="px-4 py-4 font-semibold">{event.checkedIn}</td>
                    <td className="px-4 py-4">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
