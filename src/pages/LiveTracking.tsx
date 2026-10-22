import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { getDistance } from 'geolib';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Play, Square, Navigation, Clock, Gauge, Map as MapIcon, Layers, Satellite, Mountain } from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface LocationPoint {
  lat: number;
  lng: number;
}

interface VehicleData {
  id: string;
  lat: number;
  lng: number;
  last_updated: number;
  speed_kmh: number;
  history: LocationPoint[];
  color: string;
}

type MapStyle = 'streets' | 'satellite' | 'topo';

const MAP_LAYERS: Record<MapStyle, { name: string; url: string; attribution: string; maxZoom: number }> = {
  streets: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and GIS User Community',
    maxZoom: 18
  },
  topo: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  }
};

const BACKEND_URL = "http://127.0.0.1:5000";

// Hub definitions for markers
const HUB_DEFINITIONS = [
  { id: "TRK-1000", color: "#EF4444", name: "Mumbai ↔ Delhi", start: { lat: 19.0760, lng: 72.8777, name: "Mumbai Hub" }, end: { lat: 28.7041, lng: 77.1025, name: "Delhi Hub" } },
  { id: "TRK-1001", color: "#3B82F6", name: "Bangalore ↔ Hyderabad", start: { lat: 12.9716, lng: 77.5946, name: "Bangalore Hub" }, end: { lat: 17.3850, lng: 78.4867, name: "Hyderabad Hub" } },
  { id: "TRK-1002", color: "#10B981", name: "Pune ↔ Chennai", start: { lat: 18.5204, lng: 73.8567, name: "Pune Hub" }, end: { lat: 13.0827, lng: 80.2707, name: "Chennai Hub" } },
  { id: "TRK-1003", color: "#F59E0B", name: "Kolkata ↔ Mumbai", start: { lat: 22.5726, lng: 88.3639, name: "Kolkata Hub" }, end: { lat: 19.0760, lng: 72.8777, name: "Mumbai Hub" } }
];

const SIMULATION_INTERVAL = 2000;

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  });
};

const createHubIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: 'hub-marker',
    html: `
      <div style="position: relative;">
        <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 3px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); transform: rotate(45deg);"></div>
        ${label ? `<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: black; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; white-space: nowrap; font-weight: bold;">${label}</div>` : ''}
      </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
  });
};

const getPointAtDistance = (path: LocationPoint[], targetDistance: number) => {
  let accumulatedDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segmentDistance = getDistance(p1, p2);
    
    if (accumulatedDistance + segmentDistance >= targetDistance) {
      const remainingDistance = targetDistance - accumulatedDistance;
      const ratio = remainingDistance / segmentDistance;
      return {
        lat: p1.lat + (p2.lat - p1.lat) * ratio,
        lng: p1.lng + (p2.lng - p1.lng) * ratio
      };
    }
    accumulatedDistance += segmentDistance;
  }
  return path[path.length - 1];
};

