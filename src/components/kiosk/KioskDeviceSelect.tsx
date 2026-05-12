import React from "react";
import { Monitor, MapPin, Loader2 } from "lucide-react";
import { useTotemDevices, useTotemUnits } from "@/hooks/useTotem";

interface Props {
  onSelect: (deviceId: string) => void;
}

export function KioskDeviceSelect({ onSelect }: Props) {
  const { data: devices, isLoading } = useTotemDevices();
  const { data: units } = useTotemUnits();

  const unitMap = new Map((units ?? []).map(u => [u.id, u]));
  const activeDevices = (devices ?? []).filter(d => d.active);
  const grouped = new Map<string, typeof activeDevices>();
  activeDevices.forEach(d => {
    const arr = grouped.get(d.unit_id) ?? [];
    arr.push(d);
    grouped.set(d.unit_id, arr);
  });

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-white p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto bg-white/15 rounded-2xl flex items-center justify-center mb-4">
          <Monitor className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold">Qual totem é este?</h1>
        <p className="text-white/70 mt-1">Selecione o equipamento para começar a operar</p>
      </div>

      {isLoading && <Loader2 className="w-6 h-6 animate-spin" />}

      {!isLoading && activeDevices.length === 0 && (
        <div className="bg-white/10 rounded-2xl p-6 text-center max-w-md">
          <p className="text-white/90 font-semibold mb-1">Nenhum totem cadastrado</p>
          <p className="text-white/60 text-sm">
            Acesse <span className="font-mono">/admin-autoatendimento</span> e cadastre uma Unidade e ao menos um Totem físico.
          </p>
        </div>
      )}

      {!isLoading && activeDevices.length > 0 && (
        <div className="w-full max-w-2xl space-y-6">
          {Array.from(grouped.entries()).map(([unitId, list]) => {
            const u = unitMap.get(unitId);
            return (
              <div key={unitId} className="space-y-2">
                <p className="text-white/60 text-xs uppercase tracking-wider px-1">
                  {u?.name ?? "Unidade"}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {list.map(d => (
                    <button
                      key={d.id}
                      onClick={() => onSelect(d.id)}
                      className="bg-white text-foreground rounded-2xl p-4 text-left shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <p className="font-bold text-base">{d.name}</p>
                      {d.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {d.location}
                        </p>
                      )}
                      {d.device_identifier && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {d.device_identifier}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
