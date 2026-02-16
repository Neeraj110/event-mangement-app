'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard-header';
import { usePurchasesStore } from '@/lib/stores/purchasesStore';

export default function PurchasesPage() {
  const purchases = usePurchasesStore();
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'refunds' | 'subscriptions'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'refunded':
        return 'text-red-600';
      default:
        return 'text-foreground/60';
    }
  };

  const transactions =
    activeTab === 'all'
      ? purchases.transactions
      : activeTab === 'refunds'
        ? purchases.transactions.filter((t) => t.status === 'refunded')
        : purchases.transactions;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Purchases & Billing" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Purchases & Billing</h1>
          <p className="text-foreground/60">
            Manage your event history, download invoices, and track your active subscription passes.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Total Spent</p>
            <p className="text-3xl font-bold">${purchases.totalSpent.toFixed(2)}</p>
            <p className="text-xs text-green-600 mt-2">+12% from last month</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Active Passes</p>
            <p className="text-3xl font-bold">{purchases.activePassesCount}</p>
            <p className="text-xs text-foreground/60 mt-2">Active</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Pending Invoices</p>
            <p className="text-3xl font-bold">{purchases.pendingInvoices}</p>
            <p className="text-xs text-yellow-600 mt-2">Due</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-foreground/60 mb-2">Tax Savings</p>
            <p className="text-3xl font-bold">${purchases.taxSavings.toFixed(2)}</p>
            <p className="text-xs text-foreground/60 mt-2">YTD</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            {['all', 'invoices', 'refunds', 'subscriptions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium transition capitalize ${activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">All Transactions</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">EVENT & ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">DATE</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">AMOUNT</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">PAYMENT METHOD</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">STATUS</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">INVOICE</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold">{transaction.eventName}</p>
                          <p className="text-xs text-foreground/60">TXN: {transaction._id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{transaction.date}</td>
                      <td className="px-6 py-4 font-semibold">${transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{transaction.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground/60">
                Showing 1 to 5 of {purchases.transactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled>
                  Previous
                </Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div>
            <h3 className="text-lg font-bold mb-6">Payment Method</h3>
            <div className="space-y-3">
              {purchases.paymentMethods.map((method) => (
                <div
                  key={method._id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div>
                    <p className="font-semibold">
                      {method.type.toUpperCase()} ending in {method.last4}
                    </p>
                    <p className="text-sm text-foreground/60">
                      Expiry {method.expiryDate} · {method.default ? 'Default' : 'Not default'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
              Add Payment Method
            </Button>
          </div>

          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-bold mb-6">Billing Address</h3>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="font-semibold">{purchases.billingAddress.name}</p>
              <p className="text-sm text-foreground/70">{purchases.billingAddress.street}</p>
              <p className="text-sm text-foreground/70">
                {purchases.billingAddress.city}, {purchases.billingAddress.state} {purchases.billingAddress.zip}
              </p>
              <p className="text-sm text-foreground/70">{purchases.billingAddress.country}</p>
              <Button variant="outline" className="w-full mt-6 bg-transparent">
                Edit Address
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