const getTotalDistance = (path: LocationPoint[]) => {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += getDistance(path[i], path[i + 1]);
  }
  return total;
};

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState<Record<string, VehicleData>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roadPaths, setRoadPaths] = useState<LocationPoint[][]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch high-resolution road-snapped coordinates
    fetch('/routes.json')
      .then(res => res.json())
      .then(data => {
        setRoadPaths(data);
        setIsLoadingPaths(false);
      })
      .catch(err => {
        console.error("Failed to load road paths", err);
        setIsLoadingPaths(false);
        toast.error("Road-snap data unavailable. Using fallbacks.");
      });

    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success("Connected to tracking server");
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error("Disconnected from tracking server");
    });

    newSocket.on('initial_data', (data: { vehicles: VehicleData[] }) => {
      const vDict: Record<string, VehicleData> = {};
      data.vehicles.forEach(v => vDict[v.id] = v);
      setVehicles(vDict);
    });

    newSocket.on('vehicle_updated', (vehicle: VehicleData) => {
      setVehicles(prev => ({ ...prev, [vehicle.id]: vehicle }));
    });

    newSocket.on('locations_cleared', () => {
      setVehicles({});
    });

    return () => {
      newSocket.close();
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      setIsSimulating(false);
      toast.info("Simulation stopped");
    } else {
      if (roadPaths.length === 0) {
        toast.error("Road data still loading. Please wait.");
        return;
      }

      fetch(`${BACKEND_URL}/clear_locations`, { method: 'POST' }).catch(console.error);
      
      const simState = HUB_DEFINITIONS.map((r, idx) => {
        const waypoints = roadPaths[idx] || [r.start, r.end];
        return {
          id: r.id,
          color: r.color,
          waypoints: waypoints,
          totalDistance: getTotalDistance(waypoints),
          distanceTraveled: 0,
          direction: 1
        };
      });

      simulationRef.current = setInterval(() => {
        simState.forEach(v => {
          const speedKmph = 70 + Math.random() * 40;
          const distanceIn2Seconds = (speedKmph / 3.6) * 2; 
          
          v.distanceTraveled += v.direction * distanceIn2Seconds;
          
          if (v.distanceTraveled >= v.totalDistance) {
            v.distanceTraveled = v.totalDistance;
            v.direction = -1;
          } else if (v.distanceTraveled <= 0) {
            v.distanceTraveled = 0;
            v.direction = 1;
          }
          
          const currentPos = getPointAtDistance(v.waypoints, v.distanceTraveled);
          
          fetch(`${BACKEND_URL}/update_location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               vehicle_id: v.id,
               lat: currentPos.lat,
               lng: currentPos.lng,
               color: v.color
            })
          }).catch(err => console.error("Update failed", err));
        });
      }, SIMULATION_INTERVAL);
      
      setIsSimulating(true);
      toast.success("Simulation started with road-snapped tracking");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 rounded-t-xl border border-border shadow-sm gap-4 z-10">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" />
              Live Fleet Tracking
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              Server Status: 
              <span className={`flex h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'} | 
              <span className="flex items-center gap-1 ml-2">
                <MapIcon className="h-3 w-3" />
                {isLoadingPaths ? 'Loading road data...' : 'Road-snapping active'}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Map Style Selector */}
            <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setMapStyle('streets')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  mapStyle === 'streets' 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="OpenStreetMap Standard (Free, High-Res)"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Street</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('satellite')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  mapStyle === 'satellite' 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Esri World Imagery Satellite"
              >
                <Satellite className="h-3.5 w-3.5" />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapStyle('topo')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  mapStyle === 'topo' 
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="OpenTopoMap Terrain"
              >
                <Mountain className="h-3.5 w-3.5" />
                <span>Terrain</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-4 mr-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-emerald-500" />
                <span>70-110 kmph (Highway Speed)</span>
              </div>
            </div>

            <Button 
              onClick={toggleSimulation}
              disabled={isLoadingPaths}
              variant={isSimulating ? "destructive" : "default"}
              className="flex-1 sm:flex-none shadow-lg"
            >
              {isSimulating ? (
                <><Square className="mr-2 h-4 w-4" /> Stop Simulation</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Start Simulation</>
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full relative rounded-b-xl overflow-hidden border-x border-b border-border shadow-inner bg-slate-900 z-0">
          <MapContainer 
            center={[21.1458, 79.0882]} 
            zoom={5} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              key={mapStyle}
              attribution={MAP_LAYERS[mapStyle].attribution}
              url={MAP_LAYERS[mapStyle].url}
              maxZoom={MAP_LAYERS[mapStyle].maxZoom}
            />

            {/* Render Highway Corridors & Hubs */}
            {HUB_DEFINITIONS.map((hub, idx) => {
              const waypoints = roadPaths[idx] || [hub.start, hub.end];
              return (
                <React.Fragment key={hub.id}>
                  <Marker position={[hub.start.lat, hub.start.lng]} icon={createHubIcon('#475569', hub.start.name)}>
                    <Popup className="font-bold">{hub.start.name}</Popup>
                  </Marker>
                  <Marker position={[hub.end.lat, hub.end.lng]} icon={createHubIcon('#475569', hub.end.name)}>
                    <Popup className="font-bold">{hub.end.name}</Popup>
                  </Marker>
                  
                  <Polyline 
                    positions={waypoints.map(w => [w.lat, w.lng])} 
                    pathOptions={{ color: '#94a3b8', weight: 3, dashArray: "10, 15", opacity: 0.4 }} 
                  />
                </React.Fragment>
              );
            })}

            {/* Render Active Vehicles */}
            {Object.values(vehicles).map((v) => (
              <React.Fragment key={v.id}>
                <Marker 
                  position={[v.lat, v.lng]} 
                  icon={createCustomIcon(v.color)}
                >
                  <Popup>
                    <div className="min-w-[180px] text-slate-800">
                      <div className="flex items-center gap-2 mb-2 border-b pb-1">
                        <div className="h-3 w-3 rounded-full" style={{backgroundColor: v.color}}></div>
                        <h3 className="font-bold text-lg">{v.id}</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-slate-500 font-medium">Live Speed:</span> 
                          <span className="font-mono text-emerald-600 font-bold">{v.speed_kmh} km/h</span>
                        </div>
                        <p className="flex justify-between px-1">
                          <span className="text-slate-500 font-medium text-xs">Coordinates:</span> 
                          <span className="font-mono text-[10px]">{v.lat.toFixed(4)}, {v.lng.toFixed(4)}</span>
                        </p>
                        <p className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                          <span><Clock className="h-3 w-3 inline mr-1"/> Last update:</span>
                          <span>{new Date(v.last_updated * 1000).toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {v.history.length > 1 && (
                  <Polyline 
                    positions={v.history.map(pt => [pt.lat, pt.lng])} 
                    pathOptions={{ color: v.color, weight: 6, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} 
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>
    </Layout>
  );
};

export default LiveTracking;
