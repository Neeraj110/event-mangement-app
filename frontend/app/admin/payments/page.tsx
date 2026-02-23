'use client';

import { useAllPayments, useApprovePayout, useOrganizerPayments } from '@/lib/hooks/useAdminQueries';
import { useState, useMemo } from 'react';
import { Search, Loader2, CreditCard, Send, CheckCircle2, Users, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import type { OrganizerPaymentSummary } from '@/types';

export default function AdminPaymentsPage() {
    const { data: paymentsData, isLoading, error } = useAllPayments();
    const { data: orgPaymentsData, isLoading: orgLoading } = useOrganizerPayments();
    const approvePayoutMutation = useApprovePayout();
    const [search, setSearch] = useState('');
    const [payoutOrganizerId, setPayoutOrganizerId] = useState('');
    const [payoutAmount, setPayoutAmount] = useState('');
    const [clearingAmounts, setClearingAmounts] = useState<Record<string, string>>({});

    const payments = Array.isArray(paymentsData)
        ? paymentsData
        : (paymentsData as any)?.payments || [];

    const orgSummaries: OrganizerPaymentSummary[] = (orgPaymentsData as any)?.summaries || [];

    const filteredPayments = useMemo(() => {
        if (!search) return payments;
        return payments.filter(
            (p: any) =>
                p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase()) ||
                (typeof p.userId === 'object' && p.userId?.name?.toLowerCase().includes(search.toLowerCase())) ||
                (typeof p.eventId === 'object' && p.eventId?.title?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [payments, search]);

    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const totalFees = payments.reduce((sum: number, p: any) => sum + (p.platformFee || 0), 0);
    const totalOrganizerShare = payments.reduce(
        (sum: number, p: any) => sum + (p.organizerShare || 0),
        0
    );

    const totalPendingPayouts = orgSummaries.reduce(
        (sum, s) => sum + s.remainingAmount,
        0
    );

    const handleApprovePayout = async () => {
        if (!payoutOrganizerId.trim() || !payoutAmount.trim()) return;

        try {
            await approvePayoutMutation.mutateAsync({
                organizerId: payoutOrganizerId.trim(),
                amount: parseFloat(payoutAmount),
            });
            toast.success('Payout approved successfully');
            setPayoutOrganizerId('');
            setPayoutAmount('');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to approve payout');
        }
    };

    const handleMarkCleared = async (organizerId: string, organizerName: string) => {
        const amount = parseFloat(clearingAmounts[organizerId] || '0');
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await approvePayoutMutation.mutateAsync({ organizerId, amount });
            toast.success(`₹${amount} cleared for ${organizerName}`);
            setClearingAmounts((prev) => ({ ...prev, [organizerId]: '' }));
        } catch (err: any) {
            toast.error(err?.message || 'Failed to clear payment');
        }
    };

    const getStatusBadge = (status: OrganizerPaymentSummary['paymentStatus']) => {
        const styles = {
            fully_paid: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
            partially_paid: 'bg-amber-500/15 text-amber-400 ring-amber-500/20',
            unpaid: 'bg-red-500/15 text-red-400 ring-red-500/20',
        };
        const labels = {
            fully_paid: 'Fully Paid',
            partially_paid: 'Partial',
            unpaid: 'Unpaid',
        };
        const dots = {
            fully_paid: 'bg-emerald-400',
            partially_paid: 'bg-amber-400',
            unpaid: 'bg-red-400',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ${styles[status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
                {labels[status]}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-white/40">Loading payments...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <p className="text-sm text-red-400">Failed to load payments. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Payments</h1>
                <p className="text-sm text-white/40 mt-1">
                    {payments.length} transaction{payments.length !== 1 ? 's' : ''} recorded
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                        Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                        ₹{totalRevenue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                        Platform Fees
                    </p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                        ₹{totalFees.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                        Organizer Payouts
                    </p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">
                        ₹{totalOrganizerShare.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-white/30 uppercase tracking-wider">
                            Pending Payouts
                        </p>
                        {totalPendingPayouts > 0 && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                    </div>
                    <p className={`text-2xl font-bold mt-1 ${totalPendingPayouts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        ₹{totalPendingPayouts.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* ─── Organizer Payment Status ─────────────────────────── */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-white">Organizer Payment Status</h3>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            Fully Paid
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            Partial
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            Unpaid
                        </span>
                    </div>
                </div>

                {orgLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                ) : orgSummaries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <DollarSign className="w-10 h-10 text-white/10 mb-3" />
                        <p className="text-sm text-white/30">No organizer payments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Organizer
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Total Earned
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Total Paid
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Remaining
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {orgSummaries.map((summary) => (
                                    <tr key={summary.organizerId} className="hover:bg-white/[0.02] transition">
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="text-sm font-medium text-white/80">{summary.organizerName}</p>
                                                <p className="text-xs text-white/30">{summary.organizerEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-white/80">
                                            ₹{summary.totalEarned.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-emerald-400/80">
                                            ₹{summary.totalPaid.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-semibold">
                                            <span className={summary.remainingAmount > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                                ₹{summary.remainingAmount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {getStatusBadge(summary.paymentStatus)}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {summary.paymentStatus !== 'fully_paid' ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white/25 font-medium">₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder={summary.remainingAmount.toString()}
                                                            value={clearingAmounts[summary.organizerId] || ''}
                                                            onChange={(e) =>
                                                                setClearingAmounts((prev) => ({
                                                                    ...prev,
                                                                    [summary.organizerId]: e.target.value,
                                                                }))
                                                            }
                                                            className="w-24 pl-6 pr-2 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkCleared(summary.organizerId, summary.organizerName)}
                                                        disabled={approvePayoutMutation.isPending}
                                                        className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                    >
                                                        {approvePayoutMutation.isPending ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        )}
                                                        Clear
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-emerald-400/50 italic">Settled</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approve Payout Section */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Send className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-white">Manual Payout</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Organizer ID"
                        value={payoutOrganizerId}
                        onChange={(e) => setPayoutOrganizerId(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/25 font-medium">₹</span>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            className="w-full sm:w-40 pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                        />
                    </div>
                    <button
                        onClick={handleApprovePayout}
                        disabled={
                            approvePayoutMutation.isPending ||
                            !payoutOrganizerId.trim() ||
                            !payoutAmount.trim()
                        }
                        className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {approvePayoutMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                    type="text"
                    placeholder="Search by transaction ID, user, or event..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition"
                />
            </div>

            {/* Payments Table */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Organizer ID
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Event
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {filteredPayments.map((payment: any) => (
                                <tr key={payment._id} className="hover:bg-white/[0.02] transition">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-white/20 flex-shrink-0" />
                                            <span className="text-xs font-mono text-white/50 truncate max-w-[120px]">
                                                {payment.razorpayPaymentId || payment._id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/50">
                                        {typeof payment.userId === 'object'
                                            ? payment.userId?.name || payment.userId?.email
                                            : payment.userId?.slice(0, 8) + '...'}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="text-xs font-mono text-indigo-400/70 bg-indigo-500/10 px-2 py-1 rounded">
                                            {typeof payment.eventId === 'object'
                                                ? payment.eventId?.organizer || payment.eventId?.organizerId || '—'
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/50">
                                        {typeof payment.eventId === 'object'
                                            ? payment.eventId?.title
                                            : payment.eventId?.slice(0, 8) + '...'}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm font-semibold text-white/80">
                                        ₹{payment.amount?.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-emerald-400/80">
                                        ₹{payment.platformFee?.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span
                                            className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${payment.status === 'success'
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : payment.status === 'refunded'
                                                    ? 'bg-amber-500/15 text-amber-400'
                                                    : 'bg-white/[0.06] text-white/30'
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-white/40">
                                        {payment.createdAt
                                            ? new Date(payment.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CreditCard className="w-10 h-10 text-white/10 mb-3" />
                        <p className="text-sm text-white/30">No payments found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
