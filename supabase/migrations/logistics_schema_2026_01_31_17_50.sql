-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('operator', 'driver', 'supplier');
CREATE TYPE vehicle_status AS ENUM ('idle', 'loading', 'moving', 'maintenance', 'delayed');
CREATE TYPE load_status AS ENUM ('pending', 'assigned', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE support_ticket_type AS ENUM ('ACCIDENT', 'GOODS_LOSS', 'VEHICLE_BREAKDOWN', 'ROUTE_ISSUE', 'OTHER');
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE decision_type AS ENUM ('REROUTE', 'LOAD_MATCH', 'SPEED_ADJUSTMENT', 'PREVENTIVE_MAINTENANCE', 'EMPTY_MILE_FIX');
CREATE TYPE decision_status AS ENUM ('pending', 'executed', 'dismissed');

-- Tables
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL,
    company_name TEXT,
    license_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    license_number TEXT UNIQUE NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    status TEXT DEFAULT 'off_duty',
    total_trips INTEGER DEFAULT 0,
    total_distance_km INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plate_number TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    status vehicle_status DEFAULT 'idle',
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    current_address TEXT,
    max_weight_kg INTEGER NOT NULL,
    current_weight_kg INTEGER DEFAULT 0,
    max_volume_m3 DECIMAL(8,2) NOT NULL,
    current_volume_m3 DECIMAL(8,2) DEFAULT 0,
    fuel_level INTEGER DEFAULT 100,
    driver_id UUID REFERENCES public.drivers(id),
    operator_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.loads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID REFERENCES public.user_profiles(id),
    origin_lat DECIMAL(10, 8) NOT NULL,
    origin_lng DECIMAL(11, 8) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lng DECIMAL(11, 8) NOT NULL,
    destination_address TEXT NOT NULL,
    weight_kg INTEGER NOT NULL,
    volume_m3 DECIMAL(8,2) NOT NULL,
    price_inr INTEGER NOT NULL,
    status load_status DEFAULT 'pending',
    pickup_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_vehicle_id UUID REFERENCES public.vehicles(id),
    compatibility_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.agent_decisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id),
    decision_type decision_type NOT NULL,
    severity severity_level NOT NULL,
    reasoning TEXT NOT NULL,
    proposed_action TEXT NOT NULL,
    profit_delta_inr INTEGER DEFAULT 0,
    time_delta_minutes INTEGER DEFAULT 0,
    utilization_delta DECIMAL(4,3) DEFAULT 0,
    status decision_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) NOT NULL,
    ticket_type support_ticket_type NOT NULL,
    severity severity_level NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    images TEXT[],
    status support_ticket_status DEFAULT 'open',
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.fleet_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    operator_id UUID REFERENCES public.user_profiles(id),
    total_vehicles INTEGER DEFAULT 0,
    active_vehicles INTEGER DEFAULT 0,
    utilization_rate DECIMAL(4,3) DEFAULT 0,
    on_time_delivery_rate DECIMAL(4,3) DEFAULT 0,
    total_revenue_inr INTEGER DEFAULT 0,
    fuel_efficiency_kmpl DECIMAL(6,2) DEFAULT 0,
    carbon_footprint_tons DECIMAL(8,2) DEFAULT 0,
    empty_miles_percentage DECIMAL(4,3) DEFAULT 0,
    agent_optimization_gain_inr INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Drivers can view own data" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Operators can view all drivers" ON public.drivers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'operator')
);

CREATE POLICY "Operators can view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = operator_id);
CREATE POLICY "Drivers can view assigned vehicles" ON public.vehicles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);

CREATE POLICY "Suppliers can view own loads" ON public.loads FOR SELECT USING (auth.uid() = supplier_id);
CREATE POLICY "Operators can view all loads" ON public.loads FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'operator')
);

CREATE POLICY "Operators can view decisions" ON public.agent_decisions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'operator')
);

