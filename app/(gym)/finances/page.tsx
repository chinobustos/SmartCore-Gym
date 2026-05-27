'use client';

import { Wallet, ArrowDownRight, ArrowUpRight, Search, Plus, CreditCard, Calendar } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import AddTransactionModal from '@/components/finances/AddTransactionModal';

export default function FinancesPage() {
  const { transactions, isLoading, globalSearch, setGlobalSearch } = useGym();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine local and global search
  const activeSearch = search || globalSearch;

  // Calculations
  const { totalBalance, totalIncome, totalExpense } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') {
          acc.totalIncome += t.amount;
          acc.totalBalance += t.amount;
        } else {
          acc.totalExpense += t.amount;
          acc.totalBalance -= t.amount;
        }
        return acc;
      },
      { totalBalance: 0, totalIncome: 0, totalExpense: 0 }
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchFilter = filter === 'all' || t.type === filter;
      const matchSearch = t.description.toLowerCase().includes(activeSearch.toLowerCase()) || 
                          t.category.toLowerCase().includes(activeSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [transactions, filter, activeSearch]);

  const getTransactionIcon = (type: string) => {
    if (type === 'income') return <ArrowDownRight className="w-6 h-6 text-emerald-500" />;
    return <ArrowUpRight className="w-6 h-6 text-rose-500" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))}
        </div>
        <div className="gym-card p-0 overflow-hidden">
          <Skeleton className="h-20 w-full" />
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-7 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="absolute -top-4 -right-4 p-4 opacity-10 pointer-events-none">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-primary-foreground/80 text-sm font-medium mb-1">Balance Total</p>
            <h3 className="text-4xl font-extrabold tracking-tight mt-2">{formatCurrency(totalBalance)}</h3>
          </div>
          <div className="relative z-10 mt-6 flex items-center text-xs bg-black/15 w-max px-3 py-1.5 rounded-full backdrop-blur-md font-medium">
            <span className="opacity-100">Actualizado recientemente</span>
          </div>
        </div>

        <div className="bg-card border border-border p-7 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Ingresos
            </span>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Total Ingresos</p>
            <h3 className="text-3xl font-bold text-foreground">{formatCurrency(totalIncome)}</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-7 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-500">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
              Egresos
            </span>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Total Egresos</p>
            <h3 className="text-3xl font-bold text-foreground">{formatCurrency(totalExpense)}</h3>
          </div>
        </div>
      </motion.div>

      {/* Transaction List Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col"
      >
        <div className="p-6 sm:px-8 sm:py-6 border-b border-border flex flex-col lg:flex-row items-center justify-between gap-6 bg-secondary/30">
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <h2 className="text-xl font-bold text-foreground">Tus Movimientos</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Buscar concepto o categoría..." 
                value={activeSearch}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (globalSearch) setGlobalSearch('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
              />
            </div>
            
            <div className="flex bg-background border border-border p-1 rounded-xl shadow-sm w-full sm:w-auto">
              <button 
                onClick={() => setFilter('all')}
                className={cn('flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all', filter === 'all' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('income')}
                className={cn('flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all', filter === 'income' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                Ingresos
              </button>
              <button 
                onClick={() => setFilter('expense')}
                className={cn('flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all', filter === 'expense' ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
              >
                Egresos
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border bg-card">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/50">
              {filteredTransactions.map((transaction, idx) => (
                <motion.div 
                  key={transaction.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-5 sm:px-8 hover:bg-secondary/40 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                      transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    )}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {transaction.description}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5 text-foreground/70">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(transaction.date)}
                        </span>
                        {transaction.paymentMethod && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              {transaction.paymentMethod}
                            </span>
                          </>
                        )}
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold text-primary/70">
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-lg font-extrabold tracking-tight",
                      transaction.type === 'income' ? 'text-emerald-500' : 'text-foreground'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Wallet}
              title="No hay movimientos"
              description="No se encontraron movimientos que coincidan con tu búsqueda o filtro actual."
              actionLabel="Limpiar filtros"
              onAction={() => { setFilter('all'); setSearch(''); setGlobalSearch(''); }}
              className="py-20"
            />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <AddTransactionModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
