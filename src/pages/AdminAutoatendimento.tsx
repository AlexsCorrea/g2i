import React, { useState, useRef, useEffect, useMemo } from "react";
import { useUpdateUnitConfig, useUnitAds, useManageAds, type UnitConfig,
  ticketToSpeech, priorityToSpeech,
} from "@/hooks/useUnitConfig";
import { useTotemUnits, useTotemUnit, useDeleteTotemUnit, useInstitutionSettings } from "@/hooks/useTotem";
import { TicketTypesTab } from "@/components/autoatendimento/TicketTypesTab";
import { DevicesTab } from "@/components/autoatendimento/DevicesTab";
import { UnitsManagerDrawer } from "@/components/autoatendimento/UnitsManagerDrawer";

import { TvPanelsCard } from "@/components/autoatendimento/TvPanelsCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Palette, Image, Tv, Monitor, Settings2, Upload, Trash2, GripVertical, Plus, Tag,
  ArrowLeft, Eye, Volume2, Clock, ShieldCheck, Megaphone, Play, Mic, Printer, Building2, MapPin, Info,
} from "lucide-react";
import { InstitutionHeaderCompact } from "@/components/autoatendimento/InstitutionHeaderCompact";
import { useNavigate } from "react-router-dom";

export default function AdminAutoatendimento() {
  const navigate = useNavigate();
  const { data: units } = useTotemUnits();
  const { data: institution } = useInstitutionSettings();
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const deleteUnit = useDeleteTotemUnit();

  // Auto-select first unit
  useEffect(() => {
    if (!selectedUnitId && units && units.length > 0) {
      setSelectedUnitId(units[0].id);
    }
  }, [units, selectedUnitId]);

  const { data: rawUnit, isLoading } = useTotemUnit(selectedUnitId);
  const config = useMemo<UnitConfig | null>(() => rawUnit ? ({ ...rawUnit, unit_name: (rawUnit as any).name } as any) : null, [rawUnit]);
  const updateConfig = useUpdateUnitConfig();
  const { data: ads } = useUnitAds();
  const { add: addAd, remove: removeAd } = useManageAds();


  const [unitName, setUnitName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e5a8a");
  const [secondaryColor, setSecondaryColor] = useState("#0f3460");
  const [privacyMode, setPrivacyMode] = useState("senha_iniciais");
  const [socialNamePolicy, setSocialNamePolicy] = useState("iniciais_social");
  const [callDisplaySeconds, setCallDisplaySeconds] = useState(15);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsInterval, setAdsInterval] = useState(10);
  const [locutionEnabled, setLocutionEnabled] = useState(true);
  const [locutionSpeakPriority, setLocutionSpeakPriority] = useState(true);
  const [locutionSpeakLocation, setLocutionSpeakLocation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [adsIdleSeconds, setAdsIdleSeconds] = useState(20);
  const [totemRetirarSenha, setTotemRetirarSenha] = useState(true);
  const [totemCheckin, setTotemCheckin] = useState(true);
  const [totemTimeout, setTotemTimeout] = useState(60);
  const [voiceRate, setVoiceRate] = useState(0.85);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [preCallSound, setPreCallSound] = useState("triple_tone");
  const [printEnabled, setPrintEnabled] = useState(false);
  const [printAuto, setPrintAuto] = useState(false);
  const [printCopies, setPrintCopies] = useState(1);
  const [printPaperWidth, setPrintPaperWidth] = useState("80mm");
  const [printShowLogo, setPrintShowLogo] = useState(true);
  const [printShowQr, setPrintShowQr] = useState(true);
  const [printHeaderText, setPrintHeaderText] = useState("Aguarde sua chamada no painel");
  const [printFooterText, setPrintFooterText] = useState("Apresente esta senha quando solicitado");
  const [printTemplate, setPrintTemplate] = useState("standard");
  const [printFontSize, setPrintFontSize] = useState("large");
  const [printMarginTop, setPrintMarginTop] = useState(2);
  const [printMarginBottom, setPrintMarginBottom] = useState(2);
  const [printMarginLeft, setPrintMarginLeft] = useState(2);
  const [printMarginRight, setPrintMarginRight] = useState(2);
  const [printBlockSpacing, setPrintBlockSpacing] = useState(6);
  const [printCutExtraHeight, setPrintCutExtraHeight] = useState(10);
  const [printAutoCut, setPrintAutoCut] = useState(true);
  const [resultCountdown, setResultCountdown] = useState(30);
  const [initialized, setInitialized] = useState(false);

  const [adTitle, setAdTitle] = useState("");
  const [adDuration, setAdDuration] = useState(10);
  const adFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Available voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState("__default__");

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
      setAvailableVoices(ptVoices.length > 0 ? ptVoices : voices.slice(0, 10));
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (config && !initialized) {
      setUnitName(config.unit_name || "");
      setPrimaryColor(config.primary_color || "#1e5a8a");
      setSecondaryColor(config.secondary_color || "#0f3460");
      setPrivacyMode(config.privacy_mode || "senha_iniciais");
      setSocialNamePolicy(config.social_name_policy || "iniciais_social");
      setCallDisplaySeconds(config.call_display_seconds || 15);
      setAdsEnabled(config.ads_enabled || false);
      setAdsInterval(config.ads_interval_seconds || 10);
      setLocutionEnabled(config.locution_enabled !== false);
      setLocutionSpeakPriority(config.locution_speak_priority !== false);
      setLocutionSpeakLocation(config.locution_speak_location === true);
      setSoundEnabled(config.sound_enabled !== false);
      setShowClock(config.show_clock !== false);
      setShowHistory(config.show_history !== false);
      setAdsIdleSeconds(config.ads_idle_seconds || 20);
      setTotemRetirarSenha(config.totem_retirar_senha !== false);
      setTotemCheckin(config.totem_checkin !== false);
      setTotemTimeout(config.totem_timeout_seconds || 60);
      setVoiceRate(config.voice_rate || 0.85);
      setVoicePitch(config.voice_pitch || 1.0);
      setVoiceVolume(config.voice_volume || 1.0);
      setPreCallSound(config.pre_call_sound || "triple_tone");
      setPrintEnabled(config.print_enabled || false);
      setPrintAuto(config.print_auto || false);
      setPrintCopies(config.print_copies || 1);
      setPrintPaperWidth(config.print_paper_width || "80mm");
      setPrintShowLogo(config.print_show_logo !== false);
      setPrintShowQr(config.print_show_qr !== false);
      setPrintHeaderText(config.print_header_text || "Aguarde sua chamada no painel");
      setPrintFooterText(config.print_footer_text || "Apresente esta senha quando solicitado");
      setPrintTemplate(config.print_template || "standard");
      setPrintFontSize(config.print_font_size || "large");
      setPrintMarginTop((config as any).print_margin_top ?? 2);
      setPrintMarginBottom((config as any).print_margin_bottom ?? 2);
      setPrintMarginLeft((config as any).print_margin_left ?? 2);
      setPrintMarginRight((config as any).print_margin_right ?? 2);
      setPrintBlockSpacing((config as any).print_block_spacing ?? 6);
      setPrintCutExtraHeight((config as any).print_cut_extra_height ?? 10);
      setPrintAutoCut((config as any).print_auto_cut !== false);
      setResultCountdown((config as any).result_countdown_seconds ?? 30);
      setInitialized(true);
    }
  }, [config, initialized]);

  // Reset form when switching units
  useEffect(() => { setInitialized(false); }, [selectedUnitId]);

  const handleSave = () => {
    if (!config?.id) return;
    updateConfig.mutate({
      id: config.id,
      unit_name: unitName,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      privacy_mode: privacyMode,
      social_name_policy: socialNamePolicy,
      call_display_seconds: callDisplaySeconds,
      ads_enabled: adsEnabled,
      ads_interval_seconds: adsInterval,
      locution_enabled: locutionEnabled,
      locution_speak_priority: locutionSpeakPriority,
      locution_speak_location: locutionSpeakLocation,
      sound_enabled: soundEnabled,
      show_clock: showClock,
      show_history: showHistory,
      ads_idle_seconds: adsIdleSeconds,
      totem_retirar_senha: totemRetirarSenha,
      totem_checkin: totemCheckin,
      totem_timeout_seconds: totemTimeout,
      voice_rate: voiceRate,
      voice_pitch: voicePitch,
      voice_volume: voiceVolume,
      pre_call_sound: preCallSound,
      print_enabled: printEnabled,
      print_auto: printAuto,
      print_copies: printCopies,
      print_paper_width: printPaperWidth,
      print_show_logo: printShowLogo,
      print_show_qr: printShowQr,
      print_header_text: printHeaderText,
      print_footer_text: printFooterText,
      print_template: printTemplate,
      print_font_size: printFontSize,
      print_margin_top: printMarginTop,
      print_margin_bottom: printMarginBottom,
      print_margin_left: printMarginLeft,
      print_margin_right: printMarginRight,
      print_block_spacing: printBlockSpacing,
      print_cut_extra_height: printCutExtraHeight,
      print_auto_cut: printAutoCut,
      result_countdown_seconds: resultCountdown,
    });
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config?.id) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "exam-gallery", `unit-branding/logo-${Date.now()}.${file.name.split(".").pop()}`);
      updateConfig.mutate({ id: config.id, logo_url: url } as any);
      toast.success("Logo atualizada!");
    } catch (err: any) { toast.error("Erro ao enviar logo: " + err.message); }
    setUploading(false);
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config?.id) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "exam-gallery", `unit-branding/bg-${Date.now()}.${file.name.split(".").pop()}`);
      updateConfig.mutate({ id: config.id, background_image_url: url } as any);
      toast.success("Imagem de fundo atualizada!");
    } catch (err: any) { toast.error("Erro ao enviar imagem: " + err.message); }
    setUploading(false);
  };

  const handleAdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!adTitle.trim()) { toast.error("Informe o título do anúncio"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const mediaType = ["mp4", "webm", "mov"].includes(ext) ? "video" : "image";
      const url = await uploadFile(file, "exam-gallery", `unit-ads/ad-${Date.now()}.${ext}`);
      addAd.mutate({
        title: adTitle, media_type: mediaType, media_url: url,
        display_order: (ads?.length || 0) + 1, duration_seconds: adDuration,
        active: true, unit_config_id: config?.id || null,
      });
      setAdTitle("");
      toast.success("Anúncio adicionado!");
    } catch (err: any) { toast.error("Erro ao enviar mídia: " + err.message); }
    setUploading(false);
  };

  const speakTest = (text: string) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = voiceRate;
    utter.pitch = voicePitch;
    utter.volume = voiceVolume;
    if (selectedVoiceName && selectedVoiceName !== "__default__") {
      const voice = availableVoices.find(v => v.name === selectedVoiceName);
      if (voice) utter.voice = voice;
    } else {
      const ptVoice = availableVoices.find(v => v.lang.startsWith("pt"));
      if (ptVoice) utter.voice = ptVoice;
    }
    synth.speak(utter);
  };

  const testLocution = () => {
    const text = `Senha ${ticketToSpeech("P8004")}, prioridade ${priorityToSpeech("preferencial_80")}.`;
    speakTest(text);
    toast.info("Testando locução...");
  };

  const testLocutionFull = () => {
    let text = `Senha ${ticketToSpeech("P8004")}`;
    text += `, Ana Clara`;
    text += `, prioridade ${priorityToSpeech("preferencial_80")}`;
    if (locutionSpeakLocation) text += `, Guichê um`;
    text += ".";
    speakTest(text);
    toast.info("Testando locução completa...");
  };

  const testSound = () => {
    try {
      const ctx = new AudioContext();
      const playTone = (freq: number, delay: number, dur = 0.25) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.5, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.05);
      };
      if (preCallSound === "double_tone") {
        playTone(880, 0, 0.2); playTone(1100, 0.3, 0.2);
      } else if (preCallSound === "triple_tone") {
        playTone(880, 0, 0.25); playTone(1100, 0.35, 0.25); playTone(880, 0.7, 0.35);
      }
      toast.info("Testando som...");
    } catch {}
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;

  const privacyOptions = [
    { value: "somente_senha", label: "Somente Senha", desc: "Exibe apenas o número da senha" },
    { value: "senha_iniciais", label: "Senha + Iniciais", desc: "Ex: P8004 — A.C.S." },
    { value: "senha_nome_social", label: "Senha + Nome Social Abreviado", desc: "Ex: P8004 — Ana C." },
    { value: "nome_completo", label: "Nome Completo", desc: "Exibe nome completo (menos privado)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-6 h-6" />
                Configurações do Autoatendimento
              </h1>
              <p className="text-sm text-muted-foreground">Totem, Painel de Chamadas e Painel TV</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/painel-tv")}>
              <Eye className="w-4 h-4 mr-2" /> Visualizar TV
            </Button>
            <Button onClick={handleSave} disabled={updateConfig.isPending}>
              Salvar Configurações
            </Button>
          </div>
        </div>

        {/* Identidade institucional compacta */}
        <InstitutionHeaderCompact />

        {/* Contexto de unidade em edição */}
        <Card className="border-primary/30 bg-primary/[0.02]">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-[220px]">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Você está configurando</p>
                <p className="text-lg font-bold leading-tight">
                  {config?.unit_name || (units?.find(u => u.id === selectedUnitId)?.name) || "Selecione uma unidade"}
                </p>
                <p className="text-xs text-muted-foreground">
                  As configurações abaixo se aplicam apenas a esta unidade/setor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
                  <SelectContent>
                    {(units ?? []).map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} {!u.active && "(inativa)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <UnitsManagerDrawer
                  onUnitChanged={(id) => setSelectedUnitId(id)}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Settings2 className="w-4 h-4 mr-1" /> Gerenciar
                    </Button>
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {!selectedUnitId ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Selecione ou cadastre uma unidade para configurar.</CardContent></Card>
        ) : (
        <Tabs defaultValue="branding" className="space-y-6">
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <TabsList className="inline-flex w-max gap-1 h-auto p-1 flex-wrap">
              <TabsTrigger value="branding" className="gap-1.5 whitespace-nowrap px-3"><Palette className="w-4 h-4" /> Aparência</TabsTrigger>
              <TabsTrigger value="ticket_types" className="gap-1.5 whitespace-nowrap px-3"><Tag className="w-4 h-4" /> Senhas</TabsTrigger>
              <TabsTrigger value="totem" className="gap-1.5 whitespace-nowrap px-3"><Monitor className="w-4 h-4" /> Totem</TabsTrigger>
              <TabsTrigger value="print" className="gap-1.5 whitespace-nowrap px-3"><Printer className="w-4 h-4" /> Impressão</TabsTrigger>
              <TabsTrigger value="tv" className="gap-1.5 whitespace-nowrap px-3"><Tv className="w-4 h-4" /> Exibição TV</TabsTrigger>
              <TabsTrigger value="tv_panels" className="gap-1.5 whitespace-nowrap px-3"><Tv className="w-4 h-4" /> Painéis TV</TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5 whitespace-nowrap px-3"><Mic className="w-4 h-4" /> Voz</TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 whitespace-nowrap px-3"><ShieldCheck className="w-4 h-4" /> Privacidade</TabsTrigger>
              <TabsTrigger value="ads" className="gap-1.5 whitespace-nowrap px-3"><Megaphone className="w-4 h-4" /> Anúncios</TabsTrigger>
              <TabsTrigger value="devices" className="gap-1.5 whitespace-nowrap px-3"><Monitor className="w-4 h-4" /> Totens</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ticket_types" className="space-y-6">
            <TicketTypesTab unitId={selectedUnitId} />
          </TabsContent>
          <TabsContent value="devices" className="space-y-6">
            <DevicesTab unitId={selectedUnitId} />
          </TabsContent>
          <TabsContent value="tv_panels" className="space-y-6">
            <TvPanelsCard />
          </TabsContent>


          {/* BRANDING TAB */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aparência da Unidade</CardTitle>
                <CardDescription>Visual aplicado ao totem, portal mobile e painel TV desta unidade. A marca global da instituição fica no cabeçalho acima.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Nome exibido no totem (setor)</Label>
                      <Input value={unitName} onChange={e => setUnitName(e.target.value)} placeholder="Ex.: Centro Cirúrgico, Pronto-Socorro…" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Aparece como contexto operacional no totem, portal e painel.
                        A marca da instituição vem do card "Identidade da Instituição" (acima).
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Cor Principal</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                          <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Cor Secundária</Label>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                          <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Logo desta unidade (opcional)</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Se não enviar, o totem usa a logo institucional global.
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        {config?.logo_url ? (
                          <img src={config.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border" />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <Button variant="outline" onClick={() => logoFileRef.current?.click()} disabled={uploading}>
                          <Upload className="w-4 h-4 mr-2" /> {config?.logo_url ? "Trocar logo da unidade" : "Enviar logo da unidade"}
                        </Button>
                        {config?.logo_url && config?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateConfig.mutate({ id: config.id, logo_url: null } as any)}
                            disabled={uploading}
                            title="Voltar a usar a logo institucional"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Usar institucional
                          </Button>
                        )}
                        <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </div>
                    </div>
                    <div>
                      <Label>Imagem de Fundo (opcional)</Label>
                      <div className="flex items-center gap-4 mt-1">
                        {config?.background_image_url ? (
                          <img src={config.background_image_url} alt="BG" className="w-24 h-16 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-24 h-16 rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-muted/40 to-muted/10 flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <Button variant="outline" onClick={() => bgFileRef.current?.click()} disabled={uploading}>
                          <Image className="w-4 h-4 mr-2" /> {config?.background_image_url ? "Trocar" : "Enviar Imagem"}
                        </Button>
                        {config?.background_image_url && config?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateConfig.mutate({ id: config.id, background_image_url: null } as any)}
                            disabled={uploading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Remover
                          </Button>
                        )}
                        <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Pré-visualização do totem</Label>
                  <div className="rounded-xl overflow-hidden border" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                    <div className="h-16 flex items-center px-6 gap-3 bg-black/20">
                      {(config?.logo_url || institution?.logo_url) && (
                        <img src={config?.logo_url || institution?.logo_url || ""} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <div className="leading-tight">
                        <div className="text-white font-bold text-base">{institution?.name || "Instituição"}</div>
                        <div className="text-white/80 text-xs">Autoatendimento — {unitName || "Setor"}</div>
                      </div>
                    </div>
                    <div className="p-8 text-center">
                      <p className="text-white/60 text-sm">SENHA CHAMADA</p>
                      <p className="text-white text-5xl font-black tracking-widest my-2">P8004</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRIVACY TAB */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Política de Privacidade do Paciente</CardTitle>
                <CardDescription>Define como o paciente é identificado no painel público da TV e nas chamadas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Modo de Exibição no Painel TV</Label>
                  <div className="grid gap-3">
                    {privacyOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          privacyMode === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                        onClick={() => setPrivacyMode(opt.value)}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          privacyMode === opt.value ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {privacyMode === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        </div>
                        {opt.value === "senha_iniciais" && <Badge>Recomendado para saúde</Badge>}
                        {opt.value === "nome_completo" && (
                          <Badge variant="outline" className="text-amber-700 border-amber-400">
                            Menos recomendado para ambiente público
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Política de Nome Social</Label>
                  <Select value={socialNamePolicy} onValueChange={setSocialNamePolicy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciais_social">Usar iniciais do nome social</SelectItem>
                      <SelectItem value="nome_social_abreviado">Nome social abreviado</SelectItem>
                      <SelectItem value="somente_senha">Ignorar nome social (somente senha)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Quando o paciente possui nome social cadastrado, esta regra define como ele é exibido</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TV PANEL TAB */}
          <TabsContent value="tv" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exibição do Painel TV</CardTitle>
                <CardDescription>
                  Comportamento visual e sonoro do painel de chamadas desta unidade. O cadastro dos
                  dispositivos físicos fica na aba <strong>Painéis TV</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Tempo de exibição da chamada (segundos)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider value={[callDisplaySeconds]} onValueChange={v => setCallDisplaySeconds(v[0])} min={5} max={60} step={5} className="flex-1" />
                        <span className="text-sm font-mono w-12 text-right">{callDisplaySeconds}s</span>
                      </div>
                    </div>
                    <div>
                      <Label>Tempo de inatividade para anúncios (segundos)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider value={[adsIdleSeconds]} onValueChange={v => setAdsIdleSeconds(v[0])} min={5} max={120} step={5} className="flex-1" />
                        <span className="text-sm font-mono w-12 text-right">{adsIdleSeconds}s</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Após esse período sem chamadas, inicia os anúncios</p>
                    </div>
                    <ToggleRow label="Relógio" desc="Exibe relógio no canto superior" icon={<Clock className="w-4 h-4" />} checked={showClock} onChange={setShowClock} />
                    <ToggleRow label="Últimas chamadas" desc="Exibe histórico lateral" checked={showHistory} onChange={setShowHistory} />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <p className="font-medium mb-2">Exemplo de chamada</p>
                      <div className="rounded-lg p-4 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
                        <p className="text-white/60 text-xs">SENHA CHAMADA</p>
                        <p className="text-white text-3xl font-black my-1">P8004</p>
                        <p className="text-white/80 text-sm">
                          {privacyMode === "somente_senha" && ""}
                          {privacyMode === "senha_iniciais" && "A.C.S."}
                          {privacyMode === "senha_nome_social" && "Ana C."}
                          {privacyMode === "nome_completo" && "Ana Clara Silva"}
                        </p>
                        <p className="text-white/60 text-xs mt-1">Preferencial 80+</p>
                        <p className="text-white text-sm mt-1">📍 Guichê 1</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Testar</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={testSound}>
                          <Play className="w-4 h-4 mr-1" /> Testar Som
                        </Button>
                        <Button variant="outline" size="sm" onClick={testLocution}>
                          <Mic className="w-4 h-4 mr-1" /> Locução Simples
                        </Button>
                        <Button variant="outline" size="sm" onClick={testLocutionFull}>
                          <Mic className="w-4 h-4 mr-1" /> Locução Completa
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate("/painel-tv")}>
                          <Tv className="w-4 h-4 mr-1" /> Abrir Painel TV
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOICE TAB */}
          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Voz e Locução</CardTitle>
                <CardDescription>Personalize a voz, velocidade e comportamento da locução automática</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <ToggleRow label="Locução automática" desc="Fala a senha e prioridade ao chamar" icon={<Mic className="w-4 h-4" />} checked={locutionEnabled} onChange={setLocutionEnabled} />
                    {locutionEnabled && (
                      <div className="ml-4 space-y-3 border-l-2 border-primary/20 pl-4">
                        <ToggleRow label="Falar prioridade" desc="Inclui prioridade na locução" checked={locutionSpeakPriority} onChange={setLocutionSpeakPriority} />
                        <ToggleRow label="Falar local" desc="Inclui guichê/sala na locução" checked={locutionSpeakLocation} onChange={setLocutionSpeakLocation} />
                      </div>
                    )}
                    <ToggleRow label="Som de chamada" desc="Toca bipes antes da locução" icon={<Volume2 className="w-4 h-4" />} checked={soundEnabled} onChange={setSoundEnabled} />
                    {soundEnabled && (
                      <div className="ml-4 border-l-2 border-primary/20 pl-4">
                        <Label>Tipo de som</Label>
                        <Select value={preCallSound} onValueChange={setPreCallSound}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="triple_tone">3 toques (padrão)</SelectItem>
                            <SelectItem value="double_tone">2 toques</SelectItem>
                            <SelectItem value="none">Sem som</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-5">
                    {availableVoices.length > 0 && (
                      <div>
                        <Label>Voz / Locutor</Label>
                        <Select value={selectedVoiceName} onValueChange={setSelectedVoiceName}>
                          <SelectTrigger className="mt-1"><SelectValue placeholder="Voz padrão do sistema" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__default__">Padrão do sistema</SelectItem>
                            {availableVoices.map(v => (
                              <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label>Velocidade da fala: {voiceRate.toFixed(2)}</Label>
                      <Slider value={[voiceRate]} onValueChange={v => setVoiceRate(v[0])} min={0.5} max={1.5} step={0.05} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">0.5 = lento, 1.0 = normal, 1.5 = rápido</p>
                    </div>
                    <div>
                      <Label>Tom: {voicePitch.toFixed(2)}</Label>
                      <Slider value={[voicePitch]} onValueChange={v => setVoicePitch(v[0])} min={0.5} max={2.0} step={0.1} className="mt-2" />
                    </div>
                    <div>
                      <Label>Volume: {Math.round(voiceVolume * 100)}%</Label>
                      <Slider value={[voiceVolume]} onValueChange={v => setVoiceVolume(v[0])} min={0.1} max={1.0} step={0.1} className="mt-2" />
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button variant="outline" size="sm" onClick={testLocution}>
                        <Play className="w-4 h-4 mr-1" /> Testar simples
                      </Button>
                      <Button variant="outline" size="sm" onClick={testLocutionFull}>
                        <Play className="w-4 h-4 mr-1" /> Testar completa
                      </Button>
                      <Button variant="outline" size="sm" onClick={testSound}>
                        <Volume2 className="w-4 h-4 mr-1" /> Testar som
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADS TAB */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anúncios do Painel TV</CardTitle>
                <CardDescription>Mídia exibida quando o painel está ocioso (sem chamadas ativas)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToggleRow label="Ativar anúncios" desc="Quando ativado, exibe mídia entre as chamadas" checked={adsEnabled} onChange={setAdsEnabled} />
                {adsEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Título do anúncio</Label>
                        <Input value={adTitle} onChange={e => setAdTitle(e.target.value)} placeholder="Ex: Campanha de Vacinação" />
                      </div>
                      <div>
                        <Label>Duração (segundos)</Label>
                        <Input type="number" value={adDuration} onChange={e => setAdDuration(Number(e.target.value))} min={3} max={120} />
                        <p className="text-xs text-muted-foreground mt-1">Para vídeos, pode usar a duração real do vídeo</p>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={() => adFileRef.current?.click()} disabled={uploading} className="w-full">
                          <Upload className="w-4 h-4 mr-2" /> Enviar Mídia
                        </Button>
                        <input ref={adFileRef} type="file" accept="image/*,video/mp4,video/webm,image/gif" className="hidden" onChange={handleAdUpload} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Anúncios cadastrados</Label>
                      {(!ads || ads.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-6 border rounded-xl border-dashed">
                          Nenhum anúncio cadastrado
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {ads.map((ad, idx) => (
                            <div key={ad.id} className="flex items-center gap-4 p-3 rounded-xl border bg-card">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {ad.media_type === "video" ? (
                                  <video src={ad.media_url} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{ad.title}</p>
                                <p className="text-xs text-muted-foreground">{ad.media_type} • {ad.duration_seconds}s</p>
                              </div>
                              <Badge variant="outline">#{idx + 1}</Badge>
                              <Button size="icon" variant="ghost" onClick={() => removeAd.mutate(ad.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TOTEM TAB */}
          <TabsContent value="totem" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Totem</CardTitle>
                <CardDescription>Comportamento do autoatendimento desta unidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tela inicial</h3>
                    <ToggleRow label="Mostrar botão Retirar Senha" desc="Permite emissão de nova senha no totem" checked={totemRetirarSenha} onChange={setTotemRetirarSenha} />
                    <ToggleRow label="Mostrar botão Fazer Check-in" desc="Permite check-in de consulta agendada (CPF + Data de Nascimento)" checked={totemCheckin} onChange={setTotemCheckin} />
                    <div>
                      <Label>Timeout da tela inicial (segundos)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider value={[totemTimeout]} onValueChange={v => setTotemTimeout(v[0])} min={5} max={180} step={5} className="flex-1" />
                        <span className="text-sm font-mono w-12 text-right">{totemTimeout}s</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Retorna à tela inicial após esse tempo de inatividade.</p>
                    </div>
                    <div>
                      <Label>Timeout da tela de resultado (segundos)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider value={[resultCountdown]} onValueChange={v => setResultCountdown(v[0])} min={10} max={120} step={5} className="flex-1" />
                        <span className="text-sm font-mono w-12 text-right">{resultCountdown}s</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Após emitir a senha ou concluir o check-in, a tela retorna ao início.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Sobre o totem</h3>
                    <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-muted-foreground" /> Tipos de senha</p>
                      <p className="text-xs text-muted-foreground">
                        Os tipos de senha exibidos no totem são definidos na aba <strong>Senhas</strong> (tipos habilitados nesta unidade).
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-muted-foreground" /> Check-in</p>
                      <p className="text-xs text-muted-foreground">
                        Identificação por CPF + Data de Nascimento. Busca agendamentos do dia, confirma presença e gera senha vinculada.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                      <p className="text-sm font-medium flex items-center gap-2"><Info className="w-4 h-4 text-muted-foreground" /> QR Code / portal mobile</p>
                      <p className="text-xs text-muted-foreground">
                        Na tela de resultado, um QR Code direciona o paciente ao portal mobile para acompanhar a fila.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border border-dashed bg-muted/10 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Em breve</p>
                      <p className="text-xs text-muted-foreground">
                        Mensagens personalizadas da tela inicial e tela de sucesso, alternar QR Code de senha virtual e textos do totem por unidade.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRINT TAB */}
          <TabsContent value="print" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Impressão da Senha</CardTitle>
                <CardDescription>Configure a emissão de senhas em impressora térmica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: General */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Geral</h3>
                    <ToggleRow label="Ativar impressão" desc="Habilita emissão de senha na impressora" icon={<Printer className="w-4 h-4" />} checked={printEnabled} onChange={setPrintEnabled} />
                    {printEnabled && (
                      <>
                        <ToggleRow label="Impressão automática" desc="Imprime automaticamente ao gerar a senha" checked={printAuto} onChange={setPrintAuto} />
                        <div>
                          <Label>Quantidade de vias</Label>
                          <Select value={String(printCopies)} onValueChange={v => setPrintCopies(Number(v))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 via</SelectItem>
                              <SelectItem value="2">2 vias</SelectItem>
                              <SelectItem value="3">3 vias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Formato do papel</Label>
                          <Select value={printPaperWidth} onValueChange={setPrintPaperWidth}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="58mm">58 mm — cupom compacto</SelectItem>
                              <SelectItem value="80mm">80 mm — padrão de recepção</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Modelo de impressão</Label>
                          <Select value={printTemplate} onValueChange={setPrintTemplate}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Padrão (com QR Code e detalhes)</SelectItem>
                              <SelectItem value="compact">Compacto (só senha e tipo)</SelectItem>
                              <SelectItem value="clinic">Clínica (com logo e mensagem)</SelectItem>
                              <SelectItem value="hospital">Hospital (completo)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tamanho do número da senha</Label>
                          <Select value={printFontSize} onValueChange={setPrintFontSize}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medium">Médio (32px)</SelectItem>
                              <SelectItem value="large">Grande (40px)</SelectItem>
                              <SelectItem value="extra_large">Extra grande (48px)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider pt-2">Conteúdo</h3>
                        <ToggleRow label="Exibir logo" desc="Inclui a logo da unidade no ticket" checked={printShowLogo} onChange={setPrintShowLogo} />
                        <ToggleRow label="Exibir QR Code" desc="QR Code para acompanhamento no celular" checked={printShowQr} onChange={setPrintShowQr} />
                        <div>
                          <Label>Mensagem principal</Label>
                          <Input value={printHeaderText} onChange={e => setPrintHeaderText(e.target.value)} placeholder="Aguarde sua chamada no painel" className="mt-1" />
                        </div>
                        <div>
                          <Label>Rodapé</Label>
                          <Input value={printFooterText} onChange={e => setPrintFooterText(e.target.value)} placeholder="Apresente esta senha quando solicitado" className="mt-1" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Column 2: Margins & Cut */}
                  {printEnabled && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Margens e Corte (mm)</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Margem superior</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider value={[printMarginTop]} onValueChange={v => setPrintMarginTop(v[0])} min={0} max={15} step={1} className="flex-1" />
                            <span className="text-xs font-mono w-8 text-right">{printMarginTop}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Margem inferior</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider value={[printMarginBottom]} onValueChange={v => setPrintMarginBottom(v[0])} min={0} max={15} step={1} className="flex-1" />
                            <span className="text-xs font-mono w-8 text-right">{printMarginBottom}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Margem esquerda</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider value={[printMarginLeft]} onValueChange={v => setPrintMarginLeft(v[0])} min={0} max={10} step={1} className="flex-1" />
                            <span className="text-xs font-mono w-8 text-right">{printMarginLeft}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Margem direita</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider value={[printMarginRight]} onValueChange={v => setPrintMarginRight(v[0])} min={0} max={10} step={1} className="flex-1" />
                            <span className="text-xs font-mono w-8 text-right">{printMarginRight}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Espaçamento entre blocos</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Slider value={[printBlockSpacing]} onValueChange={v => setPrintBlockSpacing(v[0])} min={2} max={15} step={1} className="flex-1" />
                          <span className="text-xs font-mono w-8 text-right">{printBlockSpacing}</span>
                        </div>
                      </div>
                      <div className="border-t pt-3 space-y-3">
                        <ToggleRow label="Corte automático" desc="Enviar comando de corte à impressora" checked={printAutoCut} onChange={setPrintAutoCut} />
                        <div>
                          <Label className="text-xs">Altura extra antes do corte (mm)</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Slider value={[printCutExtraHeight]} onValueChange={v => setPrintCutExtraHeight(v[0])} min={0} max={30} step={2} className="flex-1" />
                            <span className="text-xs font-mono w-8 text-right">{printCutExtraHeight}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Espaço em branco antes do ponto de corte</p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Tela de Resultado</h3>
                        <div>
                          <Label>Tempo de retorno automático (segundos)</Label>
                          <div className="flex items-center gap-4 mt-2">
                            <Slider value={[resultCountdown]} onValueChange={v => setResultCountdown(v[0])} min={10} max={120} step={5} className="flex-1" />
                            <span className="text-sm font-mono w-12 text-right">{resultCountdown}s</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Após emitir a senha, a tela retorna automaticamente após esse tempo</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Column 3: Preview */}
                  {printEnabled && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Pré-visualização</h3>
                      <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-3 bg-muted/30">
                        <div
                          className="bg-white mx-auto overflow-hidden"
                          style={{
                            width: printPaperWidth === "58mm" ? "200px" : "280px",
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          <div
                            className="text-center"
                            style={{
                              paddingTop: `${printMarginTop * 1.5}px`,
                              paddingBottom: `${printMarginBottom * 1.5}px`,
                              paddingLeft: `${printMarginLeft * 1.5}px`,
                              paddingRight: `${printMarginRight * 1.5}px`,
                            }}
                          >
                            {printShowLogo && config?.logo_url && (
                              <img src={config.logo_url} alt="Logo" className="w-12 h-10 object-contain mx-auto" />
                            )}
                            <p className="text-xs font-bold">{unitName || "Hospital"}</p>
                            <div className="border-t border-dashed border-gray-400" style={{ margin: `${printBlockSpacing * 0.8}px 0` }} />
                            <p className="font-black tracking-widest" style={{
                              fontSize: printFontSize === "extra_large" ? "36px" : printFontSize === "large" ? "30px" : "24px"
                            }}>P8004</p>
                            <p className="text-[10px] font-bold border border-gray-800 inline-block px-2 py-0.5 mt-1">PREFERENCIAL 80+</p>
                            {printTemplate !== "compact" && (
                              <p className="text-[10px] mt-1">01/04/2026 às 14:30</p>
                            )}
                            <div className="border-t border-dashed border-gray-400" style={{ margin: `${printBlockSpacing * 0.8}px 0` }} />
                            <p className="text-[10px] font-bold">{printHeaderText}</p>
                            {printShowQr && printTemplate !== "compact" && (
                              <div className="bg-gray-100 rounded p-2 mx-auto w-16 h-16 flex items-center justify-center mt-1">
                                <span className="text-[8px] text-gray-500">QR Code</span>
                              </div>
                            )}
                            <div className="border-t border-dashed border-gray-400" style={{ margin: `${printBlockSpacing * 0.8}px 0` }} />
                            <p className="text-[9px] text-gray-500">{printFooterText}</p>
                            {/* Cut extra height */}
                            {printCutExtraHeight > 0 && (
                              <div style={{ height: `${printCutExtraHeight * 1.5}px` }} />
                            )}
                          </div>
                          {/* Cut line */}
                          <div className="relative">
                            <div className="border-t-2 border-dashed border-red-400 w-full" />
                            <span className="absolute -top-2.5 right-1 text-[8px] text-red-400 bg-white px-1">✂ corte</span>
                          </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-3">
                          Largura: {printPaperWidth} • Modelo: {printTemplate}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, icon, checked, onChange }: {
  label: string; desc: string; icon?: React.ReactNode;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border">
      <div>
        <p className="font-medium flex items-center gap-2">{icon}{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