CREATE POLICY "Drivers can view own tickets" ON public.support_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Operators can view all tickets" ON public.support_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'operator')
);

CREATE POLICY "Operators can view fleet metrics" ON public.fleet_metrics FOR SELECT USING (auth.uid() = operator_id);

-- Insert sample data
-- Demo users will be created via auth, but we'll prepare the profile data
-- Sample drivers
INSERT INTO public.drivers (id, license_number, rating, status, total_trips, total_distance_km) VALUES
('11111111-1111-1111-1111-111111111111', 'MH-12-DL-2024-001', 4.8, 'on_duty', 245, 125000),
('22222222-2222-2222-2222-222222222222', 'DL-05-MH-2024-002', 4.6, 'off_duty', 189, 98000),
('33333333-3333-3333-3333-333333333333', 'KA-03-TN-2024-003', 4.9, 'on_duty', 312, 156000),
('44444444-4444-4444-4444-444444444444', 'TN-09-KA-2024-004', 4.7, 'on_duty', 278, 142000);

-- Sample vehicles
INSERT INTO public.vehicles (plate_number, model, status, current_lat, current_lng, current_address, max_weight_kg, current_weight_kg, max_volume_m3, current_volume_m3, fuel_level, driver_id) VALUES
('MH-12-AB-1234', 'Tata Prima 4830.S', 'moving', 19.0760, 72.8777, 'Mumbai-Pune Expressway, Maharashtra', 25000, 18500, 45.0, 32.5, 75, '11111111-1111-1111-1111-111111111111'),
('DL-05-CD-5678', 'Ashok Leyland 3718', 'idle', 28.7041, 77.1025, 'Delhi Transport Hub, New Delhi', 22000, 0, 40.0, 0.0, 90, '22222222-2222-2222-2222-222222222222'),
('KA-03-EF-9012', 'Mahindra Blazo X 35', 'loading', 12.9716, 77.5946, 'Bangalore Logistics Park, Karnataka', 28000, 5000, 50.0, 12.0, 85, '33333333-3333-3333-3333-333333333333'),
('TN-09-GH-3456', 'Eicher Pro 6037', 'moving', 13.0827, 80.2707, 'Chennai-Bangalore Highway, Tamil Nadu', 20000, 15000, 35.0, 28.0, 60, '44444444-4444-4444-4444-444444444444');

-- Sample loads
INSERT INTO public.loads (origin_lat, origin_lng, origin_address, destination_lat, destination_lng, destination_address, weight_kg, volume_m3, price_inr, pickup_deadline, delivery_deadline) VALUES
(19.0760, 72.8777, 'Mumbai Port, Maharashtra', 28.7041, 77.1025, 'Delhi Industrial Area, New Delhi', 18500, 32.5, 85000, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '24 hours'),
(22.3072, 70.8022, 'Ahmedabad Textile Hub, Gujarat', 19.0760, 72.8777, 'Mumbai JNPT Port, Maharashtra', 12000, 25.0, 65000, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '18 hours'),
(12.9716, 77.5946, 'Bangalore Electronics City, Karnataka', 17.3850, 78.4867, 'Hyderabad Pharma City, Telangana', 8500, 18.0, 72000, NOW() + INTERVAL '6 hours', NOW() + INTERVAL '20 hours'),
(22.5726, 88.3639, 'Kolkata Industrial Complex, West Bengal', 13.0827, 80.2707, 'Chennai Auto Hub, Tamil Nadu', 22000, 38.0, 95000, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '30 hours'),
(21.1458, 79.0882, 'Nagpur Logistics Hub, Maharashtra', 23.0225, 72.5714, 'Ahmedabad Chemical Zone, Gujarat', 16000, 28.5, 78000, NOW() + INTERVAL '5 hours', NOW() + INTERVAL '22 hours'),
(26.9124, 75.7873, 'Jaipur Handicraft Center, Rajasthan', 28.7041, 77.1025, 'Delhi Connaught Place, New Delhi', 6500, 15.0, 58000, NOW() + INTERVAL '8 hours', NOW() + INTERVAL '16 hours');

