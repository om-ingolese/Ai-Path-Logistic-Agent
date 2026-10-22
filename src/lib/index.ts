export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN_OPERATOR: '/login/operator',
  LOGIN_DRIVER: '/login/driver',
  LOGIN_SUPPLIER: '/login/supplier',
  DASHBOARD: '/dashboard',
  FLEET: '/fleet',
  LOADS: '/loads',
  ANALYTICS: '/analytics',
  SUPPORT: '/support',
  LIVE_TRACKING: '/live-tracking',
} as const;

export type UserRole = 'operator' | 'driver' | 'supplier';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  company_name?: string;
}

export type VehicleStatus = 'idle' | 'loading' | 'moving' | 'maintenance' | 'delayed';

export interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  status: VehicleStatus;
  fuel_level: number;
  capacity_kg: number;
  current_load_kg: number;
  current_location: {
    lat: number;
    lng: number;
    city: string;
  };
  driver_id?: string;
  last_maintenance: string;
}

export type LoadStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export interface Load {
  id: string;
  origin: string;
  destination: string;
  weight_kg: number;
  price_inr: number;
  status: LoadStatus;
  pickup_date: string;
  delivery_deadline: string;
  supplier_id: string;
  assigned_vehicle_id?: string;
}

export type AIDecisionType =
  | 'REROUTE'
  | 'LOAD_MATCH'
  | 'SPEED_ADJUSTMENT'
  | 'PREVENTIVE_MAINTENANCE'
  | 'EMPTY_MILE_FIX';

export interface AIDecision {
  id: string;
  type: AIDecisionType;
  vehicle_id: string;
  reason: string;
  impact_score: number;
  profit_impact_inr: number;
  status: 'pending' | 'applied' | 'dismissed';
  created_at: string;
}

export type SupportTicketType = 'accident' | 'breakdown' | 'route_issue' | 'other';
export type SupportTicketStatus = 'open' | 'in-progress' | 'resolved';

export interface SupportTicket {
  id: string;
  user_id: string;
  type: SupportTicketType;
  status: SupportTicketStatus;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const INDIAN_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Ahmedabad',
  'Chennai',
  'Kolkata',
  'Surat',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
  'Visakhapatnam',
  'Pimpri-Chinchwad',
  'Patna',
  'Vadodara'
];

export const VEHICLE_MODELS = [
  'Tata Prima 4028.S',
  'Ashok Leyland Ecomet 1215 HE',
  'Mahindra Blazo X 49',
  'Eicher Pro 6048',
  'BharatBenz 2823R',
  'Tata LPT 3518 Cowl',
  'Ashok Leyland Boss 1215',
  'Eicher Pro 3015'
];

export const EMERGENCY_CONTACTS = {
  HOTLINE: '1800-LOGISTICS',
  POLICE: '100',
  AMBULANCE: '102',
  ROADSIDE_ASSISTANCE: '1800-ROAD-HELP',
  FIRE: '101'
};