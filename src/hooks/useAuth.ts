import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ROUTE_PATHS, UserProfile, UserRole } from '@/lib/index';

/**
 * Authentication hook for role-based login system with Supabase integration.
 * Manages the lifecycle of user sessions for Operators, Drivers, and Suppliers
 * within the AI Path Logistics ecosystem.
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ai_path_dummy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Builds a UserProfile from a Supabase auth user object (metadata-based)
   */
  const buildProfileFromAuthUser = useCallback((authUser: User): UserProfile => {
    const meta = authUser.user_metadata || {};
    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: meta.full_name || 'Logistics Professional',
      role: (meta.role as UserRole) || 'driver',
      company_name: meta.company_name || 'Indian Logistics Network',
      phone: meta.phone || '',
    };
  }, []);

  useEffect(() => {
    // BYPASS AUTH: Do not check session, just finish loading
    setLoading(false);
  }, [buildProfileFromAuthUser]);

  /**
   * Executes role-based login logic (BYPASSED)
   */
  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      // Bypass auth completely
      const newUser = {
        id: '00000000-0000-0000-0000-000000000001',
        email: email || 'test@example.com',
        full_name: 'Test Bypassed User',
        role: role,
        company_name: 'Bypassed Company',
        phone: '1234567890',
      };
      setUser(newUser);
      localStorage.setItem('ai_path_dummy_user', JSON.stringify(newUser));
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch (error) {
      console.error('Authentication attempt failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Executes user registration logic (BYPASSED)
   */
  const signup = async (email: string, password: string, role: UserRole) => {
    return login(email, password, role);
  };

  /**
   * Terminates the current session and redirects to landing page
   */
  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('ai_path_dummy_user');
      navigate(ROUTE_PATHS.HOME);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isOperator: user?.role === 'operator',
    isDriver: user?.role === 'driver',
    isSupplier: user?.role === 'supplier',
    supabase
  };
}
