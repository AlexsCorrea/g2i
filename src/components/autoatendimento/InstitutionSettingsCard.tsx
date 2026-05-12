import React, { useEffect, useRef, useState } from "react";
import { useInstitutionSettings, useUpdateInstitutionSettings } from "@/hooks/useTotem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function InstitutionSettingsCard() {
  const { data: inst } = useInstitutionSettings();
  const update = useUpdateInstitutionSettings();
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (inst?.name) setName(inst.name); }, [inst?.name]);

  if (!inst) {
    return <Card><CardContent className="py-6 text-sm text-muted-foreground">Carregando instituição…</CardContent></Card>;
  }

  const handleSaveName = () => {
    if (!name.trim() || name === inst.name) return;
    update.mutate({ id: inst.id, name: name.trim() });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `institution/logo-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("exam-gallery").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("exam-gallery").getPublicUrl(path);
      update.mutate({ id: inst.id, logo_url: data.publicUrl });
    } catch (err: any) {
      toast.error("Erro ao enviar logo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => update.mutate({ id: inst.id, logo_url: null });

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-4 h-4" /> Identidade da Instituição
        </CardTitle>
        <CardDescription>
          Nome e logo da clínica/hospital. Aparece nos documentos institucionais e como rodapé do totem.
          <span className="block mt-1"><strong>Importante:</strong> não confunda com a Unidade de Totem (Ambulatório, PS, etc.).</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
          <div>
            <Label className="text-xs">Nome da Instituição</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: OftalmoCenter"
                onBlur={handleSaveName}
              />
              <Button onClick={handleSaveName} disabled={name === inst.name || !name.trim()}>
                Salvar
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden">
              {inst.logo_url ? (
                <img src={inst.logo_url} alt="Logo institucional" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="w-3.5 h-3.5 mr-1" /> {inst.logo_url ? "Trocar" : "Enviar logo"}
              </Button>
              {inst.logo_url && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleRemoveLogo}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                </Button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
