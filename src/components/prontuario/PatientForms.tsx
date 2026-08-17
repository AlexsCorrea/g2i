import { useMemo, useState } from "react";
import {
  ClipboardList, Link2, Copy, Check, ExternalLink, QrCode, FileText, Eye, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  patientFormTemplates, FORM_CATEGORY_LABEL, encodeFormToken, loadFormResponses,
  type PatientFormTemplate,
} from "@/lib/patientForms";

interface PatientFormsProps {
  patientId: string;
  patientName: string;
}

export function PatientForms({ patientId, patientName }: PatientFormsProps) {
  const [linkFor, setLinkFor] = useState<PatientFormTemplate | null>(null);
  const [previewFor, setPreviewFor] = useState<PatientFormTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  const responses = useMemo(() => loadFormResponses(patientId), [patientId, linkFor, previewFor]);

  const buildLink = (form: PatientFormTemplate) => {
    const token = encodeFormToken({ formId: form.id, patientId, patientName, createdAt: new Date().toISOString() });
    return `${window.location.origin}/formulario/${token}`;
  };

  const link = linkFor ? buildLink(linkFor) : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copiado — envie ao paciente por WhatsApp, e-mail ou SMS");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Formulários do Paciente</h2>
          <p className="text-xs text-muted-foreground">
            Modelos prontos para preenchimento pela equipe ou pelo próprio paciente via link público.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px]">{patientFormTemplates.length} modelos</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {patientFormTemplates.map((form) => {
          const answered = responses.filter((r) => r.formId === form.id).length;
          return (
            <div key={form.id} className="medical-card p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{form.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{form.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">{FORM_CATEGORY_LABEL[form.category]}</Badge>
                <Badge variant="outline" className="text-[10px]">~{form.estimatedMinutes} min</Badge>
                <Badge variant="outline" className="text-[10px]">
                  {form.sections.reduce((acc, s) => acc + s.fields.length, 0)} perguntas
                </Badge>
                {answered > 0 && (
                  <Badge className="text-[10px]">{answered} resposta{answered > 1 ? "s" : ""}</Badge>
                )}
              </div>
              <div className="flex gap-2 mt-auto">
                <Button size="sm" variant="outline" className="text-xs gap-1.5 flex-1" onClick={() => setPreviewFor(form)}>
                  <Eye className="h-3.5 w-3.5" /> Visualizar
                </Button>
                <Button size="sm" className="text-xs gap-1.5 flex-1" onClick={() => { setLinkFor(form); setCopied(false); }}>
                  <Link2 className="h-3.5 w-3.5" /> Gerar link
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="medical-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Respostas recebidas</h3>
        <p className="text-[11px] text-muted-foreground mb-3">Registros enviados pelo paciente através do link público.</p>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma resposta recebida até o momento.</p>
        ) : (
          <div className="divide-y divide-border">
            {responses.map((r) => {
              const form = patientFormTemplates.find((f) => f.id === r.formId);
              return (
                <div key={r.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{form?.title ?? r.formId}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.submittedAt).toLocaleString("pt-BR")} • {Object.keys(r.answers).length} campos respondidos
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">Recebido</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link dialog */}
      <Dialog open={!!linkFor} onOpenChange={(o) => !o && setLinkFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Link do formulário</DialogTitle>
            <DialogDescription>
              {linkFor?.title} — vinculado a {patientName}. Envie ao paciente para preenchimento remoto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input readOnly value={link} className="text-xs" onFocus={(e) => e.currentTarget.select()} />
              <Button size="icon" variant="outline" onClick={copyLink} title="Copiar link">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => window.open(link, "_blank")}>
                <ExternalLink className="h-3.5 w-3.5" /> Abrir formulário
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${linkFor?.title}: ${link}`)}`, "_blank")}
              >
                <Send className="h-3.5 w-3.5" /> Enviar por WhatsApp
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3">
              <QrCode className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                O link é público e identifica o paciente automaticamente. As respostas ficam disponíveis nesta seção.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewFor} onOpenChange={(o) => !o && setPreviewFor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> {previewFor?.title}
            </DialogTitle>
            <DialogDescription>{previewFor?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-4">
              {previewFor?.sections.map((section) => (
                <div key={section.title}>
                  <p className="text-xs font-semibold text-foreground mb-2">{section.title}</p>
                  <ul className="space-y-1.5">
                    {section.fields.map((f) => (
                      <li key={f.id} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          {f.label}
                          {f.required && <span className="text-destructive"> *</span>}
                          {f.options && <span className="block text-[10px] opacity-80">Opções: {f.options.join(" / ")}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button size="sm" onClick={() => { setLinkFor(previewFor); setPreviewFor(null); }} className="gap-1.5 text-xs">
              <Link2 className="h-3.5 w-3.5" /> Gerar link para o paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
