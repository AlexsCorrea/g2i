import React from "react";
import { useNavigate } from "react-router-dom";
import { useActiveTvPanels, setSelectedTvPanelId } from "@/hooks/useTvPanels";
import { useInstitutionSettings } from "@/hooks/useTotem";
import { Tv, MapPin, Loader2 } from "lucide-react";

export default function QueueTvSelect() {
  const navigate = useNavigate();
  const { data: panels, isLoading } = useActiveTvPanels();
  const { data: institution } = useInstitutionSettings();
  const institutionName = institution?.name || "OftalmoCenter";

  const handleSelect = (id: string) => {
    setSelectedTvPanelId(id);
    navigate("/painel-tv");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#1e5a8a,#0f3460)" }}
    >
      <div className="w-full max-w-3xl text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-white/15 rounded-2xl flex items-center justify-center mb-4">
            <Tv className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm uppercase tracking-wider">{institutionName}</p>
          <h1 className="text-3xl font-bold mt-1">Qual painel/TV é este?</h1>
          <p className="text-white/70 mt-1">Selecione o painel para começar a exibir as chamadas</p>
        </div>

        {isLoading && (
          <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>
        )}

        {!isLoading && (panels?.length ?? 0) === 0 && (
          <div className="bg-white/10 rounded-2xl p-6 text-center max-w-md mx-auto">
            <p className="text-white/90 font-semibold mb-1">Nenhum painel TV cadastrado</p>
            <p className="text-white/60 text-sm">
              Acesse <span className="font-mono">/admin-autoatendimento</span> e cadastre ao menos um painel TV.
            </p>
          </div>
        )}

        {!isLoading && (panels?.length ?? 0) > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {(panels ?? []).map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="bg-white text-foreground rounded-2xl p-5 text-left shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Tv className="w-5 h-5 text-muted-foreground" />
                  <p className="font-bold text-lg">{p.name}</p>
                </div>
                {p.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.location}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
