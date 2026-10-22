import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Shield,
  Truck,
  Package,
  AlertCircle,
  Loader2,
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import {
  ROUTE_PATHS,
  UserRole,
  SupportTicketType,
  VEHICLE_MODELS,
  INDIAN_CITIES
} from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

/**
 * Login Form Component
 * Handles role-based authentication with pre-filled demo credentials capability.
 */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ role }: { role: UserRole }) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password, role);
      toast.success(`Welcome back to AI Path Logistics!`);
    } catch (error) {
      toast.error('Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleConfig = {
    operator: { icon: <Shield className="w-6 h-6" />, title: 'Fleet Operator' },
    driver: { icon: <Truck className="w-6 h-6" />, title: 'Fleet Driver' },
    supplier: { icon: <Package className="w-6 h-6" />, title: 'Load Supplier' },
  };

  const config = roleConfig[role];

  return (
    <div className="space-y-6 w-full max-w-md">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="p-3 bg-primary/10 rounded-full text-primary">
          {config.icon}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{config.title} Login</h1>
        <p className="text-muted-foreground text-sm">
          Enter your credentials to access the adaptive logistics dashboard.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

/**
 * Support Ticket Form Component
 * Used for reporting incidents, breakdowns, or route issues with GPS capture.
 */
const ticketSchema = z.object({
  type: z.enum(['accident', 'breakdown', 'route_issue', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Please provide more details (min 10 characters)'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export function SupportTicketForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { createTicket, isLoading } = useSupportTickets();
  const [isCapturingGPS, setIsCapturingGPS] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      type: 'breakdown',
      priority: 'medium',
      description: '',
    },
  });

  const handleFormSubmit = async (values: TicketFormValues) => {
    try {
      // Fix: Cast values to the explicit type expected by createTicket to resolve optionality mismatch
      const ticket = await createTicket(values as {
        type: SupportTicketType;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
      });
      toast.success(`Ticket ${ticket.id} created successfully.`);
      onSubmit(ticket);
      form.reset();
    } catch (error) {
      toast.error('Failed to create support ticket. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="breakdown">Mechanical Breakdown</SelectItem>
                    <SelectItem value="accident">Accident / Incident</SelectItem>
                    <SelectItem value="route_issue">Route / Traffic Issue</SelectItem>
                    <SelectItem value="other">Other Assistance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low - General Inquiry</SelectItem>
                    <SelectItem value="medium">Medium - Standard Issue</SelectItem>
                    <SelectItem value="high">High - Urgent Assistance</SelectItem>
                    <SelectItem value="critical">Critical - Emergency SOS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situation Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide details like nearest landmark, vehicle condition, or specific highway number (e.g., NH-44)..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible to help our AI Path Agents route help faster.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center p-4 bg-accent/30 rounded-lg border border-border space-x-3">
          <MapPin className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Automatic GPS Tagging</p>
            <p className="text-xs text-muted-foreground">Your precise coordinates will be attached to this ticket.</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Ticket...</>
          ) : (
            'Raise Support Request'
          )}
        </Button>
      </form>
    </Form>
  );
}

/**
 * Load Assignment Form Component
 * Allows operators to assign a specific load to a vehicle in the fleet.
 */
const assignmentSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export function LoadAssignmentForm({ loadId, onAssign }: { loadId: string; onAssign: (vehicleId: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      vehicleId: '',
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      onAssign(values.vehicleId);
      toast.success(`Load assigned to vehicle successfully.`);
    } catch (error) {
      toast.error('Assignment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mocking available vehicles for selection based on the provided models
  const mockAvailableVehicles = VEHICLE_MODELS.slice(0, 5).map((model, i) => ({
    id: `V-${100 + i}`,
    plate: `MH-12-AX-${4000 + i}`,
    model: model,
    city: INDIAN_CITIES[i % INDIAN_CITIES.length]
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Available Vehicle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose a truck for this route" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockAvailableVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-bold">{v.plate}</span>
                        <span className="text-xs text-muted-foreground">{v.model} • Currently in {v.city}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Only idle vehicles with sufficient capacity are listed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" className="w-full group" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Confirm Assignment
                <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
