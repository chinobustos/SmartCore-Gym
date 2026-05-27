'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Users, Clock, Search, Filter, Plus, ChevronRight } from 'lucide-react';
import { useGym } from '@/lib/context/GymContext';
import BookingModal from '@/components/classes/BookingModal';
import CreateClassModal from '@/components/classes/CreateClassModal';
import type { GymClass } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';

import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ClassesPage() {
    const { classes, isLoading, globalSearch, setGlobalSearch } = useGym();
    const [search, setSearch] = useState('');
    const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Combine local search and global search
    const activeSearch = search || globalSearch;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="gym-card p-5 space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-2 w-full mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        c.instructor.toLowerCase().includes(activeSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(activeSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div className="flex-1 w-full max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Buscar clase o instructor..."
                        value={activeSearch}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            if (globalSearch) setGlobalSearch(''); // Clear global if local is used
                        }}
                        className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nueva Clase</span>
                    </button>
                </div>
            </motion.div>

            {filteredClasses.length === 0 ? (
                <EmptyState 
                    icon={CalendarIcon}
                    title="No se encontraron clases"
                    description="Intentá con otro nombre o instructor."
                    actionLabel="Ver todas las clases"
                    onAction={() => { setSearch(''); setGlobalSearch(''); }}
                    className="py-20"
                />
            ) : (
                <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {filteredClasses.map((c) => {
                        const isFull = c.enrolled >= c.capacity;
                        return (
                            <motion.div 
                                layout
                                key={c.id} 
                                className="gym-card group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all flex flex-col"
                            >
                                <div className={cn("h-1.5 w-full", c.color)}></div>
                                <Link href={`/classes/${c.id}`} className="p-5 flex-1 cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-70">{c.category}</span>
                                            <h3 className="text-lg font-bold text-foreground mt-0.5 group-hover:text-primary transition-colors">{c.name}</h3>
                                        </div>
                                        <div className="p-2 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 mb-6">
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>{c.day} · {c.time} ({c.duration})</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>Prof. {c.instructor}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-muted-foreground">Ocupación</span>
                                            <span className={isFull ? "text-red-400" : "text-foreground"}>
                                                {c.enrolled} / {c.capacity}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(c.enrolled / (c.capacity || 1)) * 100}%` }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className={cn("h-full", isFull ? "bg-red-400" : c.color)}
                                            />
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-5 pb-5">
                                    <button
                                        disabled={isFull}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setSelectedClass(c);
                                        }}
                                        className={cn(
                                            "w-full py-2.5 rounded-xl text-sm font-bold transition-all",
                                            isFull
                                                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                                                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                                        )}
                                    >
                                        {isFull ? "Clase Completa" : "Inscribir Socio"}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <AnimatePresence>
                {selectedClass && (
                    <BookingModal
                        gymClass={selectedClass}
                        onClose={() => setSelectedClass(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateClassModal
                        onClose={() => setIsCreateModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
