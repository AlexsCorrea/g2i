import React, { useMemo, useState } from "react";
import { ArrowLeft, Tag, ChevronLeft } from "lucide-react";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import { useTicketTypePriorities, type TotemTicketType } from "@/hooks/useTotem";
import { PRIORITY_LIST, priorityMeta, type PriorityCode } from "@/lib/queuePriority";
import type { KioskResultData } from "@/pages/Kiosk";
import type { UnitConfig } from "@/hooks/useUnitConfig";

interface Props {
  onBack: () => void;
  onResult: (data: KioskResultData) => void;
  config?: UnitConfig | null;
  ticketTypes: TotemTicketType[];
  unitId: string;
  deviceId: string;
}

export function KioskTicket({ onBack, onResult, ticketTypes, unitId, deviceId }: Props) {
  const generateTicket = useGenerateTicket();
  const { data: typePriorities } = useTicketTypePriorities(unitId);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TotemTicketType | null>(null);

  const activeTypes = useMemo(
    () => (ticketTypes ?? []).filter((t) => t.active).sort((a, b) => a.display_order - b.display_order),
    [ticketTypes],
  );

  const allowedPriorities = useMemo<PriorityCode[]>(() => {
    if (!selectedType) return [];
    const codes = (typePriorities ?? [])
      .filter((p) => p.ticket_type_id === selectedType.id && p.enabled)
      .map((p) => p.priority_code as PriorityCode);
    if (codes.length === 0) return ["normal"];
    // keep canonical order
    return PRIORITY_LIST.filter((p) => codes.includes(p.code)).map((p) => p.code);
  }, [selectedType, typePriorities]);

  const generate = async (type: TotemTicketType, priorityCode: PriorityCode) => {
    if (loading) return;
    setLoading(true);
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type.code,
        priority_code: priorityCode,
        prefix: type.prefix || "N",
        queue_name: "recepcao",
        source: "totem",
        unit_id: unitId,
        device_id: deviceId,
      } as any);
      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: type.label,
        ticketId: ticket.id,
        priorityCode,
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 — pick type
  if (!selectedType) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Voltar</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Selecione o tipo de atendimento</h1>
          <p className="text-white/70">Escolha a categoria desejada</p>
        </div>

        {activeTypes.length === 0 && (
          <div className="bg-white/10 text-white text-center rounded-2xl p-6">
            Nenhum tipo de atendimento cadastrado para esta unidade.
          </div>
        )}

        <div className="space-y-3">
          {activeTypes.map((t) => {
            const allowed = (typePriorities ?? []).filter((p) => p.ticket_type_id === t.id && p.enabled);
            const auto = allowed.length === 1;
            return (
              <button
                key={t.id}
                onClick={() => {
                  if (auto) {
                    generate(t, (allowed[0]?.priority_code as PriorityCode) || "normal");
                  } else {
                    setSelectedType(t);
                  }
                }}
                disabled={loading}
                className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-xl"
                  style={{ backgroundColor: t.color || "#1e5a8a" }}
                >
                  {t.prefix || <Tag className="w-6 h-6" />}
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-bold text-foreground">{t.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {auto ? "Atendimento normal" : `${allowed.length} prioridades disponíveis`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STEP 2 — pick priority
  return (
    <div className="space-y-6">
      <button onClick={() => setSelectedType(null)} className="flex items-center gap-2 text-white/80 hover:text-white">
        <ChevronLeft className="w-5 h-5" />
        <span className="text-lg">Trocar tipo</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">{selectedType.label}</h1>
        <p className="text-white/70">Selecione a prioridade do atendimento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allowedPriorities.map((code) => {
          const meta = priorityMeta(code);
          return (
            <button
              key={code}
              onClick={() => generate(selectedType, code)}
              disabled={loading}
              className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black"
                style={{ backgroundColor: meta.hex }}
              >
                {meta.shortLabel}
              </div>
              <div className="text-left flex-1">
                <h3 className="text-base font-bold text-foreground">{meta.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {code === "normal" ? "Por ordem de chegada" : "Atendimento prioritário (Lei 10.048)"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
