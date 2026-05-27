'use client';

import { Minus, Plus, Package, AlertTriangle, TrendingDown, Trash2 } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddProductModal from '@/components/inventory/AddProductModal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatters';

function StockBar({ stock, minStock }: { stock: number; minStock: number }) {
  const max = Math.max(stock, minStock * 3);
  const pct = Math.min(100, (stock / max) * 100);
  const isLow = stock <= minStock;
  const isCritical = stock <= Math.floor(minStock / 2);
  return (
    <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', isCritical ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  'Proteínas': 'bg-blue-400/15 text-blue-400',
  'Creatinas': 'bg-emerald-400/15 text-emerald-400',
  'Bebidas': 'bg-cyan-400/15 text-cyan-400',
  'Pre-Entreno': 'bg-orange-400/15 text-orange-400',
  'Aminoácidos': 'bg-amber-400/15 text-amber-400',
  'Vitaminas': 'bg-purple-400/15 text-purple-400',
};

export default function InventoryPage() {
  const { inventory, updateInventoryStock, deleteInventoryItem, isLoading, globalSearch, setGlobalSearch } = useGym();
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-1/4" />
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => (
             <Skeleton key={i} className="h-32 w-full" />
           ))}
        </div>
      </div>
    );
  }

  const activeSearch = globalSearch;
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const lowStock = inventory.filter(i => i.stock <= i.minStock);
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.price, 0);

  const categories = Array.from(new Set(filteredInventory.map(i => i.category)));

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteInventoryItem(itemToDelete);
      toast.success('Producto eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  return (
    <div className="space-y-5">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full flex-1">
          <div className="gym-card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-400/10">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Productos</p>
              <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
            </div>
          </div>
          <div className="gym-card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-400/10">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-foreground">{lowStock.length}</p>
            </div>
          </div>
          <div className="gym-card p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-400/10">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor en Stock</p>
              <p className="text-2xl font-bold text-foreground">${(totalValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 whitespace-nowrap self-stretch sm:self-center"
        >
          <Plus className="w-5 h-5" />
          Agregar Producto
        </button>
      </motion.div>

      {lowStock.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-red-400/10 border border-red-400/30 rounded-xl flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-400">Atención: Reponer stock</p>
            <p className="text-xs text-red-400/70 mt-0.5">Hay {lowStock.length} productos por debajo del mínimo.</p>
          </div>
        </motion.div>
      )}

      {categories.length === 0 ? (
        <EmptyState 
          icon={Package}
          title="No se encontraron productos"
          description="Asegúrate de que el nombre o categoría sea correcto."
          actionLabel="Ver todo el inventario"
          onAction={() => setGlobalSearch('')}
          className="py-20"
        />
      ) : (
        <div className="space-y-4">
          {categories.map((cat, idx) => {
            const items = filteredInventory.filter(i => i.category === cat);
            return (
              <motion.div 
                key={cat} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="gym-card overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', CATEGORY_COLORS[cat] ?? 'bg-secondary text-muted-foreground')}>
                      {cat}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{items.length} productos</span>
                </div>
                <div className="divide-y divide-border/50">
                  {items.map(item => {
                    const isLow = item.stock <= item.minStock;
                    const isCritical = item.stock <= Math.floor(item.minStock / 2);
                    return (
                      <div key={item.id} className="group flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{item.name}</p>
                            {isCritical && <span className="px-1.5 py-0.5 bg-red-400/15 text-red-400 text-[10px] font-bold rounded">CRÍTICO</span>}
                            {!isCritical && isLow && <span className="px-1.5 py-0.5 bg-amber-400/15 text-amber-400 text-[10px] font-bold rounded">BAJO</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">Mínimo: {item.minStock} {item.unit}</p>
                            <StockBar stock={item.stock} minStock={item.minStock} />
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right hidden md:block">
                            <p className="text-xs text-muted-foreground">Precio unit.</p>
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateInventoryStock(item.id, -1)}
                              disabled={item.stock === 0}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-foreground" />
                            </button>
                            <div className="w-12 text-center">
                              <span className={cn('text-lg font-bold', isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-foreground')}>
                                {item.stock}
                              </span>
                              <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                            </div>
                            <button
                              onClick={() => updateInventoryStock(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-primary" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => setItemToDelete(item.id)}
                            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <AddProductModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>

      <ConfirmDialog 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar producto?"
        description="Esta acción no se puede deshacer. El producto será borrado permanentemente del inventario."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}
