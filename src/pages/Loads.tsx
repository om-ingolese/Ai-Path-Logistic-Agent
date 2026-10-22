import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, Clock, CheckCircle, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { Layout } from '@/components/Layout';
import { MetricCard, LoadCard } from '@/components/Cards';
import { LoadAssignmentForm } from '@/components/Forms';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Load, LoadStatus, INDIAN_CITIES } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const getStatusColor = (status: LoadStatus) => {
  switch (status) {
    case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'assigned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_transit': return 'bg-primary-500/10 text-primary border-primary/20';
    case 'delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function Loads() {
  const { loads, assignLoad, addLoad, isLoading } = useRealtimeData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [isPostLoadOpen, setIsPostLoadOpen] = useState(false);
  const [newLoadData, setNewLoadData] = useState({
    origin: '',
    destination: '',
    weight_kg: 5000,
    price_inr: 15000,
    delivery_deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] // 3 days from now
  });

  const handlePostLoadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoadData.origin || !newLoadData.destination) {
      toast.error("Please select both origin and destination cities.");
      return;
    }
    if (newLoadData.origin === newLoadData.destination) {
      toast.error("Origin and destination cities cannot be the same.");
      return;
    }
    
    addLoad(newLoadData);
    setIsPostLoadOpen(false);
    toast.success(`Load requirement from ${newLoadData.origin} to ${newLoadData.destination} posted successfully!`);
    
    // Reset form to defaults
    setNewLoadData({
      origin: '',
      destination: '',
      weight_kg: 5000,
      price_inr: 15000,
      delivery_deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    });
  };

  const pendingLoads = loads.filter(l => l.status === 'pending');
  const activeLoads = loads.filter(l => l.status === 'assigned' || l.status === 'in_transit');
  const totalRevenue = loads.reduce((sum, l) => sum + l.price_inr, 0);
  const averagePrice = loads.length > 0 ? totalRevenue / loads.length : 0;

  const filteredLoads = loads.filter(l => 
    l.origin.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <section className="relative h-64 rounded-2xl overflow-hidden">
          <img 
            src={IMAGES.WAREHOUSE_OPS_3} 
            alt="Warehouse Operations" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Load Management</h1>
            <p className="text-muted-foreground max-w-xl">
              Real-time dispatching and load tracking across the NH-44 and NH-48 corridors. 
              Optimize your empty miles with AI-assisted matching.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Available Loads"
            value={pendingLoads.length.toString()}
            icon={<Package className="h-5 w-5 text-amber-500" />}
            change="+12% from yesterday"
          />
          <MetricCard 
            title="In Transit"
            value={activeLoads.length.toString()}
            icon={<Truck className="h-5 w-5 text-primary" />}
            change="On schedule"
          />
          <MetricCard 
            title="Avg. Load Value"
            value={`₹${Math.round(averagePrice).toLocaleString()}`}
            icon={<Clock className="h-5 w-5 text-emerald-500" />}
          />
          <MetricCard 
            title="Total Pipeline"
            value={`₹${totalRevenue.toLocaleString()}`}
            icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
            change="Active contracts"
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Pending Assignments
            </h2>
            <Button variant="outline" size="sm">
              View Market Map
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pendingLoads.length > 0 ? (
              pendingLoads.map((load) => (
                <div key={load.id} className="group relative">
                  <LoadCard load={load} />
                  <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-sm">
                    <Button 
                      onClick={() => setSelectedLoadId(load.id)}
                      className="shadow-lg"
                    >
                      Assign Vehicle
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">No pending loads found. High fleet utilization detected.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">All Loads</h2>
              <p className="text-sm text-muted-foreground">Complete history of shipments and pending offers</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search routes..."
                  className="pl-10 w-[240px] bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setIsPostLoadOpen(true)}>
                <Plus className="h-4 w-4" /> Post Load
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoads.map((load) => (
                  <TableRow key={load.id} className="group">
                    <TableCell className="font-mono text-xs">{load.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{load.origin}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{load.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell>{(load.weight_kg / 1000).toFixed(1)} Tons</TableCell>
                    <TableCell className="font-mono">₹{load.price_inr.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{load.delivery_deadline}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(load.status)}>
                        {load.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedLoadId} onOpenChange={(open) => !open && setSelectedLoadId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Vehicle to Load</DialogTitle>
            <DialogDescription>
              Select an available vehicle from your fleet to fulfill this shipment. AI suggests vehicles based on proximity and fuel efficiency.
            </DialogDescription>
          </DialogHeader>
          {selectedLoadId && (
            <LoadAssignmentForm 
              loadId={selectedLoadId} 
              onAssign={(vehicleId) => {
                assignLoad(selectedLoadId, vehicleId);
                setSelectedLoadId(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPostLoadOpen} onOpenChange={setIsPostLoadOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Post New Load Requirement</DialogTitle>
            <DialogDescription>
              Create a new cargo routing request. Available vehicles in the area will be alerted immediately.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePostLoadSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin City</label>
              <select
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={newLoadData.origin}
                onChange={e => setNewLoadData(prev => ({ ...prev, origin: e.target.value }))}
                required
              >
                <option value="">Select Origin City</option>
                {INDIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination City</label>
              <select
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={newLoadData.destination}
                onChange={e => setNewLoadData(prev => ({ ...prev, destination: e.target.value }))}
                required
              >
                <option value="">Select Destination City</option>
                {INDIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newLoadData.weight_kg}
                  onChange={e => setNewLoadData(prev => ({ ...prev, weight_kg: Number(e.target.value) }))}
                  min={1}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹ INR)</label>
                <input
                  type="number"
                  className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={newLoadData.price_inr}
                  onChange={e => setNewLoadData(prev => ({ ...prev, price_inr: Number(e.target.value) }))}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Deadline</label>
              <input
                type="date"
                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={newLoadData.delivery_deadline}
                onChange={e => setNewLoadData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-4" size="lg">
              Post Load Offer
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
