"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { X, DollarSign, Tag, FileText, CreditCard } from "lucide-react";
import { useGym } from "@/lib/context/GymContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.preprocess((val) => Number(val), z.number().positive("El monto debe ser positivo")),
  description: z.string().min(3, "La descripción es muy corta"),
  category: z.string().min(1, "Selecciona una categoría"),
  paymentMethod: z.string().min(1, "Selecciona un método de pago"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface Props {
  onClose: () => void;
}

const CATEGORIES = {
  income: ["Membresías", "Inventario", "Servicios", "Otros"],
  expense: ["Sueldos", "Alquiler", "Servicios", "Mantenimiento", "Limpieza", "Impuestos", "Otros"],
};

export default function AddTransactionModal({ onClose }: Props) {
  const { addTransaction } = useGym();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      paymentMethod: "Efectivo",
    },
  });

  const type = watch("type");

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      await addTransaction({
        ...values,
        date: new Date().toISOString(),
      });
      toast.success("Movimiento registrado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al registrar el movimiento");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
          <h2 className="text-xl font-bold text-foreground">Nuevo Movimiento</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Tipo de Movimiento */}
          <div className="flex p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => setValue("type", "income")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === "income" ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "expense")}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                type === "expense" ? "bg-rose-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Egreso
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Monto</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  {...register("amount")}
                  className="w-full pl-9 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg font-bold"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Descripción</label>
              <div className="relative mt-1">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  {...register("description")}
                  rows={2}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
                  placeholder="Ej: Pago de alquiler abril"
                />
              </div>
              {errors.description && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Categoría</label>
                <div className="relative mt-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    {...register("category")}
                    className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES[type].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {errors.category && <p className="text-xs text-rose-500 mt-1 ml-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Método de Pago</label>
                <div className="relative mt-1">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    {...register("paymentMethod")}
                    className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-border text-sm font-bold text-muted-foreground rounded-xl hover:bg-secondary transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-[2] py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all",
                type === "income" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Registrando..." : "Guardar Movimiento"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