-- Sample AI decisions
INSERT INTO public.agent_decisions (vehicle_id, decision_type, severity, reasoning, proposed_action, profit_delta_inr, time_delta_minutes, utilization_delta) VALUES
((SELECT id FROM public.vehicles WHERE plate_number = 'MH-12-AB-1234'), 'REROUTE', 'medium', 'Traffic congestion detected on NH-48 near Pune. Alternative route via NH-60 saves 45 minutes despite 12km extra distance.', 'Reroute via NH-60 through Nashik to avoid Mumbai-Pune Expressway congestion', 2500, -45, 0.08),
((SELECT id FROM public.vehicles WHERE plate_number = 'KA-03-EF-9012'), 'LOAD_MATCH', 'high', 'Vehicle has 15T remaining capacity after current load. Identified compatible load from Bangalore to Hyderabad worth ₹28,000 with 95% route overlap.', 'Accept additional load BLR-HYD-2024-0156 for ₹28,000', 28000, 0, 0.15),
((SELECT id FROM public.vehicles WHERE plate_number = 'TN-09-GH-3456'), 'SPEED_ADJUSTMENT', 'low', 'Current fuel consumption 3.2 kmpl vs optimal 4.1 kmpl. Speed reduction from 75 to 65 kmph on NH-44 improves efficiency by 22%.', 'Reduce speed to 65 kmph for remaining 280km to Chennai', 1800, 25, 0.03),
((SELECT id FROM public.vehicles WHERE plate_number = 'DL-05-CD-5678'), 'PREVENTIVE_MAINTENANCE', 'critical', 'Vehicle odometer shows 98,000km. Last service at 85,000km. Engine temperature trending upward. Monsoon season requires brake inspection.', 'Schedule maintenance at Delhi Service Center within 48 hours', -5000, 0, -0.05);

-- Sample support tickets
INSERT INTO public.support_tickets (ticket_number, driver_id, ticket_type, severity, title, description, location_lat, location_lng, location_address) VALUES
('TKT-2026-001', '11111111-1111-1111-1111-111111111111', 'ROUTE_ISSUE', 'medium', 'Road closure on NH-48', 'Bridge construction blocking main route near Lonavala. Need alternative route guidance.', 18.7537, 73.4068, 'NH-48, Lonavala, Maharashtra'),
('TKT-2026-002', '33333333-3333-3333-3333-333333333333', 'VEHICLE_BREAKDOWN', 'high', 'Engine overheating', 'Temperature gauge showing red. Pulled over safely. Need immediate assistance.', 13.3409, 77.1172, 'Bangalore-Hyderabad Highway, Karnataka'),
('TKT-2026-003', '44444444-4444-4444-4444-444444444444', 'ACCIDENT', 'critical', 'Minor collision', 'Rear-ended by car. No injuries. Vehicle damage to rear bumper. Police informed.', 12.8406, 80.1534, 'Chennai Outer Ring Road, Tamil Nadu');

-- Sample fleet metrics
INSERT INTO public.fleet_metrics (total_vehicles, active_vehicles, utilization_rate, on_time_delivery_rate, total_revenue_inr, fuel_efficiency_kmpl, carbon_footprint_tons, empty_miles_percentage, agent_optimization_gain_inr) VALUES
(4, 3, 0.78, 0.92, 2450000, 3.8, 145.6, 0.18, 125000);

-- Create indexes for performance
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_operator ON public.vehicles(operator_id);
CREATE INDEX idx_loads_status ON public.loads(status);
CREATE INDEX idx_loads_supplier ON public.loads(supplier_id);
CREATE INDEX idx_decisions_vehicle ON public.agent_decisions(vehicle_id);
CREATE INDEX idx_decisions_status ON public.agent_decisions(status);
CREATE INDEX idx_tickets_driver ON public.support_tickets(driver_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);