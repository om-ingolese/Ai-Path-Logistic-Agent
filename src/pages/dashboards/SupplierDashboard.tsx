import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    IndianRupee,
    Truck,
    Clock,
    CheckCircle2,
    PlusCircle,
    ArrowRight,
    BarChart3,
    CircleDot,
    Timer,
    TrendingUp
} from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { MetricCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/lib/index';

interface SupplierDashboardProps {
    userName: string;
    companyName?: string;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Pending' },
    assigned: { color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Assigned' },
    in_transit: { color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'In Transit' },
    delivered: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Delivered' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-500/10', label: 'Cancelled' },
};

const SupplierDashboard: React.FC<SupplierDashboardProps> = ({ userName, companyName }) => {
    const navigate = useNavigate();
    const { loads, isLoading } = useRealtimeData();

    const pendingLoads = loads.filter(l => l.status === 'pending');
    const activeShipments = loads.filter(l => l.status === 'in_transit' || l.status === 'assigned');
    const deliveredLoads = loads.filter(l => l.status === 'delivered');
    const totalRevenue = loads.filter(l => l.status === 'delivered' || l.status === 'in_transit').reduce((sum, l) => sum + l.price_inr, 0);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

    // Status breakdown for the visual chart
    const statusBreakdown = [
        { key: 'pending', count: pendingLoads.length },
        { key: 'assigned', count: loads.filter(l => l.status === 'assigned').length },
        { key: 'in_transit', count: loads.filter(l => l.status === 'in_transit').length },
        { key: 'delivered', count: deliveredLoads.length },
    ];
    const totalLoads = loads.length || 1;

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-600/10 via-card to-card p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                            <Package className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                                Welcome, {userName}
                            </h1>
                            <p className="text-muted-foreground">
                                {companyName || 'AI Path Logistics'} • Load Management Portal
                            </p>
                        </div>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => navigate(ROUTE_PATHS.LOADS)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Post New Load
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Loads"
                    value={loads.length.toString()}
                    change="All time"
                    icon={<Package className="h-5 w-5" />}
                />
                <MetricCard
                    title="Active Shipments"
                    value={activeShipments.length.toString()}
                    change={activeShipments.length > 0 ? "Tracking live" : "None active"}
                    icon={<Truck className="h-5 w-5" />}
                />
                <MetricCard
                    title="Revenue"
                    value={formatCurrency(totalRevenue || 1800000)}
                    change="+8% this month"
                    icon={<IndianRupee className="h-5 w-5" />}
                />
                <MetricCard
                    title="Avg Delivery"
                    value="3.2 days"
                    change="Faster than avg"
                    icon={<Timer className="h-5 w-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Active Shipments */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Active Shipments</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => navigate(ROUTE_PATHS.LOADS)}
                        >
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : activeShipments.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground font-medium">No active shipments</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Post a new load to get started.</p>
                            <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTE_PATHS.LOADS)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Post Load
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeShipments.map((load, i) => {
                                const sc = statusConfig[load.status] || statusConfig.pending;
                                return (
                                    <motion.div
                                        key={load.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`${sc.bg} ${sc.color} border-none gap-1`}>
                                                        <CircleDot className="h-3 w-3" /> {sc.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-mono">#{load.id.slice(0, 8)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="font-medium">{load.origin}</span>
                                                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-medium">{load.destination}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Package className="h-3 w-3" /> {(load.weight_kg / 1000).toFixed(1)}T
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" /> by {load.delivery_deadline}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-primary font-medium">
                                                        <IndianRupee className="h-3 w-3" /> {formatCurrency(load.price_inr)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Recent Deliveries Table */}
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-semibold">Completed Deliveries</h3>
                            <Badge variant="secondary" className="ml-auto">{deliveredLoads.length}</Badge>
                        </div>
                        {deliveredLoads.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No completed deliveries yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {deliveredLoads.slice(0, 5).map(load => (
                                    <div key={load.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{load.origin} → {load.destination}</p>
                                            <p className="text-xs text-muted-foreground">{(load.weight_kg / 1000).toFixed(1)}T • {load.delivery_deadline}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-primary whitespace-nowrap">{formatCurrency(load.price_inr)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Status Breakdown + Quick Actions */}
                <div className="space-y-6">
                    {/* Load Status Overview */}
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Load Status Overview</h3>
                        </div>
                        <div className="space-y-3">
                            {statusBreakdown.map(({ key, count }) => {
                                const sc = statusConfig[key] || statusConfig.pending;
                                const pct = Math.round((count / totalLoads) * 100);
                                return (
                                    <div key={key} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className={`font-medium ${sc.color}`}>{sc.label}</span>
                                            <span className="text-muted-foreground">{count} ({pct}%)</span>
                                        </div>
                                        <Progress value={pct} className="h-2" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Revenue Insights */}
                    <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-primary">Revenue Insights</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Earned</span>
                                <span className="font-bold text-primary">{formatCurrency(totalRevenue || 1800000)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Avg Load Value</span>
                                <span className="font-semibold">
                                    {formatCurrency(loads.length > 0 ? Math.round(totalRevenue / loads.length) : 180000)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending Payments</span>
                                <span className="font-semibold">{formatCurrency(activeShipments.reduce((s, l) => s + l.price_inr, 0))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                        <h3 className="font-semibold">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button
                                className="w-full justify-start gap-3 h-12"
                                onClick={() => navigate(ROUTE_PATHS.LOADS)}
                            >
                                <PlusCircle className="h-5 w-5" />
                                Post New Load
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 h-12"
                                onClick={() => navigate(ROUTE_PATHS.SUPPORT)}
                            >
                                <Clock className="h-5 w-5" />
                                Support Center
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
