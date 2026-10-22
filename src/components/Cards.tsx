import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Fuel, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  Vehicle, 
  Load, 
  AIDecision, 
  SupportTicket 
} from "@/lib/index";
import { cn } from "@/lib/utils";

// --- Metric Card ---

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: React.ReactNode 
}) {
  const isPositive = change?.startsWith('+');
  
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {change && (
          <p className={cn(
            "text-xs mt-1 flex items-center gap-1",
            isPositive ? "text-emerald-500" : "text-destructive"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Vehicle Card ---

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const navigate = useNavigate();
  const fuelColor = vehicle.fuel_level < 20 ? "bg-destructive" : vehicle.fuel_level < 50 ? "bg-amber-500" : "bg-emerald-500";
  const utilization = Math.round((vehicle.current_load_kg / vehicle.capacity_kg) * 100);

  return (
    <Card className="relative group border-border/40 hover:border-primary/40 transition-all duration-300">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-lg font-bold uppercase tracking-wider text-primary">
              {vehicle.plate_number}
            </div>
            <CardDescription className="text-xs">{vehicle.model}</CardDescription>
          </div>
          <Badge 
            variant={
              vehicle.status === 'moving' || vehicle.status === 'loading' ? 'default' : 
              vehicle.status === 'delayed' ? 'destructive' : 
              'secondary'
            }
            className="capitalize"
          >
            {vehicle.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> Fuel Level</span>
            <span>{vehicle.fuel_level}%</span>
          </div>
          <Progress value={vehicle.fuel_level} className="h-1.5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Load Utilization</span>
            <span>{utilization}%</span>
          </div>
          <Progress value={utilization} className="h-1.5" />
        </div>

        <div className="flex items-center gap-2 text-sm pt-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{vehicle.current_location.city}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs font-semibold group-hover:text-primary"
          onClick={() => navigate('/live-tracking')}
        >
          Track Real-time
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Load Card ---

export function LoadCard({ load }: { load: Load }) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(load.price_inr);

  return (
    <Card className="border-border/40 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="font-mono text-[10px]">ID: {load.id.slice(0, 8)}</Badge>
          <div className="text-lg font-bold text-primary">{formattedPrice}</div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground uppercase tracking-tighter">Origin</div>
            <div className="font-semibold text-sm">{load.origin}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-tighter">Destination</div>
            <div className="font-semibold text-sm">{load.destination}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">Deadline</span>
              <span className="font-medium text-xs">{new Date(load.delivery_deadline).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground leading-none">Weight</span>
              <span className="font-medium text-xs">{(load.weight_kg / 1000).toFixed(1)} Tons</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/30 py-2 border-t border-border/50 flex justify-between items-center">
        <Badge 
          variant={load.status === 'pending' ? 'secondary' : load.status === 'in_transit' ? 'default' : 'outline'}
          className="text-[10px]"
        >
          {load.status.replace('-', ' ')}
        </Badge>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- AI Decision Card ---

export function AIDecisionCard({ 
  decision, 
  onExecute, 
  onDismiss 
}: { 
  decision: AIDecision;
  onExecute?: () => void;
  onDismiss?: () => void;
}) {
  const formattedImpact = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    signDisplay: 'always',
  }).format(decision.profit_impact_inr);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="relative border-primary/20 bg-primary/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-12 h-12 text-primary" />
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary text-primary-foreground">
              AI SUGGESTION
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">
              {new Date(decision.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <CardTitle className="text-md mt-2">{decision.type.replace('_', ' ')}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2 italic">
            "{decision.reason}"
          </p>
          
          <div className="flex items-center justify-between p-2 rounded-md bg-background/80 border border-primary/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase">Est. Profit Impact</span>
              <span className="text-sm font-bold text-emerald-500">{formattedImpact}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase">Impact Score</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-sm font-bold">{decision.impact_score}/100</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          {decision.status === 'pending' ? (
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={onExecute}
                disabled={!onExecute}
              >
                Apply Change
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={onDismiss}
                disabled={!onDismiss}
              >
                Dismiss
              </Button>
            </>
          ) : (
            <Badge 
              variant={decision.status === 'applied' ? 'default' : 'secondary'}
              className="w-full justify-center py-2"
            >
              {decision.status === 'applied' ? 'Applied' : 'Dismissed'}
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// --- Support Ticket Card ---

export function SupportTicketCard({ ticket }: { ticket: SupportTicket }) {
  const priorityColors = {
    low: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    medium: "border-amber-500/20 bg-amber-500/5 text-amber-500",
    high: "border-orange-500/20 bg-orange-500/5 text-orange-500",
    critical: "border-destructive/40 bg-destructive/5 text-destructive animate-pulse-subtle"
  };

  return (
    <Card className={cn("border-l-4 transition-all", priorityColors[ticket.priority])}>
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {ticket.priority === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertCircle className="w-4 h-4" />}
            <div className="font-bold capitalize">{ticket.type.replace('_', ' ')}</div>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {ticket.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <p className="text-sm text-foreground/80 mb-3">
          {ticket.description}
        </p>
        
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{ticket.location.address || `${ticket.location.lat}, ${ticket.location.lng}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Reported {new Date(ticket.created_at).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/10 py-2 bg-muted/5">
        <Button variant="ghost" size="sm" className="w-full text-xs">
          View Full Incident Report
        </Button>
      </CardFooter>
    </Card>
  );
}
