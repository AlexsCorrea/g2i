import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  decodeFormToken, patientFormTemplates, saveFormResponse, FORM_CATEGORY_LABEL,
  type FormField,
} from "@/lib/patientForms";

export default function PublicPatientForm() {
  const { token } = useParams<{ token: string }>();
  const payload = useMemo(() => (token ? decodeFormToken(token) : null), [token]);
  const template = useMemo(
    () => patientFormTemplates.find((f) => f.id === payload?.formId) ?? null,
    [payload]
  );

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [sent, setSent] = useState(false);

  const setValue = (id: string, value: unknown) => setAnswers((p) => ({ ...p, [id]: value }));

  if (!payload || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="medical-card p-8 max-w-md text-center">
          <h1 className="text-lg font-semibold text-foreground mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground">
            Este formulário não está disponível. Solicite um novo link à sua unidade de atendimento.
          </p>
        </div>
      </div>
    );
  }

  const submit = () => {
    const missing = template.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.required && (answers[f.id] === undefined || answers[f.id] === "" ||
        (Array.isArray(answers[f.id]) && (answers[f.id] as unknown[]).length === 0)));
    if (missing.length > 0) {
      toast.error(`Responda os campos obrigatórios (${missing.length} pendente(s))`);
      return;
    }
    saveFormResponse({
      id: crypto.randomUUID(),
      formId: template.id,
      patientId: payload.patientId,
      patientName: payload.patientName,
      answers,
      submittedAt: new Date().toISOString(),
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="medical-card p-8 max-w-md text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-foreground mb-1">Respostas enviadas</h1>
          <p className="text-sm text-muted-foreground">
            Obrigado, {payload.patientName}. Suas informações foram encaminhadas à equipe assistencial.
          </p>
        </div>
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const value = answers[field.id];
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setValue(field.id, e.target.value)}
            className="min-h-[90px]"
          />
        );
      case "number":
      case "date":
      case "text":
        return (
          <Input
            type={field.type === "text" ? "text" : field.type}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => setValue(field.id, e.target.value)}
          />
        );
      case "select":
        return (
          <Select value={(value as string) ?? undefined} onValueChange={(v) => setValue(field.id, v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="z-[200]">
              {field.options?.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup value={(value as string) ?? ""} onValueChange={(v) => setValue(field.id, v)} className="gap-2">
            {field.options?.map((o) => (
              <div key={o} className="flex items-center gap-2">
                <RadioGroupItem value={o} id={`${field.id}-${o}`} />
                <Label htmlFor={`${field.id}-${o}`} className="text-sm font-normal">{o}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox": {
        const list = (value as string[]) ?? [];
        return (
          <div className="grid gap-2 sm:grid-cols-2">
            {field.options?.map((o) => (
              <div key={o} className="flex items-center gap-2">
                <Checkbox
                  id={`${field.id}-${o}`}
                  checked={list.includes(o)}
                  onCheckedChange={(c) =>
                    setValue(field.id, c ? [...list, o] : list.filter((i) => i !== o))
                  }
                />
                <Label htmlFor={`${field.id}-${o}`} className="text-sm font-normal">{o}</Label>
              </div>
            ))}
          </div>
        );
      }
      case "scale": {
        const n = typeof value === "number" ? value : 0;
        return (
          <div className="space-y-2">
            <Slider value={[n]} min={0} max={10} step={1} onValueChange={(v) => setValue(field.id, v[0])} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>0</span>
              <span className="font-medium text-foreground">{n}</span>
              <span>10</span>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="medical-card p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{template.title}</h1>
              <p className="text-xs text-muted-foreground">{template.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="text-[10px]">{FORM_CATEGORY_LABEL[template.category]}</Badge>
                <Badge variant="outline" className="text-[10px]">~{template.estimatedMinutes} min</Badge>
                <Badge variant="secondary" className="text-[10px]">{payload.patientName}</Badge>
              </div>
            </div>
          </div>
        </header>

        {template.sections.map((section) => (
          <section key={section.title} className="medical-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            {section.fields.map((field) => (
              <div key={field.id} className="space-y-1.5">
                <Label className="text-sm">
                  {field.label}
                  {field.required && <span className="text-destructive"> *</span>}
                </Label>
                {renderField(field)}
                {field.help && <p className="text-[11px] text-muted-foreground">{field.help}</p>}
              </div>
            ))}
          </section>
        ))}

        <div className="medical-card p-5 space-y-3">
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Suas respostas são confidenciais e utilizadas apenas pela equipe assistencial responsável pelo seu cuidado.
            </span>
          </div>
          <Button className="w-full" onClick={submit}>Enviar respostas</Button>
        </div>
      </div>
    </div>
  );
}
