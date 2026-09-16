"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CreditCard, Wallet, X } from "lucide-react";
import { useGym } from "@/lib/context/GymContext";
import type { Payment } from "@/lib/types";

/** Mismos metodos que ofrece el alta manual de movimientos en Finanzas. */
const PAYMENT_METHODS = ["Efectivo", "Transferencia", "Tarjeta"] as const;

interface Props {
  payment: Payment;
  onClose: () => void;
}

export default function RegisterPaymentDialog({ payment, onClose }: Props) {
  const { registerPayment } = useGym();
  const [method, setMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await registerPayment(payment.id, method);
      toast.success(`Pago de ${payment.memberName} registrado`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo registrar el pago");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-payment-title"
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 id="register-payment-title" className="font-bold text-foreground">
                Registrar pago
              </h2>
              <p className="text-xs text-muted-foreground">Dejá la cuota saldada y asentada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-foreground">{payment.memberName}</span>
              <span className="text-lg font-bold text-foreground">
                ${payment.amount.toLocaleString("es-AR")}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
              <span>{payment.plan}</span>
              <span>
                Vence el{" "}
                {new Date(payment.dueDate).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="payment-method" className="text-xs font-bold text-muted-foreground uppercase">
              Método de pago
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                id="payment-method"
                value={method}
                onChange={e => setMethod(e.target.value)}
                disabled={saving}
                className="w-full appearance-none bg-secondary border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-60"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Se marca la cuota como pagada y se suma un ingreso en Finanzas.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {saving ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
