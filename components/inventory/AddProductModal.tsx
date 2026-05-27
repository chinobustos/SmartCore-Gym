"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Package, AlertCircle } from "lucide-react";
import { useGym } from "@/lib/context/GymContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  category: z.string().min(1, "La categoría es requerida"),
  price: z.preprocess((v) => Number(v), z.number().min(0, "El precio no puede ser negativo")),
  stock: z.preprocess((v) => Number(v), z.number().min(0, "El stock no puede ser negativo")),
  minStock: z.preprocess((v) => Number(v), z.number().min(0, "El stock mínimo no puede ser negativo")),
  unit: z.string().min(1, "La unidad es requerida"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Props {
  onClose: () => void;
}

export default function AddProductModal({ onClose }: Props) {
  const { addInventoryItem } = useGym();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "Bebidas",
      stock: 0,
      minStock: 5,
      unit: "unidades",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await addInventoryItem(data);
      toast.success("Producto agregado al inventario");
      onClose();
    } catch (error) {
      toast.error("Error al agregar el producto");
    }
  };

  const inputClass = (error?: any) => `
    w-full bg-secondary border rounded-lg px-3 py-2.5 text-sm text-foreground 
    placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all
    ${error ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/50"}
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Nuevo Producto</h2>
              <p className="text-xs text-muted-foreground">Ingresa las especificaciones del producto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre y Especificación *</label>
              <input {...register("name")} className={inputClass(errors.name)} placeholder="Ej: CocaCola cero de 500ml" />
              {errors.name && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Categoría *</label>
                <select {...register("category")} className={inputClass(errors.category)}>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Proteínas">Proteínas</option>
                  <option value="Creatinas">Creatinas</option>
                  <option value="Pre-Entreno">Pre-Entreno</option>
                  <option value="Aminoácidos">Aminoácidos</option>
                  <option value="Vitaminas">Vitaminas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Precio de Venta *</label>
                <input {...register("price")} type="number" className={inputClass(errors.price)} placeholder="0.00" />
                {errors.price && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.price.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stock Inicial *</label>
                <input {...register("stock")} type="number" className={inputClass(errors.stock)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stock Mínimo *</label>
                <input {...register("minStock")} type="number" className={inputClass(errors.minStock)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Unidad (ej: unidades, kg) *</label>
              <input {...register("unit")} className={inputClass(errors.unit)} placeholder="unidades" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Agregando..." : "Agregar Producto"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
