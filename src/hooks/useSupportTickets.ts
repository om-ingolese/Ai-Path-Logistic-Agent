import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupportTicket, SupportTicketStatus, SupportTicketType } from '@/lib';
import { toast } from 'sonner';

/**
 * Real-time support ticket management with Supabase integration and robust mock fallback.
 */

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1001",
    user_id: "55555555-5555-5555-5555-555555555555",
    type: "breakdown",
    status: "in-progress",
    description: "Tire burst, near gangadham pune.",
    location: {
      lat: 18.5204,
      lng: 73.8567,
      address: "Pune-Mumbai Highway, near Gangadham"
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    priority: "medium"
  },
  {
    id: "TKT-1002",
    user_id: "55555555-5555-5555-5555-555555555555",
    type: "accident",
    status: "open",
    description: "Minor collision with local cargo truck, NH-44 near Ludhiana. No injuries.",
    location: {
      lat: 30.9010,
      lng: 75.8573,
      address: "NH-44 Ludhiana Corridor"
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    priority: "high"
  }
];

export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load from localStorage or default mock
  const getLocalTickets = useCallback((): SupportTicket[] => {
    const stored = localStorage.getItem('ai_path_support_tickets');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored tickets', e);
      }
    }
    // If not in localStorage, seed it with MOCK_TICKETS
    localStorage.setItem('ai_path_support_tickets', JSON.stringify(MOCK_TICKETS));
    return MOCK_TICKETS;
  }, []);

  // Fetch tickets - try Supabase, fallback to localStorage
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select(`
          id,
          ticket_number,
          driver_id,
          ticket_type,
          severity,
          title,
          description,
          location_lat,
          location_lng,
          location_address,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data to match interface
      const transformedTickets: SupportTicket[] = (data || []).map(t => ({
        id: t.ticket_number || t.id,
        user_id: t.driver_id,
        type: t.ticket_type?.toLowerCase().replace('_', '-') as SupportTicketType,
        status: t.status as SupportTicketStatus,
        description: t.description,
        location: {
          lat: t.location_lat || 0,
          lng: t.location_lng || 0,
          address: t.location_address || 'Unknown location'
        },
        created_at: t.created_at,
        priority: t.severity as SupportTicket['priority']
      }));

      // Merge with any custom local tickets
      const local = getLocalTickets();
      const localOnly = local.filter(l => !transformedTickets.some(t => t.id === l.id));
      setTickets([...transformedTickets, ...localOnly].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.warn('Failed to fetch from Supabase. Using local storage tickets.', err);
      setTickets(getLocalTickets().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } finally {
      setIsLoading(false);
    }
  }, [getLocalTickets]);

  // Initialize data and set up real-time subscription
  useEffect(() => {
    fetchTickets();

    let subscription: any = null;
    try {
      subscription = supabase
        .channel('support_tickets_changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'support_tickets' },
          () => fetchTickets()
        )
        .subscribe();
    } catch (err) {
      console.warn('Real-time subscription setup failed:', err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchTickets]);

  /**
   * Captures the current GPS coordinates of the device.
   * Falls back to a default location if permission is denied.
   */
  const getCurrentLocation = useCallback(async (): Promise<{ lat: number; lng: number; address?: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 28.6139, lng: 77.2090, address: 'New Delhi (Fallback)' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'GPS Verified Location'
          });
        },
        () => {
          // Standard fallback to major hub if GPS access is restricted
          resolve({ lat: 28.6139, lng: 77.2090, address: 'GPS Access Restricted' });
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }, []);

  /**
   * Sends a real-time mobile notification (SMS or WhatsApp) via Twilio using our local Flask backend.
   * Gracefully falls back if Twilio is not configured.
   */
  const sendTwilioNotification = useCallback(async (ticket: SupportTicket) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/send_ticket_notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn("Backend rejected Twilio notification request:", errText);
        toast.error("SMS notification could not be delivered to mobile.");
      } else {
        const resData = await response.json();
        if (resData.status === 'success') {
          console.log("Twilio notification dispatched successfully to mobile!");
          toast.success(`📱 SMS alert sent to mobile! (Ticket: ${ticket.id})`, {
            description: "Mobile notification dispatched via Twilio SMS."
          });
        } else {
          console.log("Twilio notification skipped:", resData.reason);
        }
      }
    } catch (err) {
      console.error("Error triggering Twilio notification endpoint:", err);
    }
  }, []);

  /**
   * Creates a new support ticket with automatic GPS location attachment.
   */
  const createTicket = useCallback(async (data: {
    type: SupportTicketType;
    description: string;
    priority: SupportTicket['priority'];
    title?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    const locationData = await getCurrentLocation();
    const newTicketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: newTicketId,
      user_id: '55555555-5555-5555-5555-555555555555',
      type: data.type,
      status: 'open',
      description: data.description,
      location: {
        lat: locationData.lat,
        lng: locationData.lng,
        address: locationData.address || 'GPS Verified Location'
      },
      created_at: new Date().toISOString(),
      priority: data.priority
    };

    try {
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get driver ID for the current user
      const { data: driverData } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const driverId = driverData?.id || '55555555-5555-5555-5555-555555555555'; // Fallback

      // Create ticket via edge function
      const response = await supabase.functions.invoke('logistics_operations_2026_01_31_17_50', {
        body: {
          action: 'create_support_ticket',
          data: {
            driverId,
            ticketType: data.type.toUpperCase().replace('-', '_'),
            severity: data.priority,
            title: data.title || `${data.type.replace('-', ' ')} - ${new Date().toLocaleDateString()}`,
            description: data.description,
            locationLat: locationData.lat,
            locationLng: locationData.lng,
            locationAddress: locationData.address
          }
        }
      });

      if (response.error) throw response.error;

      // Refresh tickets to show the new one
      await fetchTickets();
      
      // Send Twilio mobile notification in background
      sendTwilioNotification(newTicket);

      return response.data;
    } catch (err) {
      console.warn('Supabase ticket creation failed. Falling back to local storage.', err);
      
      // Save locally
      const local = getLocalTickets();
      const updated = [newTicket, ...local];
      localStorage.setItem('ai_path_support_tickets', JSON.stringify(updated));
      
      // Update state directly
      setTickets(updated);
      
      // Send Twilio mobile notification in background
      sendTwilioNotification(newTicket);

      return newTicket;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, fetchTickets, getLocalTickets, sendTwilioNotification]);

  /**
   * Updates the status of an existing ticket (e.g., from Open to In-Progress).
   */
  const updateTicketStatus = useCallback(async (ticketId: string, status: SupportTicketStatus) => {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' && { resolved_at: new Date().toISOString() })
        })
        .eq('ticket_number', ticketId);

      if (updateError) throw updateError;
    } catch (err) {
      console.warn('Supabase status update failed. Updating local storage.', err);
    } finally {
      // Update local storage and state regardless of Supabase connection to keep it responsive
      const local = getLocalTickets();
      const updated = local.map(t => t.id === ticketId ? { ...t, status } : t);
      localStorage.setItem('ai_path_support_tickets', JSON.stringify(updated));
      setTickets(updated);
      setIsLoading(false);
    }
  }, [getLocalTickets]);

  return {
    tickets,
    isLoading,
    error,
    createTicket,
    updateTicketStatus,
    getCurrentLocation,
    fetchTickets
  };
}
