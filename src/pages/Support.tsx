import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ShieldAlert,
  MapPin,
  LifeBuoy,
  Ambulance,
  Wrench,
  Navigation,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SupportTicketCard } from '@/components/Cards';
import { SupportTicketForm } from '@/components/Forms';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { EMERGENCY_CONTACTS, SupportTicketType } from '@/lib';
import { IMAGES } from '@/assets/images';
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Support = () => {
  const { tickets, createTicket, isLoading, error } = useSupportTickets();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleTicketSubmit = async (data: {
    type: SupportTicketType;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }) => {
    try {
      await createTicket(data);
      setIsFormOpen(false);
      setSuccessMessage('Ticket created successfully. Help is on the way.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden h-[300px] flex items-center">
          <img
            src={IMAGES.HERO_LOGISTICS_8}
            alt="Indian Highway Logistics Support"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="relative z-10 px-8 max-w-2xl space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/20 backdrop-blur-sm">
              24/7 Fleet Assistance
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Logistics Support <span className="text-primary">Center</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Emergency and operational assistance for the AI Path fleet across the Indian highway network.
            </p>
          </div>
        </section>

        {/* Emergency Hotline Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <Phone className="text-destructive w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-destructive">Emergency Hotline</h2>
              <p className="text-muted-foreground">Immediate roadside or accident assistance available 24/7</p>
            </div>
          </div>
          <a
            href={`tel:${EMERGENCY_CONTACTS.HOTLINE}`}
            className="text-3xl font-mono font-bold text-destructive hover:scale-105 transition-transform"
          >
            {EMERGENCY_CONTACTS.HOTLINE}
          </a>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Tickets */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <LifeBuoy className="w-6 h-6 text-primary" />
                Support Tickets
              </h3>
              <Button
                onClick={() => setIsFormOpen(!isFormOpen)}
                variant={isFormOpen ? 'outline' : 'default'}
                className="shadow-lg"
              >
                {isFormOpen ? 'Cancel Request' : 'Raise New Ticket'}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-600 p-4 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {successMessage}
                </motion.div>
              )}

              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card border rounded-xl p-6 shadow-xl"
                >
                  <h4 className="text-lg font-semibold mb-4">Submit Assistance Request</h4>
                  <SupportTicketForm onSubmit={handleTicketSubmit} />
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Your current GPS location will be automatically attached to this ticket.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-muted-foreground">
                  <Clock className="w-10 h-10 animate-spin" />
                  <p>Loading active tickets...</p>
                </div>
              ) : tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <motion.div key={ticket.id} variants={staggerItem}>
                    <SupportTicketCard ticket={ticket} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                  <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active support tickets found.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar: Emergency Contacts & Info */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-primary/20 shadow-lg bg-primary/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Emergency Directory
                </CardTitle>
                <CardDescription>Indian national emergency services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Police</span>
                  </div>
                  <a href={`tel:${EMERGENCY_CONTACTS.POLICE}`} className="font-mono font-bold text-primary">
                    {EMERGENCY_CONTACTS.POLICE}
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-3">
                    <Ambulance className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Ambulance</span>
                  </div>
                  <a href={`tel:${EMERGENCY_CONTACTS.AMBULANCE}`} className="font-mono font-bold text-primary">
                    {EMERGENCY_CONTACTS.AMBULANCE}
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Roadside Help</span>
                  </div>
                  <a href={`tel:${EMERGENCY_CONTACTS.ROADSIDE_ASSISTANCE}`} className="font-mono font-bold text-primary">
                    1800-ROAD
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  Route Safety Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold mb-1">NH-44 (North-South Corridor)</p>
                    <p className="text-xs text-muted-foreground">Current status: Heavy fog near Ludhiana. Drive with caution.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold mb-1">NH-48 (Delhi-Mumbai)</p>
                    <p className="text-xs text-muted-foreground">Construction alert near Jaipur bypass. Expect 20 min delays.</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full text-xs" size="sm">
                  View Live Traffic Map <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <div className="p-4 rounded-xl border bg-accent/50 space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                Response Time Commitment
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI Path Logistics commits to a <span className="font-bold text-foreground">15-minute response time</span> for all critical tickets and a <span className="font-bold text-foreground">45-minute on-site assistance</span> arrival for breakdowns within major corridors (NH-44, NH-48).
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Copyright */}
      <footer className="mt-12 py-6 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 AI Path Logistics Agent. Built for Indian Roadways.</p>
      </footer>
    </Layout>
  );
};

export default Support;