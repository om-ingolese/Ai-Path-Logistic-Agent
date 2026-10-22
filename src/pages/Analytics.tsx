import React, { useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  Leaf,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ShieldCheck,
  Fuel,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Layout } from '@/components/Layout';
import { MetricCard, AIDecisionCard } from '@/components/Cards';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { IMAGES } from '@/assets/images';

const Analytics: React.FC = () => {
  const { metrics, decisions, vehicles } = useRealtimeData();

  // Computed Analytics Data
  const aiImpactData = useMemo(() => {
    const appliedDecisions = decisions.filter(d => d.status === 'applied');
    const totalProfitImpact = appliedDecisions.reduce((sum, d) => sum + d.profit_impact_inr, 0);
    const avgImpactScore = appliedDecisions.length > 0 
      ? Math.round(appliedDecisions.reduce((sum, d) => sum + d.impact_score, 0) / appliedDecisions.length) 
      : 0;

    return {
      totalProfitImpact,
      avgImpactScore,
      count: appliedDecisions.length
    };
  }, [decisions]);

  const chartData = useMemo(() => [
    { name: 'Fuel Optimization', value: 4500, color: 'var(--chart-1)' },
    { name: 'Empty Miles Fix', value: 8200, color: 'var(--chart-2)' },
    { name: 'Route Rerouting', value: 3100, color: 'var(--chart-3)' },
    { name: 'Load Matching', value: 12500, color: 'var(--chart-4)' },
  ], []);

  const performanceHistory = useMemo(() => [
    { date: 'Jan 24', revenue: 450000, savings: 12000 },
    { date: 'Jan 25', revenue: 480000, savings: 15000 },
    { date: 'Jan 26', revenue: 460000, savings: 18000 },
    { date: 'Jan 27', revenue: 510000, savings: 22000 },
    { date: 'Jan 28', revenue: 540000, savings: 25000 },
    { date: 'Jan 29', revenue: 530000, savings: 21000 },
    { date: 'Jan 30', revenue: 580000, savings: 28000 },
  ], []);

  const fleetStatusDistribution = useMemo(() => {
    const counts = vehicles.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  }, [vehicles]);

  const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-5)'];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl p-8 bg-card border border-border/50 shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
             <img 
               src={IMAGES.DASHBOARD_BG_5} 
               alt="Analytics Background" 
               className="object-cover w-full h-full grayscale"
             />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">Performance Hub</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Operational <span className="text-primary">Intelligence</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Real-time analysis of AI-driven logistics efficiency across the Indian sub-continent. 
              Tracking NH-44 and NH-48 corridors for optimal throughput.
            </p>
          </div>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="AI Profit Impact"
            value={`₹${aiImpactData.totalProfitImpact.toLocaleString('en-IN')}`}
            change="+12.5% vs last week"
            icon={<TrendingUp className="text-emerald-500" />}
          />
          <MetricCard 
            title="Decision Precision"
            value={`${aiImpactData.avgImpactScore}%`}
            change="98.2% confidence"
            icon={<Target className="text-blue-500" />}
          />
          <MetricCard 
            title="Carbon Offset"
            value="1,240 kg"
            change="-4.2% CO2 emission"
            icon={<Leaf className="text-green-500" />}
          />
          <MetricCard 
            title="Fleet Utilization"
            value={`${metrics.utilizationRate}%`}
            change="+2% from yesterday"
            icon={<Zap className="text-amber-500" />}
          />
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue & Savings Trend */}
          <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold">Adaptive Performance Trend</h3>
                <p className="text-sm text-muted-foreground">Weekly revenue vs AI-driven savings</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-xs font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium">AI Savings</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Status Distribution */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Fleet Allocation
              </h3>
              <p className="text-sm text-muted-foreground">Real-time status distribution</p>
            </div>
            <div className="flex-1 h-[250px] min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fleetStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {fleetStatusDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-bold truncate">{entry.name}</span>
                  <span className="text-[10px] ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Decision Impact by Category */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Value Stream Analysis
            </h3>
            <div className="space-y-4">
              {chartData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono">₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(item.value / 15000) * 100}%`, 
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">AI Efficiency Index</p>
                  <p className="text-lg font-bold text-primary">0.92</p>
                  <p className="text-[10px] text-muted-foreground">Optimization score vs regional benchmarks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Decisions Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Fuel className="w-4 h-4 text-blue-500" />
                Latest High-Impact Decisions
              </h3>
              <button className="text-xs text-primary hover:underline flex items-center gap-1">
                View Audit Log <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decisions.slice(0, 4).map(decision => (
                <AIDecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;