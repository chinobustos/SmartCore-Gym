'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Gym, GymUser } from '@/lib/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  gymUser: GymUser | null;
  gym: Gym | null;
  gymId: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshGym: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gymUser, setGymUser] = useState<GymUser | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchGymAndProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setGymUser({
          id: profile.id,
          gymId: profile.gym_id,
          role: profile.role || 'owner',
          fullName: profile.full_name,
        });

        const { data: gymData } = await supabase
          .from('gyms')
          .select('*')
          .eq('id', profile.gym_id)
          .single();

        if (gymData) {
          setGym({
            id: gymData.id,
            name: gymData.name,
            logoUrl: gymData.logo_url,
            rubro: gymData.rubro,
            openingHours: gymData.opening_hours,
            mpPreapprovalId: gymData.mp_preapproval_id,
            subscriptionStatus: gymData.subscription_status,
            trialEndsAt: gymData.trial_ends_at,
            currentPeriodEnd: gymData.current_period_end,
            createdAt: gymData.created_at,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching gym profile:', err);
    }
  }, []);

  const refreshGym = useCallback(async () => {
    if (user?.id) {
      await fetchGymAndProfile(user.id);
    }
  }, [user?.id, fetchGymAndProfile]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Administrador',
          role: 'admin',
        };
        setUser(userData);
        await fetchGymAndProfile(session.user.id);
      } else {
        setUser(null);
        setGymUser(null);
        setGym(null);
      }
      setIsLoading(false);
    };

    checkAuth();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Administrador',
          role: 'admin',
        };
        setUser(userData);
        await fetchGymAndProfile(session.user.id);
      } else {
        setUser(null);
        setGymUser(null);
        setGym(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchGymAndProfile]);

  const login = useCallback(async (email: string, pass: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message || 'Credenciales incorrectas');
    }

    if (data.session) {
      const userData = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.name || 'Administrador',
        role: 'admin',
      };
      
      setUser(userData);
      await fetchGymAndProfile(data.session.user.id);
      router.push('/dashboard');
    }
    
    setIsLoading(false);
  }, [router, fetchGymAndProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setGymUser(null);
    setGym(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{
      user,
      gymUser,
      gym,
      gymId: gymUser?.gymId || null,
      isLoading,
      login,
      logout,
      refreshGym
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

