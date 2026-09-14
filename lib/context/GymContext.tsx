'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Member, Payment, InventoryItem, AttendanceRecord, GymClass, Booking, Transaction } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';

interface GymContextType {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  payments: Payment[];
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryStock: (id: string, delta: number) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  attendance: AttendanceRecord[];
  checkIn: (record: Omit<AttendanceRecord, 'id'>) => Promise<void>;
  classes: GymClass[];
  bookings: Booking[];
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  bookClass: (booking: Omit<Booking, 'id'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  addClass: (gymClass: Omit<GymClass, 'id'>) => Promise<void>;
  toggleAutoRenew: (memberId: string) => Promise<void>;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const GymContext = createContext<GymContextType | null>(null);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const { gymId } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let mQuery = supabase.from('members').select('*');
      let pQuery = supabase.from('payments').select('*');
      let iQuery = supabase.from('inventory').select('*');
      let aQuery = supabase.from('attendance').select('*').order('checkInTime', { ascending: false });
      let cQuery = supabase.from('classes').select('*');
      let bQuery = supabase.from('bookings').select('*');
      let tQuery = supabase.from('transactions').select('*').order('date', { ascending: false });

      if (gymId) {
        mQuery = mQuery.eq('gym_id', gymId);
        pQuery = pQuery.eq('gym_id', gymId);
        iQuery = iQuery.eq('gym_id', gymId);
        aQuery = aQuery.eq('gym_id', gymId);
        cQuery = cQuery.eq('gym_id', gymId);
        bQuery = bQuery.eq('gym_id', gymId);
        tQuery = tQuery.eq('gym_id', gymId);
      }

      const [
        { data: membersData },
        { data: paymentsData },
        { data: inventoryData },
        { data: attendanceData },
        { data: classesData },
        { data: bookingsData },
        { data: transactionsData }
      ] = await Promise.all([mQuery, pQuery, iQuery, aQuery, cQuery, bQuery, tQuery]);

      setMembers(membersData || []);
      setPayments(paymentsData || []);
      setInventory(inventoryData || []);
      setAttendance(attendanceData || []);
      setClasses(classesData || []);
      setBookings(bookingsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      setMembers([]);
      setPayments([]);
      setInventory([]);
      setAttendance([]);
      setClasses([]);
      setBookings([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    const payload = gymId ? { ...transaction, gym_id: gymId } : transaction;
    const { data, error } = await supabase.from('transactions').insert([payload]).select();
    if (error) {
      console.error('Error adding transaction to Supabase:', error);
      setTransactions(prev => [{ ...transaction, id: `t${Date.now()}` } as Transaction, ...prev]);
    } else if (data) {
      setTransactions(prev => [data[0] as Transaction, ...prev]);
    }
  }, [gymId]);

  const addMember = useCallback(async (member: Omit<Member, 'id'>) => {
    const payload = gymId ? { ...member, gym_id: gymId } : member;
    const { data, error } = await supabase.from('members').insert([payload]).select();
    if (error) {
      console.error('Error adding member to Supabase, updating local state only:', error);
      setMembers(prev => [...prev, { ...member, id: String(Date.now()) } as Member]);
    } else if (data) {
      setMembers(prev => [...prev, data[0] as Member]);
    }

    // Registrar ingreso por membresía
    const prices: Record<string, number> = { daily: 1500, monthly: 12000, quarterly: 30000 };
    const amount = prices[member.plan] || 0;
    if (amount > 0) {
      await addTransaction({
        amount,
        date: new Date().toISOString(),
        description: `Pago Membresía - ${member.name}`,
        type: 'income',
        category: 'Membresías',
        paymentMethod: 'Efectivo',
      });
    }
  }, [gymId, addTransaction]);

  const addInventoryItem = useCallback(async (item: Omit<InventoryItem, 'id'>) => {
    const payload = gymId ? { ...item, gym_id: gymId } : item;
    const { data, error } = await supabase.from('inventory').insert([payload]).select();
    if (error) {
      console.error('Error adding inventory item to Supabase:', error);
      setInventory(prev => [...prev, { ...item, id: `i${Date.now()}` } as InventoryItem]);
    } else if (data) {
      setInventory(prev => [...prev, data[0] as InventoryItem]);
    }
  }, [gymId]);

  const updateInventoryStock = useCallback(async (id: string, delta: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const newStock = Math.max(0, item.stock + delta);
    const { error } = await supabase.from('inventory').update({ stock: newStock }).eq('id', id);

    if (error) {
      console.error('Error updating stock in Supabase:', error);
    }

    setInventory(prev =>
      prev.map(item => item.id === id ? { ...item, stock: newStock } : item)
    );

    // Registrar transacción de compra o venta
    if (delta < 0) {
      await addTransaction({
        amount: item.price * Math.abs(delta),
        date: new Date().toISOString(),
        description: `Venta - ${item.name}`,
        type: 'income',
        category: 'Inventario',
        paymentMethod: 'Efectivo',
      });
    } else if (delta > 0) {
      await addTransaction({
        amount: item.price * delta * 0.7,
        date: new Date().toISOString(),
        description: `Compra Stock - ${item.name}`,
        type: 'expense',
        category: 'Inventario',
        paymentMethod: 'Transferencia',
      });
    }
  }, [inventory, addTransaction]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) {
      console.error('Error deleting inventory item from Supabase:', error);
    }
    setInventory(prev => prev.filter(item => item.id !== id));
  }, []);

