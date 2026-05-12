import React, { useEffect, useState } from "react";
import { CheckCircle2, Printer, Home, Clock, QrCode, AlertCircle } from "lucide-react";
import type { KioskResultData } from "@/pages/Kiosk";
import type { UnitConfig } from "@/hooks/useUnitConfig";
import { priorityMeta } from "@/lib/queuePriority";

interface Props {
  data: KioskResultData;
  onBack: () => void;
  config?: UnitConfig | null;
}

const typeLabels: Record<string, string> = {
  normal: "Normal",
  consulta: "Consulta",
  retorno: "Retorno",
  retorno_pos_operatorio: "Retorno Pós-op",
  exames: "Exames",
  financeiro: "Financeiro",
  triagem: "Triagem",
  urgencia: "Urgência",
};

export function KioskResult({ data, onBack, config }: Props) {
  const countdownTotal = (config as any)?.result_countdown_seconds ?? 30;
  const [countdown, setCountdown] = useState(countdownTotal);
  const [printError, setPrintError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { onBack(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack]);

  // Auto-print if configured
  useEffect(() => {
    if (config?.print_enabled && config?.print_auto) {
      setTimeout(() => handlePrint(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printEnabled = config?.print_enabled ?? false;
  const printShowLogo = config?.print_show_logo ?? true;
  const printShowQr = config?.print_show_qr ?? true;
  const printHeader = config?.print_header_text || "Aguarde sua chamada no painel";
  const printFooter = config?.print_footer_text || "Apresente esta senha quando solicitado";
  const printTemplate = config?.print_template || "standard";
  const paperWidth = config?.print_paper_width || "80mm";
  const unitName = config?.unit_name || "Hospital";
  const logoUrl = config?.logo_url;
  const marginTop = (config as any)?.print_margin_top ?? 2;
  const marginBottom = (config as any)?.print_margin_bottom ?? 2;
  const marginLeft = (config as any)?.print_margin_left ?? 2;
  const marginRight = (config as any)?.print_margin_right ?? 2;
  const blockSpacing = (config as any)?.print_block_spacing ?? 6;
  const cutExtraHeight = (config as any)?.print_cut_extra_height ?? 10;

  const portalUrl = `${window.location.origin}/portal`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR");
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handlePrint = () => {
    setPrintError(false);
    try {
      const printWindow = window.open("", "_blank", "width=400,height=600");
      if (!printWindow) { setPrintError(true); return; }

      const isCompact = printTemplate === "compact";
      const fontSize = config?.print_font_size === "extra_large" ? "48px" : config?.print_font_size === "large" ? "40px" : "32px";
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(portalUrl)}`;

      printWindow.document.write(`<!DOCTYPE html><html><head><title>Senha ${data.ticketNumber}</title>
<style>
  @page { size: ${paperWidth} auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${paperWidth}; height: auto; overflow: hidden; }
  body {
    font-family: 'Courier New', monospace;
    text-align: center;
    padding: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
  }
  .divider { border-top: 1px dashed #000; margin: ${blockSpacing}px 0; }
  .ticket-number { font-size: ${fontSize}; font-weight: 900; letter-spacing: 4px; margin: ${blockSpacing}px 0; }
  .ticket-type { font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 4px 0; padding: 2px 8px; border: 1px solid #000; display: inline-block; }
  .logo { max-width: 60px; max-height: 40px; margin: 0 auto 4px; }
  .unit-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
  .info { font-size: 11px; margin: 2px 0; }
  .header-msg { font-size: 11px; font-weight: bold; margin: ${blockSpacing}px 0 4px; }
  .footer-msg { font-size: 10px; color: #555; }
  .qr { margin: ${blockSpacing}px auto; }
  .datetime { font-size: 10px; color: #666; }
  .cut-space { height: ${cutExtraHeight}mm; }
</style></head><body>`);

      if (printShowLogo && logoUrl && !isCompact) {
        printWindow.document.write(`<img src="${logoUrl}" class="logo" />`);
      }
      printWindow.document.write(`<div class="unit-name">${unitName}</div>`);
      printWindow.document.write(`<div class="divider"></div>`);
      printWindow.document.write(`<div class="ticket-number">${data.ticketNumber}</div>`);
      printWindow.document.write(`<div class="ticket-type">${typeLabels[data.ticketType] || data.ticketType}</div>`);
      if (data.priorityCode && data.priorityCode !== "normal") {
        printWindow.document.write(`<div class="info" style="margin-top:4px;font-weight:bold">Prioridade: ${priorityMeta(data.priorityCode).label}</div>`);
      }

      if (data.patientName && !isCompact) {
        printWindow.document.write(`<div class="info" style="margin-top:${blockSpacing}px">${data.patientName}</div>`);
      }
      if (data.professional && !isCompact) {
        printWindow.document.write(`<div class="info">Dr(a). ${data.professional}</div>`);
      }
      if (data.time) {
        printWindow.document.write(`<div class="info">Horário: ${data.time}</div>`);
      }

      printWindow.document.write(`<div class="divider"></div>`);
      printWindow.document.write(`<div class="datetime">${dateStr} às ${timeStr}</div>`);
      printWindow.document.write(`<div class="header-msg">${printHeader}</div>`);

      if (printShowQr && !isCompact) {
        printWindow.document.write(`<img src="${qrUrl}" class="qr" width="100" height="100" />`);
        printWindow.document.write(`<div class="info" style="font-size:9px">Acompanhe pelo celular</div>`);
      }

      printWindow.document.write(`<div class="divider"></div>`);
      printWindow.document.write(`<div class="footer-msg">${printFooter}</div>`);
      printWindow.document.write(`<div class="cut-space"></div>`);
      printWindow.document.write(`</body></html>`);
      printWindow.document.close();

      // Print after images load, then close immediately
      const doPrint = () => {
        try {
          printWindow.print();
          const copies = config?.print_copies || 1;
          for (let i = 1; i < copies; i++) printWindow.print();
        } catch { setPrintError(true); }
        setTimeout(() => { try { printWindow.close(); } catch {} }, 500);
      };

      printWindow.onload = doPrint;
      // Fallback
      setTimeout(() => {
        try { if (!printWindow.closed) doPrint(); } catch {}
      }, 2000);
    } catch {
      setPrintError(true);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto" />
        <h1 className="text-2xl font-bold text-white">
          {data.patientName ? "Check-in realizado com sucesso!" : "Senha emitida com sucesso!"}
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">Sua senha</p>
        <p className="text-6xl font-black text-[hsl(var(--primary))] tracking-wider">{data.ticketNumber}</p>
        <div className="inline-block bg-[hsl(var(--primary)/0.1)] rounded-full px-4 py-1">
          <p className="text-sm font-medium text-[hsl(var(--primary))]">{typeLabels[data.ticketType] || data.ticketType}</p>
        </div>

        {data.patientName && (
          <div className="border-t border-[hsl(var(--border))] pt-4 space-y-1">
            <p className="font-bold text-lg text-[hsl(var(--foreground))]">{data.patientName}</p>
            {data.professional && <p className="text-[hsl(var(--muted-foreground))]">Dr(a). {data.professional}</p>}
            {data.time && (
              <p className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))]">
                <Clock className="w-4 h-4" /> {data.time}
              </p>
            )}
          </div>
        )}

        {data.queuePosition && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Posição na fila: <strong>{data.queuePosition}º</strong>
          </p>
        )}

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {dateStr} às {timeStr}
        </p>

        <div className="border-t border-[hsl(var(--border))] pt-4">
          <div className="flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))]">
            <QrCode className="w-4 h-4" />
            <p className="text-xs">Acompanhe sua fila pelo celular em <strong>{portalUrl.replace(/https?:\/\//, '')}</strong></p>
          </div>
        </div>
      </div>

      <p className="text-white/80 text-base">Aguarde sua chamada no painel da sala de espera</p>

      {printError && (
        <div className="flex items-center justify-center gap-2 bg-red-500/20 border border-red-400/40 rounded-xl p-3">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <span className="text-red-200 text-sm">Falha na impressão. Sua senha foi gerada normalmente.</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 h-14 bg-white/10 border-2 border-white/30 text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-[0.98]"
        >
          <Printer className="w-5 h-5" />
          {printError ? "Reimprimir" : "Imprimir"}
        </button>
        <button
          onClick={onBack}
          className="flex-1 h-14 bg-white text-[hsl(var(--primary))] text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Home className="w-5 h-5" />
          Início
        </button>
      </div>

      <p className="text-white/50 text-sm">Retornando para a tela inicial em {countdown} segundos</p>
    </div>
  );
}
