-- First, let's insert the user profiles that will be linked to auth users
-- These will be created when users sign up, but we need the structure ready

-- Insert sample user profiles (these will be linked when auth users are created)
INSERT INTO public.user_profiles (id, email, full_name, phone, role, company_name, license_number, is_active) VALUES
-- Fleet Operator
('00000000-0000-0000-0000-000000000001', 'akhilhegde0118@gmail.com', 'Akhil Hegde', '+91-9876543210', 'operator', 'PathLogistics Pvt Ltd', 'OP-2024-001', true),
-- Driver  
('00000000-0000-0000-0000-000000000002', 'adi.ansh2006@gmail.com', 'Aditya Ansh', '+91-9876543211', 'driver', 'PathLogistics Pvt Ltd', 'DL-MH-12-2024-001', true),
-- Load Supplier
('00000000-0000-0000-0000-000000000003', 'kaustavashtikar2207@gmail.com', 'Kaustav Ashtikar', '+91-9876543212', 'supplier', 'Mumbai Freight Solutions', 'SP-2024-001', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  company_name = EXCLUDED.company_name,
  license_number = EXCLUDED.license_number,
  updated_at = NOW();

-- Update drivers table with proper user_id references
UPDATE public.drivers SET user_id = '00000000-0000-0000-0000-000000000002' WHERE license_number = 'MH-12-DL-2024-001';

-- Insert additional drivers for the other vehicles
INSERT INTO public.drivers (id, user_id, license_number, rating, status, total_trips, total_distance_km) VALUES
('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000002', 'MH-12-DL-2024-001', 4.8, 'on_duty', 245, 125000),
('66666666-6666-6666-6666-666666666666', NULL, 'DL-05-MH-2024-002', 4.6, 'off_duty', 189, 98000),
('77777777-7777-7777-7777-777777777777', NULL, 'KA-03-TN-2024-003', 4.9, 'on_duty', 312, 156000),
('88888888-8888-8888-8888-888888888888', NULL, 'TN-09-KA-2024-004', 4.7, 'on_duty', 278, 142000)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  license_number = EXCLUDED.license_number,
  rating = EXCLUDED.rating,
  status = EXCLUDED.status,
  total_trips = EXCLUDED.total_trips,
  total_distance_km = EXCLUDED.total_distance_km,
  updated_at = NOW();

-- Update vehicles with proper operator_id and driver_id references
UPDATE public.vehicles SET 
  operator_id = '00000000-0000-0000-0000-000000000001',
  driver_id = '55555555-5555-5555-5555-555555555555'
WHERE plate_number = 'MH-12-AB-1234';

UPDATE public.vehicles SET 
  operator_id = '00000000-0000-0000-0000-000000000001',
  driver_id = '66666666-6666-6666-6666-666666666666'
WHERE plate_number = 'DL-05-CD-5678';

UPDATE public.vehicles SET 
  operator_id = '00000000-0000-0000-0000-000000000001',
  driver_id = '77777777-7777-7777-7777-777777777777'
WHERE plate_number = 'KA-03-EF-9012';

UPDATE public.vehicles SET 
  operator_id = '00000000-0000-0000-0000-000000000001',
  driver_id = '88888888-8888-8888-8888-888888888888'
WHERE plate_number = 'TN-09-GH-3456';

-- Update loads with proper supplier_id
UPDATE public.loads SET supplier_id = '00000000-0000-0000-0000-000000000003' WHERE supplier_id IS NULL;

-- Update support tickets with proper driver_id
UPDATE public.support_tickets SET driver_id = '55555555-5555-5555-5555-555555555555' WHERE ticket_number = 'TKT-2026-001';
UPDATE public.support_tickets SET driver_id = '77777777-7777-7777-7777-777777777777' WHERE ticket_number = 'TKT-2026-002';
UPDATE public.support_tickets SET driver_id = '88888888-8888-8888-8888-888888888888' WHERE ticket_number = 'TKT-2026-003';

-- Update fleet metrics with proper operator_id
UPDATE public.fleet_metrics SET operator_id = '00000000-0000-0000-0000-000000000001' WHERE operator_id IS NULL;

-- Create a function to handle user profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
    -- Insert new user profile based on email
    IF NEW.email = 'akhilhegde0118@gmail.com' THEN
      INSERT INTO public.user_profiles (id, email, full_name, phone, role, company_name, license_number)
      VALUES (NEW.id, NEW.email, 'Akhil Hegde', '+91-9876543210', 'operator', 'PathLogistics Pvt Ltd', 'OP-2024-001');
    ELSIF NEW.email = 'adi.ansh2006@gmail.com' THEN
      INSERT INTO public.user_profiles (id, email, full_name, phone, role, company_name, license_number)
      VALUES (NEW.id, NEW.email, 'Aditya Ansh', '+91-9876543211', 'driver', 'PathLogistics Pvt Ltd', 'DL-MH-12-2024-001');
      -- Also update the driver record
      UPDATE public.drivers SET user_id = NEW.id WHERE license_number = 'MH-12-DL-2024-001';
    ELSIF NEW.email = 'kaustavashtikar2207@gmail.com' THEN
      INSERT INTO public.user_profiles (id, email, full_name, phone, role, company_name, license_number)
      VALUES (NEW.id, NEW.email, 'Kaustav Ashtikar', '+91-9876543212', 'supplier', 'Mumbai Freight Solutions', 'SP-2024-001');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to simulate real-time vehicle updates
CREATE OR REPLACE FUNCTION public.update_vehicle_locations()
RETURNS void AS $$
DECLARE
  vehicle_record RECORD;
  new_lat DECIMAL(10,8);
  new_lng DECIMAL(11,8);
  new_fuel INTEGER;
BEGIN
  -- Update vehicle locations and fuel levels to simulate movement
  FOR vehicle_record IN SELECT id, current_lat, current_lng, fuel_level, status FROM public.vehicles WHERE status IN ('moving', 'loading') LOOP
    -- Simulate small location changes for moving vehicles
    IF vehicle_record.status = 'moving' THEN
      new_lat := vehicle_record.current_lat + (RANDOM() - 0.5) * 0.01;
      new_lng := vehicle_record.current_lng + (RANDOM() - 0.5) * 0.01;
      new_fuel := GREATEST(vehicle_record.fuel_level - FLOOR(RANDOM() * 3), 10);
      
      UPDATE public.vehicles 
      SET current_lat = new_lat,
          current_lng = new_lng,
          fuel_level = new_fuel,
          updated_at = NOW()
      WHERE id = vehicle_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate new AI decisions
CREATE OR REPLACE FUNCTION public.generate_sample_ai_decision()
RETURNS void AS $$
DECLARE
  vehicle_id UUID;
  decision_types TEXT[] := ARRAY['REROUTE', 'LOAD_MATCH', 'SPEED_ADJUSTMENT', 'PREVENTIVE_MAINTENANCE', 'EMPTY_MILE_FIX'];
  severity_levels TEXT[] := ARRAY['low', 'medium', 'high', 'critical'];
  selected_type TEXT;
  selected_severity TEXT;
BEGIN
  -- Get a random active vehicle
  SELECT id INTO vehicle_id FROM public.vehicles WHERE status IN ('moving', 'idle', 'loading') ORDER BY RANDOM() LIMIT 1;
  
  IF vehicle_id IS NOT NULL THEN
    selected_type := decision_types[FLOOR(RANDOM() * array_length(decision_types, 1)) + 1];
    selected_severity := severity_levels[FLOOR(RANDOM() * array_length(severity_levels, 1)) + 1];
    
    INSERT INTO public.agent_decisions (
      vehicle_id,
      decision_type,
      severity,
      reasoning,
      proposed_action,
      profit_delta_inr,
      time_delta_minutes,
      utilization_delta
    ) VALUES (
      vehicle_id,
      selected_type::decision_type,
      selected_severity::severity_level,
      'AI-generated decision based on real-time analysis of traffic, fuel, and load optimization opportunities.',
      'Implement recommended action to optimize fleet performance and reduce operational costs.',
      FLOOR(RANDOM() * 20000) + 1000,
      FLOOR(RANDOM() * 120) - 60,
      (RANDOM() * 0.3) - 0.15
    );
  END IF;
END;
$$ LANGUAGE plpgsql;