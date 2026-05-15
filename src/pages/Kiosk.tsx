import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, ArrowLeftRight } from "lucide-react";
import { KioskHome } from "@/components/kiosk/KioskHome";
import { KioskTicket } from "@/components/kiosk/KioskTicket";
import { KioskCheckin } from "@/components/kiosk/KioskCheckin";
import { KioskResult } from "@/components/kiosk/KioskResult";
import { KioskDeviceSelect } from "@/components/kiosk/KioskDeviceSelect";
import { useActiveTotemContext } from "@/hooks/useTotem";

export type KioskFlow = "home" | "ticket" | "checkin" | "result";

export interface KioskResultData {
  ticketNumber: string;
  ticketType: string;
  priorityCode?: string;
  patientName?: string;
  professional?: string;
  time?: string;
  queuePosition?: number;
  ticketId?: string;
}

const TIMEOUT_MULTIPLIER: Record<KioskFlow, number> = {
  home: 0,
  ticket: 1,
  checkin: 3,
  result: 0,
};

export default function Kiosk() {
  const navigate = useNavigate();
  const { deviceId, setDeviceId, device, unit, ticketTypes, ticketTypePriorities, isLoading, deviceInactive, unitInactive } = useActiveTotemContext();
  const [flow, setFlow] = useState<KioskFlow>("home");
  const [resultData, setResultData] = useState<KioskResultData | null>(null);

  const baseTimeoutMs = (unit?.totem_timeout_seconds || 60) * 1000;

  const goHome = useCallback(() => {
    setFlow("home");
    setResultData(null);
  }, []);

  const showResult = (data: KioskResultData) => {
    setResultData(data);
    setFlow("result");
  };

  useEffect(() => {
    if (flow === "home" || flow === "result") return;
    const multiplier = TIMEOUT_MULTIPLIER[flow];
    const timeoutMs = baseTimeoutMs * multiplier;
    if (timeoutMs <= 0) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(goHome, timeoutMs);
    };
    reset();
    const events = ["touchstart", "touchmove", "mousedown", "mousemove", "keydown", "keyup", "keypress", "scroll", "input", "change", "focus", "click"];
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach(e => document.removeEventListener(e, reset));
    };
  }, [flow, goHome, baseTimeoutMs]);

  // ── Device selection gate ──
  if (!deviceId || (deviceId && !isLoading && !device)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#1e5a8a,#0f3460)" }}>
        <div className="w-full max-w-3xl">
          <KioskDeviceSelect onSelect={(id) => { setDeviceId(id); }} />
        </div>
      </div>
    );
  }

  // Block when device or unit are inactive
  if (deviceInactive || unitInactive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 text-center" style={{ background: "linear-gradient(135deg,#1e5a8a,#0f3460)" }}>
        <div className="bg-black/30 backdrop-blur rounded-2xl p-8 max-w-md space-y-4">
          <h2 className="text-2xl font-bold">Totem indisponível</h2>
          <p className="text-white/80 text-sm">
            {deviceInactive
              ? "Este totem está marcado como inativo nas configurações."
              : "A unidade vinculada a este totem está inativa."}
          </p>
          <button
            onClick={() => navigate("/kiosk/select")}
            className="bg-white text-black rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white/90"
          >
            Selecionar outro totem
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !unit) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#1e5a8a,#0f3460)" }}>
        Carregando configurações…
      </div>
    );
  }

  const primary = unit.primary_color || "hsl(210,85%,45%)";
  const secondary = unit.secondary_color || "hsl(210,85%,30%)";
  const bgStyle = unit.background_image_url
    ? { backgroundImage: `url(${unit.background_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${primary}, ${secondary})` };

  // Legacy-compatible config object for child components
  const legacyConfig = { ...unit, unit_name: unit.name } as any;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={bgStyle}>
      <div className="w-full max-w-lg">
        {flow === "home" && <KioskHome onSelect={setFlow} unit={unit} />}
        {flow === "ticket" && <KioskTicket onBack={goHome} onResult={showResult} config={legacyConfig} ticketTypes={ticketTypes} typePriorities={ticketTypePriorities} unitId={unit.id} deviceId={deviceId} />}
        {flow === "checkin" && <KioskCheckin onBack={goHome} onResult={showResult} />}
        {flow === "result" && resultData && <KioskResult data={resultData} onBack={goHome} config={legacyConfig} />}
      </div>

      {/* Discreet device footer */}
      <div className="fixed bottom-2 right-2 flex items-center gap-2 text-white/50 text-[11px] bg-black/20 backdrop-blur rounded-full px-3 py-1">
        <SettingsIcon className="w-3 h-3" />
        <span>{unit.name} • {device?.name}</span>
        <button
          onClick={() => {
            if (confirm("Trocar o totem deste equipamento?")) {
              setDeviceId(null);
              window.location.reload();
            }
          }}
          className="hover:text-white transition-colors flex items-center gap-1 ml-1 border-l border-white/20 pl-2"
          title="Trocar totem"
        >
          <ArrowLeftRight className="w-3 h-3" /> Trocar
        </button>
      </div>
    </div>
  );
}