  const checkIn = useCallback(async (record: Omit<AttendanceRecord, 'id'>) => {
    const payload = gymId ? { ...record, gym_id: gymId } : record;
    const { data, error } = await supabase.from('attendance').insert([payload]).select();
    if (error) {
      console.error('Error checking in to Supabase:', error);
      setAttendance(prev => [{ ...record, id: `a${Date.now()}` } as AttendanceRecord, ...prev]);
    } else if (data) {
      setAttendance(prev => [data[0] as AttendanceRecord, ...prev]);
    }
  }, [gymId]);

  const addClass = useCallback(async (gymClass: Omit<GymClass, 'id'>) => {
    const payload = gymId ? { ...gymClass, gym_id: gymId } : gymClass;
    const { data, error } = await supabase.from('classes').insert([payload]).select();
    if (error) {
      console.error('Error adding class to Supabase:', error);
      const newClass = { ...gymClass, id: `c${Date.now()}` } as GymClass;
      setClasses(prev => [...prev, newClass]);
    } else if (data) {
      setClasses(prev => [...prev, data[0] as GymClass]);
    }
  }, [gymId]);

  const bookClass = useCallback(async (booking: Omit<Booking, 'id'>) => {
    const payload = gymId ? { ...booking, gym_id: gymId } : booking;
    const { data, error } = await supabase.from('bookings').insert([payload]).select();
    if (error) {
      console.error('Error booking class in Supabase:', error);
      const newBooking = { ...booking, id: `b${Date.now()}` } as Booking;
      setBookings(prev => [...prev, newBooking]);
      setClasses(prev => prev.map(c => c.id === booking.classId ? { ...c, enrolled: c.enrolled + 1 } : c));
    } else if (data) {
      setBookings(prev => [...prev, data[0] as Booking]);
      setClasses(prev => prev.map(c => c.id === booking.classId ? { ...c, enrolled: c.enrolled + 1 } : c));
    }
  }, [gymId]);

  const cancelBooking = useCallback(async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      console.error('Error cancelling booking in Supabase:', error);
    }

    setBookings(prev => prev.filter(b => b.id !== id));
    setClasses(prev => prev.map(c => c.id === booking.classId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c));
  }, [bookings]);

  const toggleAutoRenew = useCallback(async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newValue = !member.autoRenew;
    const { error } = await supabase.from('members').update({ autoRenew: newValue }).eq('id', memberId);
    
    if (error) {
      console.error('Error toggling autoRenew in Supabase:', error);
    }
    
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, autoRenew: newValue } : m));
    setPayments(prev => prev.map(p => p.memberId === memberId ? { ...p, autoRenew: newValue } : p));
  }, [members]);

  return (
    <GymContext.Provider value={{
      sidebarCollapsed, toggleSidebar,
      isLoading,
      members, addMember,
      payments,
      inventory, addInventoryItem, updateInventoryStock, deleteInventoryItem,
      attendance, checkIn,
      classes, bookings, bookClass, cancelBooking, addClass,
      transactions, addTransaction,
      toggleAutoRenew,
      globalSearch, setGlobalSearch,
    }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error('useGym must be used within GymProvider');
  return ctx;
}

