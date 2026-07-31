import React, { useEffect, useRef, useState } from "react";
import { useInstitutionSettings, useUpdateInstitutionSettings } from "@/hooks/useTotem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Upload, Check, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Compact institution identity bar. Same hooks/data as InstitutionSettingsCard,
 * just slimmer visual for the top of /admin-autoatendimento.
 */
export function InstitutionHeaderCompact() {
  const { data: inst } = useInstitutionSettings();
  const update = useUpdateInstitutionSettings();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (inst?.name) setName(inst.name); }, [inst?.name]);

  if (!inst) {
    return (
      <div className="rounded-lg border bg-card px-4 py-2 text-sm text-muted-foreground">
        Carregando instituição…
      </div>
    );
  }

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === inst.name) { setEditing(false); return; }
    update.mutate({ id: inst.id, name: trimmed }, { onSuccess: () => setEditing(false) });
  };

  const cancel = () => { setName(inst.name); setEditing(false); };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `institution/logo-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("public-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
      update.mutate({ id: inst.id, logo_url: data.publicUrl });
    } catch (err: any) {
      toast.error("Erro ao enviar logo: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border bg-card px-4 py-2.5 flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Trocar logo institucional"
        className="w-10 h-10 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center hover:border-primary transition shrink-0"
      >
        {inst.logo_url ? (
          <img src={inst.logo_url} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Instituição</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 w-56"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={save}><Check className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancel}><X className="w-4 h-4" /></Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{inst.name}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        <Upload className="w-3.5 h-3.5 mr-1" />
        {inst.logo_url ? "Trocar logo" : "Enviar logo"}
      </Button>

      <span className="text-xs text-muted-foreground basis-full sm:basis-auto">
        Marca principal da clínica/hospital. Não confundir com unidade/setor.
      </span>
    </div>
  );
}
