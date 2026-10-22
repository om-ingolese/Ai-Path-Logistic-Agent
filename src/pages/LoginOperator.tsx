import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { ROUTE_PATHS } from '@/lib/index';
import { LoginForm } from '@/components/Forms';

const LoginOperator: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background with Adaptive Depth Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGES.DASHBOARD_BG_1}
          alt="Logistics Operations"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
      </div>

      {/* Back to Home Button */}
      <Link
        to={ROUTE_PATHS.HOME}
        className="absolute top-8 left-8 z-10 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Gateway</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Fleet Operator
          </h1>
          <p className="text-muted-foreground">
            Access the AI Path Control Center
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-primary/5">
          <LoginForm role="operator" />
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Need another portal?{' '}
            <Link
              to={ROUTE_PATHS.LOGIN_DRIVER}
              className="text-primary hover:underline font-medium"
            >
              Driver Login
            </Link>
            {' • '}
            <Link
              to={ROUTE_PATHS.LOGIN_SUPPLIER}
              className="text-primary hover:underline font-medium"
            >
              Supplier Login
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/50 font-mono tracking-widest uppercase">
            © 2026 AI PATH LOGISTICS AGENT
          </p>
        </div>
      </motion.div>

      {/* Decorative Rim Light Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </div>
  );
};

export default LoginOperator;