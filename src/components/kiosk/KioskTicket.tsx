import React, { useState } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import type { KioskResultData } from "@/pages/Kiosk";
import type { UnitConfig } from "@/hooks/useUnitConfig";
import type { TotemTicketType } from "@/hooks/useTotem";

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
  const [loading, setLoading] = useState(false);

  const activeTypes = (ticketTypes ?? []).filter(t => t.active).sort((a, b) => a.display_order - b.display_order);

  const handleGenerate = async (type: TotemTicketType) => {
    if (loading) return;
    setLoading(true);
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type.code,
        priority: type.priority,
        queue_name: "recepcao",
        source: "totem",
        unit_id: unitId,
        device_id: deviceId,
      } as any);
      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: type.label,
        ticketId: ticket.id,
      });
    } catch {
      // hook handles error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg">Voltar</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Selecione o tipo de senha</h1>
        <p className="text-white/70">Escolha a categoria de atendimento</p>
      </div>

      {activeTypes.length === 0 && (
        <div className="bg-white/10 text-white text-center rounded-2xl p-6">
          Nenhum tipo de senha cadastrado para esta unidade.
        </div>
      )}

      <div className="space-y-3">
        {activeTypes.map(t => (
          <button
            key={t.id}
            onClick={() => handleGenerate(t)}
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
                {t.priority > 0 ? `Prioridade ${t.priority}` : "Atendimento por ordem de chegada"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
