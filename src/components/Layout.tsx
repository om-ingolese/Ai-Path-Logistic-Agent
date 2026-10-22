import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  Box,
  BarChart3,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  ChevronRight,
  ShieldCheck,
  Package,

} from 'lucide-react';
import { ROUTE_PATHS, UserRole } from '@/lib/index';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Identify if we are on a dashboard-related page to show the sidebar
  const isDashboardPage = [
    ROUTE_PATHS.DASHBOARD,
    ROUTE_PATHS.FLEET,
    ROUTE_PATHS.LOADS,
    ROUTE_PATHS.ANALYTICS,
    ROUTE_PATHS.SUPPORT
  ].some(path => location.pathname === path);

  const navItems = [
    { label: 'Dashboard', path: ROUTE_PATHS.DASHBOARD, icon: LayoutDashboard, roles: ['operator', 'driver', 'supplier'] },
    { label: 'Fleet', path: ROUTE_PATHS.FLEET, icon: Truck, roles: ['operator'] },
    { label: 'Loads', path: ROUTE_PATHS.LOADS, icon: Box, roles: ['operator', 'supplier'] },
    { label: 'Analytics', path: ROUTE_PATHS.ANALYTICS, icon: BarChart3, roles: ['operator'] },

    { label: 'Support Center', path: ROUTE_PATHS.SUPPORT, icon: LifeBuoy, roles: ['operator', 'driver', 'supplier'] },
  ].filter(item => !user?.role || item.roles.includes(user.role));

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'operator': return <ShieldCheck className="w-4 h-4 text-primary" />;
      case 'supplier': return <Package className="w-4 h-4 text-primary" />;
      default: return <Truck className="w-4 h-4 text-primary" />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Truck className="text-primary-foreground w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight leading-none">AI PATH</h1>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Logistics Agent</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <div className="bg-sidebar-accent/50 rounded-xl p-4 border border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10 border border-primary/20">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.full_name || 'Guest'}</p>
              <div className="flex items-center gap-1.5">
                {getRoleIcon(user?.role)}
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono text-sm animate-pulse">Initializing Adaptive Process...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {isAuthenticated && isDashboardPage && (
        <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30">
          <SidebarContent />
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 md:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            {isAuthenticated && isDashboardPage ? (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-none">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            ) : (
              <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="text-primary-foreground w-5 h-5" />
                </div>
              </Link>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to={ROUTE_PATHS.LOGIN_OPERATOR}>
                  <Button variant="ghost" size="sm">Operator Login</Button>
                </Link>
                <Link to={ROUTE_PATHS.LOGIN_DRIVER}>
                  <Button variant="default" size="sm">Driver Portal</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <p className="text-[10px] font-mono text-muted-foreground leading-none mb-1">CURRENT CORRIDOR</p>
                  <p className="text-xs font-semibold">NH-44 North-South</p>
                </div>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
                </Button>
                <Separator orientation="vertical" className="h-6 hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="hidden md:block">
                    <p className="text-sm font-medium leading-none">{user?.company_name || 'Fleet Admin'}</p>
                  </div>
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarFallback className="bg-muted text-xs">{user?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-x-hidden">
          <div className={cn(
            "flex-1 p-4 md:p-8 transition-all duration-300",
            isDashboardPage ? "max-w-7xl mx-auto w-full" : "w-full"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - Only for non-dashboard pages or generic pages */}
          {!isDashboardPage && (
            <footer className="py-12 px-8 border-t border-border bg-muted/30">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="text-primary w-6 h-6" />
                    <span className="font-bold text-xl tracking-tight">AI Path Logistics</span>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Empowering the Indian logistics industry with real-time AI agents for adaptive process management on every highway corridor.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">System</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to={ROUTE_PATHS.HOME} className="hover:text-primary transition-colors">Home</Link></li>
                    <li><Link to={ROUTE_PATHS.LOGIN_OPERATOR} className="hover:text-primary transition-colors">Operator Portal</Link></li>
                    <li><Link to={ROUTE_PATHS.LOGIN_DRIVER} className="hover:text-primary transition-colors">Driver App</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to={ROUTE_PATHS.SUPPORT} className="hover:text-primary transition-colors">Emergency Help</Link></li>
                    <li><span className="text-primary font-mono">1800-LOGISTICS</span></li>
                    <li className="text-xs">© 2026 AI Path Agent</li>
                  </ul>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
