import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    BarChart3,
    IndianRupee,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    Activity,
    MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { MetricCard, VehicleCard, AIDecisionCard } from '@/components/Cards';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OperatorDashboardProps {
    userName: string;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ userName }) => {
    const navigate = useNavigate();
    const {
        vehicles,
        decisions,
        metrics,
        isLoading,
        generateAIInsights,
        updateDecisionStatus
    } = useRealtimeData();
    const [isGenerating, setIsGenerating] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12">
                <div className="absolute inset-0 z-0 opacity-10">
                    <img
                        src={IMAGES.DASHBOARD_BG_3}
                        alt="Logistics Network"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            System Status: <span className="text-primary font-medium">Adaptive Optimization Active</span> • {new Date().toISOString().split('T')[0]}
                        </p>
                    </div>
                    <Button
                        onClick={async () => {
                            setIsGenerating(true);
                            try {
                                await generateAIInsights();
                                toast.success('AI insights generated successfully!');
                            } catch (err) {
                                toast.error('Failed to generate AI insights');
                            } finally {
                                setIsGenerating(false);
                            }
                        }}
                        size="lg"
                        disabled={isGenerating}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                    >
                        <Sparkles className="mr-2 h-5 w-5" />
                        {isGenerating ? 'Generating...' : 'Generate AI Insights'}
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Vehicles"
                    value={metrics.totalVehicles.toString()}
                    change="+2 from yesterday"
                    icon={<Truck className="h-5 w-5" />}
                />
                <MetricCard
                    title="Utilization Rate"
                    value={`${metrics.utilizationRate}%`}
                    change="Optimal range"
                    icon={<BarChart3 className="h-5 w-5" />}
                />
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(metrics.totalRevenueINR)}
                    change="+12% this month"
                    icon={<IndianRupee className="h-5 w-5" />}
                />
                <MetricCard
                    title="On-Time Delivery"
                    value={`${metrics.onTimeDelivery}%`}
                    change="Industry leading"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Fleet Status Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Active Fleet Status</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => navigate('/fleet')}
                        >
                            View All Vehicles <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vehicles.slice(0, 4).map((vehicle) => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    )}

                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h3 className="font-medium">Geographical Distribution</h3>
                            </div>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="bg-primary/10 text-primary hover:bg-primary/20"
                                onClick={() => navigate('/live-tracking')}
                            >
                                Open Live Map <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                        <div className="h-[200px] w-full bg-slate-950 rounded-lg flex flex-col items-center justify-center border border-border overflow-hidden relative group">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
                            <div className="absolute w-44 h-44 rounded-full border border-primary/20 animate-ping opacity-25" />
                            <div className="absolute w-28 h-28 rounded-full border border-primary/30" />
                            <MapPin className="h-8 w-8 text-primary animate-bounce relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                            <p className="text-white font-medium relative z-10 mt-2 bg-black/60 border border-white/10 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                              NH-44 & NH-48 Active Radar
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Decisions Panel */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">AI Path Insights</h2>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                            {decisions.filter(d => d.status === 'pending').length} New
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {decisions.length === 0 ? (
                            <div className="text-center p-8 border border-dashed border-border rounded-2xl">
                                <p className="text-muted-foreground">No new AI recommendations available.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    disabled={isGenerating}
                                    onClick={async () => {
                                        setIsGenerating(true);
                                        try {
                                            await generateAIInsights();
                                            toast.success('Fleet analysis complete!');
                                        } catch (err) {
                                            toast.error('Analysis failed');
                                        } finally {
                                            setIsGenerating(false);
                                        }
                                    }}
                                >
                                    {isGenerating ? 'Analyzing...' : 'Analyze Fleet Data'}
                                </Button>
                            </div>
                        ) : (
                            decisions.slice(0, 5).map((decision) => (
                                <motion.div
                                    key={decision.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <AIDecisionCard
                                        decision={decision}
                                        onExecute={async () => {
                                            try {
                                                await updateDecisionStatus(decision.id, 'applied');
                                                toast.success('AI decision executed successfully!');
                                            } catch (err) {
                                                toast.error('Failed to execute decision');
                                            }
                                        }}
                                        onDismiss={async () => {
                                            try {
                                                await updateDecisionStatus(decision.id, 'dismissed');
                                                toast.success('AI decision dismissed');
                                            } catch (err) {
                                                toast.error('Failed to dismiss decision');
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))
                        )}
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                        <h4 className="font-semibold text-primary mb-2">Adaptive Process Efficiency</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            AI-driven routing and load matching has increased your profit margin by 14.5% this quarter.
                        </p>
                        <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: '78%' }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium text-primary">Efficiency Goal</span>
                            <span className="text-xs font-medium text-primary">78% / 90%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
