"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, UserPlus, AlertCircle } from "lucide-react";
import { useGym } from "@/lib/context/GymContext";
import { PlanType } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const memberSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  dni: z.string().regex(/^\d{7,8}$/, "El DNI debe ser numérico y tener 7 u 8 dígitos"),
  email: z.string().email("Email inválido").or(z.literal("")),
  phone: z.string().min(8, "Teléfono demasiado corto").or(z.literal("")),
  plan: z.enum(["daily", "monthly", "quarterly"] as const),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface Props {
  onClose: () => void;
}

export default function AddMemberModal({ onClose }: Props) {
  const { addMember } = useGym();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      plan: "monthly",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: MemberFormValues) => {
    try {
      const initials = data.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      await addMember({
        ...data,
        status: "active",
        avatar: initials,
        autoRenew: false,
      });

      toast.success("Socio registrado con éxito");
      onClose();
    } catch (error) {
      toast.error("Error al registrar el socio");
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
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Nuevo Socio</h2>
              <p className="text-xs text-muted-foreground">Completá los datos del nuevo miembro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nombre completo *</label>
              <input {...register("name")} className={inputClass(errors.name)} placeholder="Ej: Juan García" />
              {errors.name && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">DNI *</label>
              <input {...register("dni")} className={inputClass(errors.dni)} placeholder="30123456" />
              {errors.dni && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dni.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Teléfono</label>
              <input {...register("phone")} className={inputClass(errors.phone)} placeholder="+54 9 11..." />
              {errors.phone && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input {...register("email")} type="email" className={inputClass(errors.email)} placeholder="correo@ejemplo.com" />
              {errors.email && <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Plan *</label>
              <select {...register("plan")} className={inputClass(errors.plan)}>
                <option value="daily">Pase Diario</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Fecha de inicio *</label>
              <input {...register("startDate")} type="date" className={inputClass(errors.startDate)} />
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
              {isSubmitting ? "Registrando..." : "Registrar Socio"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
