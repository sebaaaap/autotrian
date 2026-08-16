"use client";

import { useState } from "react";
import { Mail, Send, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const TEST_EMAIL = "sebastian.parada1@mail.udp.cl";
type Period = "daily" | "weekly" | "monthly";

export function EmailReportTest() {
    const [period, setPeriod] = useState<Period>("daily");
    const [customEmail, setCustomEmail] = useState(TEST_EMAIL);
    const [loadingTest, setLoadingTest] = useState(false);
    const [loadingAdmins, setLoadingAdmins] = useState(false);

    const sendReport = async (emails: string[] | null, mode: "test" | "admins") => {
        const setLoading = mode === "test" ? setLoadingTest : setLoadingAdmins;
        setLoading(true);
        try {
            const payload = { period, emails };
            const { data } = await api.post("/reports/email/send", payload);
            const count = data?.recipients?.length || emails?.length || 0;
            toast.success(
                mode === "test"
                    ? `Reporte de prueba enviado a ${emails?.[0]}`
                    : `Reporte enviado a ${count || "los"} administradores`
            );
        } catch (error: any) {
            const detail = error?.response?.data?.detail || error?.response?.data?.message;
            toast.error(detail || "No se pudo enviar el reporte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground">Prueba de reportes por correo</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Envía el reporte diario/semanal/mensual por Resend. Mientras no haya dominio verificado,
                            Resend gratis solo permite enviar al correo dueño de la cuenta.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo de reporte</label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as Period)}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        >
                            <option value="daily">Diario</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensual</option>
                        </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correo de prueba</label>
                        <input
                            type="email"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder={TEST_EMAIL}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                        onClick={() => sendReport([customEmail || TEST_EMAIL], "test")}
                        disabled={loadingTest || !customEmail}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {loadingTest ? "Enviando prueba..." : "Enviar prueba a mi correo"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => sendReport(null, "admins")}
                        disabled={loadingAdmins}
                        className="gap-2"
                    >
                        <Users className="h-4 w-4" />
                        {loadingAdmins ? "Enviando a admins..." : "Enviar a administradores"}
                    </Button>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm flex gap-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <div className="font-bold">Nota Resend</div>
                        <p className="mt-1">
                            Hoy usa <span className="font-mono">{TEST_EMAIL}</span> para probar. Mañana, al verificar el dominio
                            del negocio en Resend, el botón “Enviar a administradores” quedará listo para enviar a todos los
                            usuarios admin activos de esa empresa con email configurado.
                        </p>
                    </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 text-sm flex gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                        El envío respeta <span className="font-mono">company_id</span>: cada negocio recibe solo sus propios reportes,
                        logo, ventas, gastos, inventario y administradores.
                    </p>
                </div>
            </div>
        </div>
    );
}
