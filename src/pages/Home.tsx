import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Shield, 
  Package, 
  ArrowRight, 
  Zap, 
  MapPin, 
  BarChart3, 
  Clock,
  Globe
} from 'lucide-react';
import { ROUTE_PATHS } from '@/lib/index';
import { IMAGES } from '@/assets/images';
import { Button } from '@/components/ui/button';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="text-primary-foreground w-6 h-6 fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">
              Path <span className="text-primary">Agent</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#roles" className="text-sm font-medium hover:text-primary transition-colors">Solutions</a>
            <Button asChild variant="default" className="rounded-full px-6">
              <Link to={ROUTE_PATHS.LOGIN_OPERATOR}>Fleet Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={IMAGES.HERO_LOGISTICS_2} 
              alt="Indian Highway Logistics" 
              className="w-full h-full object-cover opacity-40 grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary tracking-widest uppercase">AI-Driven Network 2026</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
                Logistics as an <br />
                <span className="text-primary italic">Adaptive Process</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                Bridge the gap between high-frequency AI decisions and the rugged reality of Indian roads. Optimize NH-44 routes in real-time with Path Agent.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full px-8 gap-2 shadow-xl shadow-primary/20">
                  <Link to={ROUTE_PATHS.LOGIN_OPERATOR}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  View Live Map
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="roles" className="py-24 bg-muted/30">
          <div className="w-full max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Access Path</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Integrated ecosystem for every stakeholder in the logistics lifecycle.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div variants={itemVariants} className="group">
                <Link to={ROUTE_PATHS.LOGIN_OPERATOR} className="block h-full">
                  <div className="bg-card border border-border p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40 h-full flex flex-col">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Shield className="text-primary w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Fleet Operator</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                      Manage your entire fleet, monitor real-time AI rerouting, and optimize fuel efficiency across Indian corridors.
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm gap-1 group-hover:gap-3 transition-all">
                      Access Dashboard <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="group">
                <Link to={ROUTE_PATHS.LOGIN_DRIVER} className="block h-full">
                  <div className="bg-card border border-border p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40 h-full flex flex-col">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Truck className="text-primary w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Driver Interface</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                      Simplified navigation, real-time load updates, and emergency support for long-haul journeys across NH-48.
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm gap-1 group-hover:gap-3 transition-all">
                      Join the Route <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="group">
                <Link to={ROUTE_PATHS.LOGIN_SUPPLIER} className="block h-full">
                  <div className="bg-card border border-border p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40 h-full flex flex-col">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Package className="text-primary w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Load Supplier</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                      Instant load matching, transparent pricing in INR, and real-time tracking of your shipments from origin to destination.
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm gap-1 group-hover:gap-3 transition-all">
                      Post a Load <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center mb-24">
              <div className="flex-1 order-2 lg:order-1">
                <img 
                  src={IMAGES.FLEET_MANAGEMENT_3} 
                  alt="Advanced Fleet Management" 
                  className="rounded-3xl shadow-2xl border border-border ring-1 ring-white/10"
                />
              </div>
              <div className="flex-1 order-1 lg:order-2">
                <h2 className="text-4xl font-bold mb-6 tracking-tight">Intelligent Fleet Synchronization</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Our AI Path Agent processes millions of data points from Indian traffic patterns, fuel station density, and weather conditions to ensure your fleet is always moving optimally.
                </p>
                <ul className="space-y-4">
                  {[ 
                    { icon: MapPin, text: "Dynamic NH-44/48 Corridor Rerouting" },
                    { icon: BarChart3, text: "Real-time Profitability Impact Analysis" },
                    { icon: Clock, text: "99.2% On-Time Delivery Guarantee" }
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <feat.icon className="text-primary w-5 h-5" />
                      </div>
                      <span className="font-medium">{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2 className="text-4xl font-bold mb-6 tracking-tight">Unified Warehouse & Transit</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Seamless integration between terminal operations and highway transit. Adaptive processes ensure that load matching happens before the truck even reaches the city limits.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-3xl font-bold text-primary mb-1">40%</div>
                    <div className="text-sm text-muted-foreground font-medium">Reduction in Empty Miles</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <div className="text-3xl font-bold text-primary mb-1">15%</div>
                    <div className="text-sm text-muted-foreground font-medium">Fuel Cost Savings</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <img 
                  src={IMAGES.WAREHOUSE_OPS_1} 
                  alt="Warehouse Operations" 
                  className="rounded-3xl shadow-2xl border border-border ring-1 ring-white/10"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary">
          <div className="w-full max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-8 tracking-tight">
              Ready to adapt your logistics?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold">
                <Link to={ROUTE_PATHS.LOGIN_OPERATOR}>Launch Platform</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                Talk to Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border py-12">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Zap className="text-primary-foreground w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-lg tracking-tight">PATH AGENT</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                The world's first adaptive logistics platform designed for the unique challenges of the Indian trucking industry.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Fleet Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">AI Rerouting</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Load Board</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2026 AI Path Logistics Agent. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" />
                <span>India (INR)</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
