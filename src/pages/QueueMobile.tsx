import React, { useState, useEffect, useCallback, useRef } from "react";
import { Ticket, Bell, BellOff, BellRing, Clock, Users, AlertTriangle, Volume2, Smartphone } from "lucide-react";
import { useGenerateTicket, useQueueTicketById, useQueueTickets } from "@/hooks/useQueueTickets";

const ticketTypes = [
  { id: "normal", label: "Normal", description: "Atendimento geral" },
  { id: "preferencial", label: "Preferencial", description: "Gestantes, PCD" },
  { id: "preferencial_60", label: "60+", description: "Idosos 60+" },
  { id: "preferencial_80", label: "80+", description: "Idosos 80+" },
  { id: "consulta", label: "Consulta", description: "Sem agendamento" },
];

type NotifState = "active" | "denied" | "foreground_only" | "ios_no_pwa" | "not_configured";

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  return (window.matchMedia("(display-mode: standalone)").matches) || (window.navigator as any).standalone === true;
}

function getNotifState(): NotifState {
  if (!("Notification" in window)) {
    if (isIOS() && !isStandalone()) return "ios_no_pwa";
    return "foreground_only";
  }
  if (Notification.permission === "granted") return "active";
  if (Notification.permission === "denied") return "denied";
  return "not_configured";
}

function NotifBadge({ state }: { state: NotifState }) {
  const configs: Record<NotifState, { icon: React.ReactNode; label: string; bg: string; border: string; text: string }> = {
    active: {
      icon: <Bell className="w-4 h-4 text-green-300" />,
      label: "Alertas ativos",
      bg: "bg-green-500/20", border: "border-green-400/40", text: "text-green-200",
    },
    denied: {
      icon: <BellOff className="w-4 h-4 text-red-300" />,
      label: "Notificações recusadas neste dispositivo",
      bg: "bg-red-500/20", border: "border-red-400/40", text: "text-red-200",
    },
    foreground_only: {
      icon: <Bell className="w-4 h-4 text-blue-300" />,
      label: "Alertas disponíveis com o portal aberto",
      bg: "bg-blue-500/20", border: "border-blue-400/40", text: "text-blue-200",
    },
    ios_no_pwa: {
      icon: <Bell className="w-4 h-4 text-blue-300" />,
      label: "Alertas disponíveis com o portal aberto",
      bg: "bg-blue-500/20", border: "border-blue-400/40", text: "text-blue-200",
    },
    not_configured: {
      icon: <BellOff className="w-4 h-4 text-yellow-300" />,
      label: "Alertas não configurados",
      bg: "bg-yellow-500/20", border: "border-yellow-400/40", text: "text-yellow-200",
    },
  };
  const c = configs[state];
  return (
    <div className={`flex items-center gap-2 ${c.bg} border ${c.border} rounded-full px-4 py-2`}>
      {c.icon}
      <span className={`${c.text} text-xs font-semibold`}>{c.label}</span>
    </div>
  );
}

// Sound + vibration for call alert
function playCallAlert() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    playTone(880, 0, 0.3);
    playTone(1100, 0.35, 0.3);
    playTone(880, 0.7, 0.3);
    playTone(1100, 1.05, 0.3);
  } catch {}
  if (navigator.vibrate) {
    navigator.vibrate([300, 200, 300, 200, 300, 200, 300]);
  }
}

