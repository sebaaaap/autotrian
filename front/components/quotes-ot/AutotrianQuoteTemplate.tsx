"use client"

import React from "react"
import { QuoteOtItem } from "./quotes-ot-manager"
import { useSettings } from "@/hooks/useSettings"

interface AutotrianQuoteTemplateProps {
    data: QuoteOtItem
    type: "quote" | "ot"
    /** Nota personalizada que escribe el admin antes de imprimir */
    notaCotizacion?: string
}

/**
 * Plantilla de cotización estilo Autotrian.
 * Replica fielmente el diseño LaTeX (autotrianlatex.txt):
 * - Fondos curvos negro/rojo en esquinas superior e inferior (SVG)
 * - Logo arriba a la derecha
 * - Título "Cotización" centrado en negro
 * - Campos: Fecha, Auto, Nombre del Cliente
 * - Tabla con cabecera negra: DESCRIPCIÓN / UNIDADES / PRECIO / IVA 19% / TOTAL
 * - Bloque de totales (Neto, IVA, Total en rojo)
 * - Forma de pago y Nota
 * - Marca de agua central (logo opaco)
 * - Footer con datos del taller
 */
export function AutotrianQuoteTemplate({ data, type, notaCotizacion }: AutotrianQuoteTemplateProps) {
    const { settings, isLoaded } = useSettings()

    if (!isLoaded) {
        return <div className="p-8 text-center text-muted-foreground">Cargando documento...</div>
    }

    // ─── Datos de empresa (desde settings) ──────────────────────────────────
    // Usa SOLO el logo que el admin sube en Settings — sin fallback a archivo inexistente
    const logoUrl = settings.logoBase64 || null
    const ownerName = "Fernando Pastrian"   // nombre fijo por defecto
    const businessName = settings.businessName || "Autotrian"
    const address = settings.address || "Promoncaes 1403 Renca"
    const mail = settings.email || "pastrianfernando@gmail.com"
    const phone = settings.phone || "+569 48481417"
    const formaPago = "Transferencia / Efectivo / Tarjetas"
    const nota = notaCotizacion ?? ""

    // ─── Campos del documento ─────────────────────────────────────────────────
    const fechaRaw = data.date_created || ""
    // Formatear DD/MM/YYYY si viene en ISO
    const fechaDisplay = fechaRaw.includes("-")
        ? fechaRaw.split("-").reverse().join("/")
        : fechaRaw
    const autoCliente = data.vehicle_model
        ? `${data.vehicle_model}${data.vehicle_plate ? " – " + data.vehicle_plate : ""}`
        : data.vehicle_plate || "—"
    const nombreCliente = data.customer_name || "—"

    // ─── Cálculos de totales ──────────────────────────────────────────────────
    const neto = Math.round(data.total / 1.19)
    const iva = Math.round(data.total - neto)
    const total = Math.round(data.total)

    const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`

    // ─── Colores corporativos ──────────────────────────────────────────────────
    const NEGRO = "#22201f"   // autonegro
    const ROJO = "#eb1914"    // autorojo

    return (
        /*
         * Contenedor principal A4.
         * position:relative para que los SVG de fondo queden en absolute.
         * overflow:hidden para recortar los SVG que salen del borde.
         */
        <div
            id="autotrian-document-to-print"
            style={{
                position: "relative",
                width: "210mm",
                minHeight: "297mm",
                background: "#fff",
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                color: NEGRO,
                overflow: "hidden",
                boxSizing: "border-box",
            }}
        >
            {/* ═══════════════════════════════════════════════════════════════
                FONDOS SVG — replica las curvas TikZ del LaTeX
                Superior: rojo (esquina dcha) + negro (franja izquierda)
                Inferior: rojo (esquina izquierda) + negro (franja derecha)
            ═══════════════════════════════════════════════════════════════ */}

            {/* — SVG SUPERIOR — */}
            <svg
                viewBox="0 0 794 130"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", display: "block" }}
                preserveAspectRatio="none"
            >
                {/* Rojo superior (esquina derecha) */}
                <path
                    d={`M 340 42
                        C 490 34, 680 60, 794 143
                        L 794 0
                        Z`}
                    fill={ROJO}
                />
                {/* Negro superior (dominante izquierdo) */}
                <path
                    d={`M 0 0
                        L 0 246
                        C 143 134, 208 119, 310 92
                        C 472 43, 680 30, 794 30
                        L 794 0
                        Z`}
                    fill={NEGRO}
                />
            </svg>

            {/* — SVG INFERIOR — */}
            <svg
                viewBox="0 0 794 130"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "auto", display: "block" }}
                preserveAspectRatio="none"
            >
                {/* Rojo inferior (esquina izquierda) */}
                <path
                    d={`M 454 88
                        C 302 96, 151 60, 0 0
                        L 0 130
                        Z`}
                    fill={ROJO}
                />
                {/* Negro inferior (dominante derecho) */}
                <path
                    d={`M 794 130
                        L 794 0
                        C 651 112, 586 111, 484 108
                        C 322 103, 114 100, 0 100
                        L 0 130
                        Z`}
                    fill={NEGRO}
                />
            </svg>

            {/* ═══════════════════════════════════════════════════════════════
                CONTENIDO — padding para alejarse de los fondos
            ═══════════════════════════════════════════════════════════════ */}
            <div style={{ position: "relative", zIndex: 1, padding: "0 18mm" }}>

                {/* ─── LOGO SUPERIOR DERECHO ─────────────────────────── */}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "10mm", paddingRight: "4mm", minHeight: "22mm" }}>
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt="Logo"
                            style={{ height: "22mm", objectFit: "contain" }}
                        />
                    )}
                </div>

                {/* ─── TÍTULO ─────────────────────────────────────────────── */}
                <div style={{ textAlign: "center", marginTop: "4mm", marginBottom: "6mm" }}>
                    <span style={{ fontSize: "28pt", fontWeight: "bold", color: NEGRO, letterSpacing: "-0.5px" }}>
                        Cotización
                    </span>
                </div>

                {/* ─── DATOS DEL CLIENTE / VEHÍCULO ───────────────────────── */}
                <div style={{ marginBottom: "5mm", fontSize: "11.5pt", lineHeight: "1.65" }}>
                    <div>
                        <span style={{ fontWeight: "bold", color: NEGRO }}>Fecha:</span>
                        &nbsp;&nbsp;{fechaDisplay}
                    </div>
                    <div>
                        <span style={{ fontWeight: "bold", color: NEGRO }}>Auto:</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;{autoCliente}
                    </div>
                    <div>
                        <span style={{ fontWeight: "bold", color: NEGRO }}>Cliente:</span>
                        &nbsp;&nbsp;{nombreCliente}
                    </div>
                </div>

                {/* ─── TABLA DE PRODUCTOS ──────────────────────────────────── */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "10pt",
                        marginBottom: "0",
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: NEGRO, color: "#fff" }}>
                            <th style={{ textAlign: "left", padding: "5px 7px", fontWeight: "bold", fontSize: "9pt", width: "45%" }}>
                                DESCRIPCIÓN
                            </th>
                            <th style={{ textAlign: "center", padding: "5px 7px", fontWeight: "bold", fontSize: "9pt", width: "12%" }}>
                                UNIDADES
                            </th>
                            <th style={{ textAlign: "center", padding: "5px 7px", fontWeight: "bold", fontSize: "9pt", width: "15%" }}>
                                PRECIO
                            </th>
                            <th style={{ textAlign: "center", padding: "5px 7px", fontWeight: "bold", fontSize: "9pt", width: "14%" }}>
                                IVA (19%)
                            </th>
                            <th style={{ textAlign: "center", padding: "5px 7px", fontWeight: "bold", fontSize: "9pt", width: "14%" }}>
                                TOTAL
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, i) => {
                            const rowTotal = item.price * item.quantity
                            const rowNeto = rowTotal / 1.19
                            const rowIva = rowTotal - rowNeto
                            return (
                                <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                                    <td style={{ padding: "5px 7px", fontSize: "10pt" }}>{item.product_name}</td>
                                    <td style={{ padding: "5px 7px", textAlign: "center", fontSize: "10pt" }}>{item.quantity}</td>
                                    <td style={{ padding: "5px 7px", textAlign: "center", fontSize: "10pt" }}>
                                        {fmt(Math.round(rowNeto))}
                                    </td>
                                    <td style={{ padding: "5px 7px", textAlign: "center", fontSize: "10pt" }}>
                                        {fmt(Math.round(rowIva))}
                                    </td>
                                    <td style={{ padding: "5px 7px", textAlign: "center", fontSize: "10pt" }}>
                                        {fmt(Math.round(rowTotal))}
                                    </td>
                                </tr>
                            )
                        })}
                        {/* Fila vacía de relleno (como en el LaTeX) */}
                        <tr style={{ height: "60mm" }}>
                            <td colSpan={5} />
                        </tr>
                    </tbody>
                </table>

                {/* ─── MARCA DE AGUA (logo centrado opaco, como LaTeX) ──────────── */}
                {logoUrl && (
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            opacity: 0.12,
                            pointerEvents: "none",
                            marginTop: "-55mm",
                            zIndex: 0,
                        }}
                    >
                        <img
                            src={logoUrl}
                            alt=""
                            style={{ width: "55mm", objectFit: "contain" }}
                        />
                    </div>
                )}

                {/* ─── SEPARADOR ───────────────────────────────────────────── */}
                <div style={{ borderTop: `1px solid ${NEGRO}`, marginTop: "4mm", marginBottom: "5mm" }} />

                {/* ─── BLOQUE TOTALES (alineado a la derecha) ──────────────── */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "5mm" }}>
                    <div style={{ fontSize: "11.5pt", lineHeight: "1.8", textAlign: "right" }}>
                        <div>
                            Neto: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fmt(neto)}
                        </div>
                        <div>
                            IVA (19%): &nbsp;&nbsp;&nbsp;{fmt(iva)}
                        </div>
                        <div style={{ fontSize: "15pt", fontWeight: "bold", color: ROJO }}>
                            Total: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{fmt(total)}
                        </div>
                    </div>
                </div>

                {/* ─── FORMA DE PAGO Y NOTA ────────────────────────────── */}
                <div style={{ fontSize: "10.5pt", lineHeight: "1.7", marginBottom: "8mm" }}>
                    <div>
                        <span style={{ fontWeight: "bold" }}>Forma de pago:</span>
                        &nbsp;&nbsp;{formaPago}
                    </div>
                    {nota && (
                        <div>
                            <span style={{ fontWeight: "bold" }}>Nota:</span>
                            &nbsp;&nbsp;{nota}
                        </div>
                    )}
                </div>

            </div>{/* fin padding */}

            {/* ─── FOOTER (datos del taller sobre la franja negra inferior) ── */}
            <div
                style={{
                    position: "absolute",
                    bottom: "18mm",
                    left: "18mm",
                    right: "18mm",
                    zIndex: 2,
                    color: "#fff",
                }}
            >
                <div style={{ fontSize: "13pt", fontWeight: "bold", marginBottom: "3mm", color: "#fff" }}>
                    {ownerName}
                </div>
                <div style={{ fontSize: "10pt", lineHeight: "1.7" }}>
                    <span style={{ fontWeight: "bold" }}>Empresa:</span> {businessName}
                    &nbsp;&nbsp;&nbsp;
                    <span style={{ fontWeight: "bold" }}>Dirección:</span> {address}
                    <br />
                    <span style={{ fontWeight: "bold" }}>Mail:</span> {mail}
                    &nbsp;&nbsp;&nbsp;
                    <span style={{ fontWeight: "bold" }}>Teléfono:</span> {phone}
                </div>
            </div>

        </div>
    )
}
