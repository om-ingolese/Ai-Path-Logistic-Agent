import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS } from '@/lib';
import { LoginForm } from '@/components/Forms';
import { Badge } from '@/components/ui/badge';
import { springPresets } from '@/lib/motion';

/**
 * LoginSupplier Page
 * 
 * Provides the entry point for load suppliers to access the AI Path Logistics system.
 * Features high-quality warehouse imagery and a secure, industrial-themed login interface.
 */
export default function LoginSupplier() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Layer with Adaptive Depth */}
      <div
        className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat transition-transform duration-[30000ms] scale-110 animate-pulse-slow"
        style={{ backgroundImage: `url(${IMAGES.WAREHOUSE_OPS_2})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/60 via-background/20 to-background/80" />

      {/* Navigation Layer */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          to={ROUTE_PATHS.HOME}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Portal
        </Link>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springPresets.gentle}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/90 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden">
          {/* Subtle Top Rim Light */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="flex flex-col items-center text-center mb-10">
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-inner"
            >
              <Package className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">Supplier Access</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-[280px]">
              List inventory, track shipments, and optimize your supply chain in real-time.
            </p>
          </div>

          <div className="space-y-6">
            {/* Role-specific Login Form */}
            <LoginForm role="supplier" />
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge variant="secondary" className="font-medium text-[10px] uppercase tracking-widest bg-secondary/50">
                Enterprise Grade
              </Badge>
              <Badge variant="secondary" className="font-medium text-[10px] uppercase tracking-widest bg-secondary/50">
                Real-time Sync
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-tighter">
              © 2026 AI Path Logistics • Precision Engineering for Global Freight
            </p>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors underline-offset-4 hover:underline">Privacy Protocol</a>
          <a href="#" className="hover:text-primary transition-colors underline-offset-4 hover:underline">API Documentation</a>
          <a href="#" className="hover:text-primary transition-colors underline-offset-4 hover:underline">Compliance</a>
        </div>
      </motion.div>

      {/* Decorative Corner Element */}
      <div className="fixed bottom-0 right-0 p-8 opacity-20 pointer-events-none hidden lg:block">
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">System Status</p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="font-mono text-[10px] text-muted-foreground">OPERATIONAL: 255.4.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