export default function QueueMobile() {
  const [step, setStep] = useState<"select" | "confirm_notif" | "tracking">("select");
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(() => localStorage.getItem("queue_ticket_id"));
  const [notifState, setNotifState] = useState<NotifState>(getNotifState);
  const [showWarning, setShowWarning] = useState(false);
  const calledRef = useRef(false);

  const generateTicket = useGenerateTicket();
  const { data: myTicket } = useQueueTicketById(ticketId);
  const { data: allTickets } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" }, { publicMode: true });

  useEffect(() => {
    if (ticketId && myTicket) setStep("tracking");
  }, [ticketId, myTicket]);

  // Full-screen call alert
  useEffect(() => {
    if (myTicket?.status === "chamada" && !calledRef.current) {
      calledRef.current = true;
      playCallAlert();
      if (notifState === "active" && "Notification" in window) {
        new Notification("🏥 Sua vez chegou!", {
          body: `Senha ${myTicket.ticket_number} - Dirija-se ao ${myTicket.called_to || "balcão"}`,
          icon: "/placeholder.svg",
        });
      }
    }
    if (myTicket?.status !== "chamada") calledRef.current = false;
  }, [myTicket?.status, myTicket?.ticket_number, myTicket?.called_to, notifState]);

  const refreshNotifState = useCallback(() => setNotifState(getNotifState()), []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      setNotifState(getNotifState());
      return false;
    }
    const perm = await Notification.requestPermission();
    const granted = perm === "granted";
    setNotifState(granted ? "active" : perm === "denied" ? "denied" : "not_configured");
    return granted;
  }, []);

  // Step 1: user picks type → check notif state
  const handleSelectType = (type: string) => {
    if (notifState === "active") {
      doGenerate(type, true);
    } else {
      setPendingType(type);
      setStep("confirm_notif");
    }
  };

  // Step 2a: user activates notifications
  const handleActivateNow = async () => {
    const granted = await requestPermission();
    if (pendingType) doGenerate(pendingType, granted);
  };

  // Step 2b: user skips
  const handleSkipNotif = () => {
    setShowWarning(true);
  };

  const handleContinueWithoutNotif = () => {
    setShowWarning(false);
    if (pendingType) doGenerate(pendingType, false);
  };

  const doGenerate = async (type: string, notifEnabled: boolean) => {
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type,
        queue_name: "recepcao",
        source: "celular",
        notification_enabled: notifEnabled,
      });
      setTicketId(ticket.id);
      localStorage.setItem("queue_ticket_id", ticket.id);
      setPendingType(null);
      setStep("tracking");
    } catch {}
  };

  const queuePosition = allTickets && myTicket
    ? allTickets.findIndex((t) => t.id === myTicket.id) + 1
    : null;

  const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
    aguardando: { label: "Aguardando", color: "hsl(210,85%,45%)", emoji: "⏳" },
    chamada: { label: "Sua vez!", color: "#16a34a", emoji: "🔔" },
    em_atendimento: { label: "Em atendimento", color: "#0ea5e9", emoji: "👨‍⚕️" },
    concluida: { label: "Concluída", color: "#9ca3af", emoji: "✅" },
    ausente: { label: "Ausente", color: "#ef4444", emoji: "❌" },
  };

  // ========= FULL SCREEN GREEN ALERT =========
  if (step === "tracking" && myTicket?.status === "chamada") {
    return (
      <div className="min-h-screen bg-green-500 flex flex-col items-center justify-center p-6 animate-pulse">
        <div className="w-full max-w-sm text-center space-y-6">
          <BellRing className="w-20 h-20 text-white mx-auto animate-bounce" />
          <p className="text-white text-3xl font-black uppercase tracking-widest">SUA VEZ!</p>
          <p className="text-white/90 text-7xl font-black tracking-wider">{myTicket.ticket_number}</p>
          {myTicket.called_to && (
            <div className="bg-white/20 rounded-2xl p-4">
              <p className="text-white text-xl font-bold">Dirija-se ao {myTicket.called_to}</p>
            </div>
          )}
          <p className="text-white/60 text-sm">Apresente-se no local indicado</p>
        </div>
      </div>
    );
  }

  // ========= NOTIFICATION CONFIRMATION STEP =========
  if (step === "confirm_notif") {
    if (showWarning) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-3xl p-6 space-y-4">
              <AlertTriangle className="w-12 h-12 text-yellow-300 mx-auto" />
              <p className="text-white font-bold text-lg">Atenção</p>
              <p className="text-white/80 text-sm leading-relaxed">
                Você <strong>não receberá</strong> som nem vibração quando sua senha for chamada.
                Será necessário acompanhar manualmente pelo portal ou painel de chamadas.
              </p>
            </div>
            <button
              onClick={handleContinueWithoutNotif}
              disabled={generateTicket.isPending}
              className="w-full h-14 bg-white text-[hsl(210,85%,35%)] font-bold rounded-2xl text-lg disabled:opacity-50"
            >
              {generateTicket.isPending ? "Gerando..." : "Entendi, continuar"}
            </button>
            <button
              onClick={() => { setShowWarning(false); }}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Volume2 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Ative os alertas</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Receba aviso com <strong>som</strong>, <strong>vibração</strong> e <strong>tela de chamada</strong> quando sua senha for chamada.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <Volume2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">Som de alerta</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">Vibração do celular</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <Bell className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">Tela de chamada em destaque</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left">
              <p className="text-blue-700 text-xs leading-relaxed">
                💡 Com o portal aberto, som, vibração e tela de chamada funcionam normalmente.
              </p>
            </div>

            {isIOS() && !isStandalone() && (
              <details className="text-left">
                <summary className="text-amber-700 text-xs cursor-pointer font-medium">
                  Dica opcional: adicionar à Tela de Início
                </summary>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 space-y-1">
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Para uma experiência ainda melhor, adicione à Tela de Início:
                  </p>
                  <ol className="text-amber-700 text-xs space-y-1 ml-4 list-decimal">
                    <li>Toque em <strong>Compartilhar</strong> (↑)</li>
                    <li><strong>"Adicionar à Tela de Início"</strong></li>
                  </ol>
                </div>
              </details>
            )}
          </div>

          {notifState !== "foreground_only" && notifState !== "ios_no_pwa" ? (
            <button
              onClick={handleActivateNow}
              disabled={generateTicket.isPending}
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-colors disabled:opacity-50"
            >
              {generateTicket.isPending ? "Gerando..." : "Ativar alertas e continuar"}
            </button>
          ) : (
            <button
              onClick={() => { if (pendingType) doGenerate(pendingType, false); }}
              disabled={generateTicket.isPending}
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-colors disabled:opacity-50"
            >
              {generateTicket.isPending ? "Gerando..." : "Continuar com alertas na tela"}
            </button>
          )}
          <button
            onClick={handleSkipNotif}
            className="text-white/60 hover:text-white text-sm underline transition-colors"
          >
            Continuar sem alerta
          </button>
        </div>
      </div>
    );
  }

  // ========= TRACKING STEP =========
  if (step === "tracking" && myTicket) {
    const st = statusLabels[myTicket.status] || statusLabels.aguardando;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5 text-center">
          {/* Notif badge top */}
          <div className="flex justify-center">
            <button onClick={async () => {
              if (notifState !== "active") {
                await requestPermission();
              }
              refreshNotifState();
            }}>
              <NotifBadge state={notifState} />
            </button>
          </div>

          <h1 className="text-xl font-bold text-white">Fila Virtual</h1>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4">
            <p className="text-5xl">{st.emoji}</p>
            <p className="text-sm text-gray-500 uppercase tracking-wider">{st.label}</p>
            <p className="text-5xl font-black tracking-wider" style={{ color: st.color }}>{myTicket.ticket_number}</p>

            {myTicket.status === "aguardando" && queuePosition && (
              <div className="flex items-center justify-center gap-6 text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{queuePosition}º na fila</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">~{queuePosition * 5} min</span>
                </div>
              </div>
            )}
            {myTicket.status === "aguardando" && (
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 mt-2">
                <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <p className="text-blue-700 text-xs">Mantenha esta tela aberta para receber seus alertas da chamada.</p>
              </div>
            )}
          </div>

          {/* Second chance CTA if notifications not active */}
          {notifState !== "active" && myTicket.status === "aguardando" && (
            <button
              onClick={async () => {
                await requestPermission();
                refreshNotifState();
              }}
              className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg transition-colors"
            >
              <BellRing className="w-6 h-6" />
              <span>Ative os alertas da sua senha</span>
            </button>
          )}

          {(myTicket.status === "concluida" || myTicket.status === "ausente") && (
            <button
              onClick={() => {
                localStorage.removeItem("queue_ticket_id");
                setTicketId(null);
                calledRef.current = false;
                setStep("select");
              }}
              className="w-full h-12 bg-white text-[hsl(210,85%,35%)] font-bold rounded-xl"
            >
              Nova senha
            </button>
          )}

          <p className="text-white/40 text-xs">Zurich Health System</p>
        </div>
      </div>
    );
  }

  // ========= SELECT TYPE STEP =========
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Ticket className="w-12 h-12 text-white mx-auto" />
          <h1 className="text-2xl font-bold text-white">Fila Virtual</h1>
          <p className="text-white/70">Escolha o tipo de atendimento</p>
        </div>

        {/* Notif status top */}
        <div className="flex justify-center">
          <button onClick={async () => {
            if (notifState !== "active") await requestPermission();
            refreshNotifState();
          }}>
            <NotifBadge state={notifState} />
          </button>
        </div>

        <div className="space-y-3">
          {ticketTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectType(t.id)}
              disabled={generateTicket.isPending}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <h3 className="font-bold text-gray-800">{t.label}</h3>
              <p className="text-sm text-gray-500">{t.description}</p>
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center">Zurich Health System</p>
      </div>
    </div>
  );
}
