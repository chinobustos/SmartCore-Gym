"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Tag, AlertCircle, Plus, Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useGym } from "@/lib/context/GymContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Plan } from "@/lib/types";

const planSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(60, "Máximo 60 caracteres"),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  durationDays: z.coerce.number().int("Debe ser un número entero").min(1, "Mínimo 1 día"),
  popular: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface Props {
  /** Plan a editar. Si no viene, el dialogo crea uno nuevo. */
  plan?: Plan;
  onClose: () => void;
}

/** Convierte dias a un texto legible: 1 dia, 30 dias, 3 meses, 1 año. */
export function formatDuration(days: number): string {
  if (days === 1) return "1 día";
  if (days === 365) return "1 año";
  if (days % 30 === 0 && days >= 60) return `${days / 30} meses`;
  return `${days} días`;
}

export default function PlanFormDialog({ plan, onClose }: Props) {
  const { addPlan, updatePlan, deletePlan } = useGym();
  const isEditing = Boolean(plan);

  const [features, setFeatures] = useState<string[]>(plan?.features ?? []);
  const [featureDraft, setFeatureDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: plan?.name ?? "",
      price: plan?.price ?? 0,
      durationDays: plan?.durationDays ?? 30,
      popular: plan?.popular ?? false,
    },
  });

  const popular = watch("popular");
  const durationDays = watch("durationDays");

  const addFeature = () => {
    const value = featureDraft.trim();
    if (!value) return;
    if (features.includes(value)) {
      toast.error("Ese beneficio ya está en la lista");
      return;
    }
    setFeatures(prev => [...prev, value]);
    setFeatureDraft("");
  };

  const onSubmit = async (data: PlanFormValues) => {
    try {
      const payload = { ...data, features };
      if (isEditing && plan) {
        await updatePlan(plan.id, payload);
        toast.success("Plan actualizado");
      } else {
        await addPlan(payload);
        toast.success("Plan creado");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo guardar el plan");
    }
  };

  const handleDelete = async () => {
    if (!plan) return;
    try {
      await deletePlan(plan.id);
      toast.success("Plan eliminado");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo eliminar el plan");
    }
  };

  const inputClass = (error?: any) => `
    w-full bg-secondary border rounded-lg px-3 py-2.5 text-sm text-foreground
    placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all
    ${error ? "border-red-500 focus:ring-red-500/20" : "border-border focus:ring-primary/50"}
  `;

  return (
    <>
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-dialog-title"
          className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15">
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 id="plan-dialog-title" className="font-bold text-foreground">
                  {isEditing ? "Editar Plan" : "Nuevo Plan"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isEditing ? "Modificá los datos del plan" : "Definí un plan para tus socios"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre del plan *</label>
              <input {...register("name")} className={inputClass(errors.name)} placeholder="Ej: Membresía Mensual" />
              {errors.name && (
                <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Precio (ARS) *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  {...register("price")}
                  className={inputClass(errors.price)}
                  placeholder="12000"
                />
                {errors.price && (
                  <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duración (días) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  {...register("durationDays")}
                  className={inputClass(errors.durationDays)}
                  placeholder="30"
                />
                {errors.durationDays ? (
                  <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.durationDays.message}
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Se muestra como &quot;{formatDuration(Number(durationDays) || 0)}&quot;
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Beneficios incluidos</label>
              <div className="flex gap-2">
                <input
                  value={featureDraft}
                  onChange={e => setFeatureDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      // Evita que Enter dispare el submit del formulario.
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  className={inputClass()}
                  placeholder="Ej: Acceso ilimitado"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  aria-label="Agregar beneficio"
                  className="shrink-0 px-3 rounded-lg bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {features.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {features.map((feature, index) => (
                    <li
                      key={feature}
                      className="flex items-center justify-between gap-2 bg-secondary rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{feature}</span>
                      <button
                        type="button"
                        onClick={() => setFeatures(prev => prev.filter((_, i) => i !== index))}
                        aria-label={`Quitar ${feature}`}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="button"
              onClick={() => setValue("popular", !popular)}
              aria-pressed={popular}
              className={`w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                popular ? "border-primary/40 bg-primary/10" : "border-border bg-secondary"
              }`}
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                <Star className={`w-4 h-4 ${popular ? "text-primary" : "text-muted-foreground"}`} />
                Destacar como &quot;Popular&quot;
              </span>
              <span
                className={`text-xs font-semibold ${popular ? "text-primary" : "text-muted-foreground"}`}
              >
                {popular ? "Sí" : "No"}
              </span>
            </button>

            <div className="flex items-center gap-2 pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Eliminar
                </button>
              )}
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear plan"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <ConfirmDialog
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar plan"
        description={`¿Seguro que querés eliminar "${plan?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  );
}
