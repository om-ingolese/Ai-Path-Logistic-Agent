import * as React from "react";

// Runtime import of the real library under a different name (see vite.config alias)
// @ts-expect-error - This is resolved at runtime by Vite alias
import * as RRD from "react-router-dom-original";

// Re-export everything so other imports keep working
// @ts-expect-error - This is resolved at runtime by Vite alias
export * from "react-router-dom-original";

/** --------------------- Outbound: route list (once) --------------------- */
let routesPosted = false;

// Create a promise that resolves once routes are posted
let resolveRoutesReady: (() => void) | null = null;
const routesReadyPromise = new Promise<void>((res) => {
  resolveRoutesReady = res;
});

// Optional: avoid waiting forever if <Routes> never mounts
const routesReadyOrTimeout = (ms = 1200) =>
  Promise.race([routesReadyPromise, new Promise<void>((r) => setTimeout(r, ms))]);

type AnyEl = React.ReactNode;

function normalize(p: string) { 
  return p.replace(/\/+/g, "/"); 
}

function join(base: string, child?: string) {
  if (!child) return base || "";
  if (child.startsWith("/")) return child;
  return normalize(`${base.replace(/\/$/, "")}/${child}`);
}

function flattenRoutes(node: AnyEl, base = "", acc = new Set<string>()) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const isRoute = child.type === (RRD as any).Route ||
      (typeof child.type === "function" && (child.type as any).name === "Route");
    if (isRoute) {
      const { path, index, children } = (child.props ?? {}) as { 
        path?: string; 
        index?: boolean; 
        children?: AnyEl; 
      };
      const cur = index ? (base || "/") : (path ? join(base, path) : base);
      if (index || path) acc.add(cur || "/");
      if (children) flattenRoutes(children, cur, acc);
    } else {
      const kids = (child.props as any)?.children;
      if (kids) flattenRoutes(kids, base, acc);
    }
  });
  return acc;
}

function postAllRoutesOnce(children: AnyEl) {
  if (routesPosted) return;
  try {
    const list = Array.from(flattenRoutes(children)).sort();
    
    // Always log routes in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Routes:', list);
    }
    
    // Check if route messaging is enabled
    if (!__ROUTE_MESSAGING_ENABLED__) {
      return;
    }
    
    if (window.top && window.top !== window) {
      // Use the same format as ROUTES_INFO in use-route-messenger
      const routesForMessage = list.map(route => ({
        path: route
      }));

      const routesMessage = {
        type: 'ROUTES_INFO',
        routes: routesForMessage,
        timestamp: Date.now()
      };

      window.top.postMessage(routesMessage, "*");
    }
  } finally {
    routesPosted = true;
    // signal readiness exactly once
    resolveRoutesReady?.();
    resolveRoutesReady = null;
  }
}

/** Our patched <Routes/>: same API, just posts route list once. */
export function Routes(props: React.ComponentProps<typeof RRD.Routes>) {
  React.useEffect(() => { postAllRoutesOnce(props.children); }, []);
  return React.createElement(RRD.Routes, { ...props });
}

/** --------------------- Outbound: route change events --------------------- */
let lastEmittedPath = "";

function emitRouteChange(location: ReturnType<typeof RRD.useLocation>) {
  const path = `${location.pathname}${location.search}${location.hash}`;
  if (path === lastEmittedPath) return;
  lastEmittedPath = path;
  
  // Check if route messaging is enabled
  if (!__ROUTE_MESSAGING_ENABLED__) {
    return;
  }
  
  if (window.top && window.top !== window) {
    const routeChangeMessage = {
      type: 'ROUTE_CHANGE',
      path: location.pathname,
      hash: location.hash,
      search: location.search,
      fullPath: location.pathname + location.search + location.hash,
      fullUrl: window.location.href,
      timestamp: Date.now()
    };

    window.top.postMessage(routeChangeMessage, "*");
  }
}

/** --------------------- Inbound: commands from parent --------------------- */
type IframeCmd =
  | { type: "ROUTE_CONTROL"; action: "navigate"; path: string; replace?: boolean; }
  | { type: "ROUTE_CONTROL"; action: "back"; }
  | { type: "ROUTE_CONTROL"; action: "forward"; }
  | { type: "ROUTE_CONTROL"; action: "replace"; path: string; }
  | { type: "RELOAD"; };

/** A component that lives inside the router context and bridges both ways */
function RouterBridge(): null {
  const location = RRD.useLocation();
  const navigate = RRD.useNavigate();

  React.useEffect(() => {
    (async () => {
      // Ensure ROUTES_INFO is delivered first
      await routesReadyOrTimeout();   // waits for <Routes/> to post, or times out (dev-safety)
      emitRouteChange(location);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.search, location.hash]);

  React.useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as IframeCmd | any;
      if (!data) return;
      
      // Check if route messaging is enabled
      if (!__ROUTE_MESSAGING_ENABLED__) {
        return;
      }

      try {
        if (data.type === "ROUTE_CONTROL") {
          const { action, path, replace = false } = data;
          
          console.log('Received route control command:', data);

          switch (action) {
            case 'navigate':
              if (path) {
                navigate(path, { replace });
                console.log(`Navigated to: ${path} (replace: ${replace})`);
              } else {
                console.error('Route control: path is required for navigate action');
              }
              break;
              
            case 'back':
              navigate(-1);
              console.log('Navigated back');
              break;
              
            case 'forward':
              navigate(1);
              console.log('Navigated forward');
              break;
              
            case 'replace':
              if (path) {
                navigate(path, { replace: true });
                console.log(`Replaced route with: ${path}`);
              } else {
                console.error('Route control: path is required for replace action');
              }
              break;
              
            default:
              console.warn('Route control: unknown action', action);
          }
        } else if (data.type === "RELOAD") {
          window.location.reload();
          console.log('Reloaded');
        }
      } catch (error) {
        console.error('Route control error:', error);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  return null;
}

/** Wrap routers so the bridge lives inside router context, with zero app changes. */
// Make children mount before <RouterBridge/>, so <Routes/> effect runs first.
function withBridge(children: React.ReactNode) {
  return (
    <>
      {children}
      <RouterBridge />
    </>
  );
}

export function HashRouter(props: React.ComponentProps<typeof RRD.HashRouter>) {
  return <RRD.HashRouter {...props}>{withBridge(props.children)}</RRD.HashRouter>;
}

export function BrowserRouter(props: React.ComponentProps<typeof RRD.BrowserRouter>) {
  return <RRD.BrowserRouter {...props}>{withBridge(props.children)}</RRD.BrowserRouter>;
}

export function MemoryRouter(props: React.ComponentProps<typeof RRD.MemoryRouter>) {
  return <RRD.MemoryRouter {...props}>{withBridge(props.children)}</RRD.MemoryRouter>;
}
