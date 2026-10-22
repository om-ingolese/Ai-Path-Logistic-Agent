import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    Package,
    Fuel,
    Clock,
    MapPin,
    Navigation,
    CheckCircle2,
    AlertTriangle,
    PhoneCall,
    LifeBuoy,
    Route,
    Gauge,
    CircleDot
} from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { MetricCard } from '@/components/Cards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROUTE_PATHS } from '@/lib/index';

interface DriverDashboardProps {
    userName: string;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ userName }) => {
    const navigate = useNavigate();
    const { vehicles, loads, isLoading } = useRealtimeData();

    // Get the first vehicle as "my vehicle" for demo purposes
    const myVehicle = vehicles[0] || null;

    // Get loads assigned to a vehicle (simulating driver's loads)
    const myLoads = loads.filter(l => l.assigned_vehicle_id && (l.status === 'assigned' || l.status === 'in_transit'));
    const completedLoads = loads.filter(l => l.status === 'delivered');
    const activeLoad = myLoads[0] || null;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

    const totalEarnings = completedLoads.reduce((sum, l) => sum + Math.round(l.price_inr * 0.15), 0);

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 via-card to-card p-8 md:p-10">
                <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1.5 px-3 py-1">
                        <CircleDot className="h-3 w-3 animate-pulse" />
                        On Duty
                    </Badge>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                        <Truck className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Hello, {userName}
                        </h1>
                        <p className="text-muted-foreground">
                            {myVehicle
                                ? <span>Vehicle <span className="font-mono text-primary">{myVehicle.plate_number}</span> • {myVehicle.current_location.city}</span>
                                : 'No vehicle assigned'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Active Loads"
                    value={myLoads.length.toString()}
                    change={myLoads.length > 0 ? "In progress" : "None assigned"}
                    icon={<Package className="h-5 w-5" />}
                />
                <MetricCard
                    title="Deliveries Done"
                    value={completedLoads.length.toString()}
                    change="This month"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                />
                <MetricCard
                    title="Trip Earnings"
                    value={formatCurrency(totalEarnings || 45000)}
                    change="Commission based"
                    icon={<Gauge className="h-5 w-5" />}
                />
                <MetricCard
                    title="Fuel Level"
                    value={myVehicle ? `${Math.round(myVehicle.fuel_level)}%` : 'N/A'}
                    change={myVehicle && myVehicle.fuel_level < 30 ? "⚠️ Low fuel" : "Good"}
                    icon={<Fuel className="h-5 w-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column — Active Assignment + Vehicle */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Assignment */}
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="p-6 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Navigation className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">Current Assignment</h2>
                            </div>
                            {activeLoad && (
                                <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                                    {activeLoad.status === 'in_transit' ? 'In Transit' : 'Ready for Pickup'}
                                </Badge>
                            )}
                        </div>
                        {activeLoad ? (
                            <div className="px-6 pb-6 space-y-5">
                                {/* Route Display */}
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                                        <div className="w-0.5 h-12 bg-border" />
                                        <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/20" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Pickup</p>
                                            <p className="font-medium">{activeLoad.origin}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Delivery</p>
                                            <p className="font-medium">{activeLoad.destination}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Load Details */}
                                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Weight</p>
                                        <p className="font-semibold">{(activeLoad.weight_kg / 1000).toFixed(1)} T</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deadline</p>
                                        <p className="font-semibold">{activeLoad.delivery_deadline}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Earnings</p>
                                        <p className="font-semibold text-primary">{formatCurrency(Math.round(activeLoad.price_inr * 0.15))}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 pb-8 text-center">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-muted-foreground font-medium">No active assignment</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">Waiting for dispatch to assign your next load.</p>
                            </div>
                        )}
                    </div>

                    {/* My Vehicle Status */}
                    {myVehicle && (
                        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-semibold">My Vehicle</h2>
                                <Badge variant="outline" className="ml-auto font-mono text-xs">
                                    {myVehicle.plate_number}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Fuel className="h-3.5 w-3.5" /> Fuel Level
                                            </span>
                                            <span className="font-semibold">{Math.round(myVehicle.fuel_level)}%</span>
                                        </div>
                                        <Progress value={myVehicle.fuel_level} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-muted-foreground flex items-center gap-1.5">
                                                <Package className="h-3.5 w-3.5" /> Load Capacity
                                            </span>
                                            <span className="font-semibold">
                                                {myVehicle.capacity_kg > 0
                                                    ? `${Math.round((myVehicle.current_load_kg / myVehicle.capacity_kg) * 100)}%`
                                                    : '0%'}
                                            </span>
                                        </div>
                                        <Progress
                                            value={myVehicle.capacity_kg > 0 ? (myVehicle.current_load_kg / myVehicle.capacity_kg) * 100 : 0}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Model</span>
                                        <span className="font-medium">{myVehicle.model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant="secondary" className="capitalize text-xs">{myVehicle.status}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {myVehicle.current_location.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column — Quick Actions + Recent */}
                <div className="space-y-6">
                    {/* Emergency & Support */}
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5 text-primary" />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <Button
                                variant="destructive"
                                className="w-full justify-start gap-3 h-12"
                                onClick={() => navigate(ROUTE_PATHS.SUPPORT)}
                            >
                                <PhoneCall className="h-5 w-5" />
                                Emergency SOS
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 h-12"
                                onClick={() => navigate(ROUTE_PATHS.SUPPORT)}
                            >
                                <AlertTriangle className="h-5 w-5" />
                                Report Issue
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 h-12"
                            >
                                <Route className="h-5 w-5" />
                                View My Route
                            </Button>
                        </div>
                    </div>

                    {/* Recent Deliveries */}
                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Recent Deliveries
                        </h3>
                        {completedLoads.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No completed deliveries yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {completedLoads.slice(0, 5).map((load) => (
                                    <motion.div
                                        key={load.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{load.origin} → {load.destination}</p>
                                            <p className="text-xs text-muted-foreground">{(load.weight_kg / 1000).toFixed(1)}T • {load.delivery_deadline}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-primary whitespace-nowrap">
                                            {formatCurrency(Math.round(load.price_inr * 0.15))}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
