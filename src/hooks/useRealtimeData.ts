import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Vehicle, 
  Load, 
  AIDecision, 
  INDIAN_CITIES, 
  VEHICLE_MODELS, 
  VehicleStatus, 
  LoadStatus,
  AIDecisionType
} from '@/lib/index';

// Real-time data fetching and management (MOCK IMPLEMENTATION)

export function useRealtimeData() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise(r => setTimeout(r, 500));

      // MOCK DATA
      const mockVehicles: Vehicle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `V-${1000 + i}`,
        plate_number: `MH-12-AB-${1000 + i}`,
        model: VEHICLE_MODELS[i % VEHICLE_MODELS.length],
        status: (['moving', 'idle', 'loading', 'maintenance', 'delayed'][i % 5]) as VehicleStatus,
        fuel_level: Math.floor(Math.random() * 80) + 20,
        capacity_kg: 10000 + i * 1000,
        current_load_kg: Math.floor(Math.random() * 8000),
        current_location: {
          lat: 19.0760 + (Math.random() - 0.5),
          lng: 72.8777 + (Math.random() - 0.5),
          city: INDIAN_CITIES[i % INDIAN_CITIES.length]
        },
        last_maintenance: '2026-01-15'
      }));

      const mockLoads: Load[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `L-${2000 + i}`,
        origin: INDIAN_CITIES[i % INDIAN_CITIES.length],
        destination: INDIAN_CITIES[(i + 1) % INDIAN_CITIES.length],
        weight_kg: 2000 + i * 500,
        price_inr: 15000 + i * 1000,
        status: (['pending', 'assigned', 'in_transit'][i % 3]) as LoadStatus,
        pickup_date: '2026-05-05',
        delivery_deadline: '2026-05-10',
        supplier_id: 'S-1',
      }));

      setVehicles(mockVehicles);
      setLoads(mockLoads);
      setDecisions([]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Derived metrics for the dashboard
  const metrics = useMemo(() => {
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'moving' || v.status === 'loading').length;
    const utilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
    
    const totalRevenueINR = loads
      .filter(l => l.status === 'delivered' || l.status === 'in_transit')
      .reduce((sum, l) => sum + l.price_inr, 0);
      
    const onTimeDelivery = 94.2; 

    return {
      totalVehicles,
      utilizationRate,
      totalRevenueINR,
      onTimeDelivery,
    };
  }, [vehicles, loads]);

  useEffect(() => {
    fetchData();

    // Simulate real-time vehicle updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (Math.random() > 0.8 && v.status === 'moving') {
          return {
            ...v,
            fuel_level: Math.max(10, v.fuel_level - Math.random() * 2),
            current_location: {
              ...v.current_location,
              lat: v.current_location.lat + (Math.random() - 0.5) * 0.005,
              lng: v.current_location.lng + (Math.random() - 0.5) * 0.005,
            }
          };
        }
        return v;
      }));
    }, 10000); 

    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  const addVehicle = useCallback(async (data: { plate_number: string, departure: string, destination: string, fuel_level: number, utilization: number }) => {
    const capacity = 15000;
    const newVehicle: Vehicle = {
      id: `V-${Math.floor(10000 + Math.random() * 90000)}`,
      plate_number: data.plate_number,
      model: VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)],
      status: 'idle',
      fuel_level: data.fuel_level,
      capacity_kg: capacity,
      current_load_kg: Math.floor(capacity * (data.utilization / 100)),
      current_location: {
        lat: 19.0760 + (Math.random() - 0.5),
        lng: 72.8777 + (Math.random() - 0.5),
        city: data.departure
      },
      last_maintenance: new Date().toISOString().split('T')[0]
    };
    
    setVehicles(prev => [newVehicle, ...prev]);
    return newVehicle;
  }, []);

  const addLoad = useCallback(async (data: { origin: string, destination: string, weight_kg: number, price_inr: number, delivery_deadline: string }) => {
    const newLoad: Load = {
      id: `L-${Math.floor(2000 + Math.random() * 8000)}`,
      origin: data.origin,
      destination: data.destination,
      weight_kg: data.weight_kg,
      price_inr: data.price_inr,
      status: 'pending',
      pickup_date: new Date().toISOString().split('T')[0],
      delivery_deadline: data.delivery_deadline,
      supplier_id: 'S-1',
    };
    
    setLoads(prev => [newLoad, ...prev]);
    return newLoad;
  }, []);

  const generateAIInsights = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1500));
      
      const types: AIDecisionType[] = ['REROUTE', 'LOAD_MATCH', 'SPEED_ADJUSTMENT', 'PREVENTIVE_MAINTENANCE', 'EMPTY_MILE_FIX'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const newDecision: AIDecision = {
        id: `D-${Math.floor(Math.random() * 10000)}`,
        type: randomType,
        vehicle_id: vehicles.length > 0 ? vehicles[Math.floor(Math.random() * vehicles.length)].id : 'Unknown',
        reason: 'AI detected optimal route considering current traffic patterns and fuel levels.',
        impact_score: Math.floor(Math.random() * 30) + 70,
        profit_impact_inr: Math.floor(Math.random() * 5000) + 1000,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setDecisions(prev => [newDecision, ...prev]);
      return newDecision;
    } catch (err) {
      console.error('Error generating AI insights:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vehicles]);

  const updateDecisionStatus = useCallback(async (id: string, status: 'applied' | 'dismissed') => {
    try {
      await new Promise(r => setTimeout(r, 500));
      setDecisions(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      return { success: true };
    } catch (err) {
      console.error('Error updating decision status:', err);
      throw err;
    }
  }, []);

  const assignLoad = useCallback(async (loadId: string, vehicleId: string) => {
    try {
      await new Promise(r => setTimeout(r, 800));
      setLoads(prev => prev.map(l => 
        l.id === loadId ? { ...l, status: 'assigned', assigned_vehicle_id: vehicleId } : l
      ));
      setVehicles(prev => prev.map(v => 
        v.id === vehicleId ? { ...v, status: 'loading' as VehicleStatus } : v
      ));
      return { success: true };
    } catch (err) {
      console.error('Error assigning load:', err);
      throw err;
    }
  }, []);

  return {
    vehicles,
    loads,
    decisions,
    metrics,
    isLoading,
    error,
    generateAIInsights,
    updateDecisionStatus,
    assignLoad,
    addVehicle,
    addLoad,
    refresh: fetchData,
    fetchData
  };
}
