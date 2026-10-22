import { motion } from "framer-motion";
import { Truck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { IMAGES } from "@/assets/images";
import { ROUTE_PATHS } from "@/lib/index";
import { LoginForm } from "@/components/Forms";
import { Button } from "@/components/ui/button";

export default function LoginDriver() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url(${IMAGES.HERO_LOGISTICS_3})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/50 via-transparent to-background/70" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md px-6"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Link 
            to={ROUTE_PATHS.HOME} 
            className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Gateway
          </Link>

          <div className="mb-4 rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
            <Truck className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Driver Portal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access your route, load details, and AI navigation assistance.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-md">
          <LoginForm role="driver" />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Need Assistance?
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={ROUTE_PATHS.SUPPORT}>Emergency</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={ROUTE_PATHS.LOGIN_OPERATOR}>Operator Login</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 AI Path Logistics. Adaptive Processes for the Indian Highway Network.
          </p>
        </footer>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
