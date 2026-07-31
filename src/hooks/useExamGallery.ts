import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExamGalleryItem {
  id: string;
  patient_id: string;
  exam_request_id?: string | null;
  uploaded_by?: string | null;
  exam_date: string;
  exam_time?: string | null;
  title: string;
  category: string;
  subcategory?: string | null;
  laterality?: string | null;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size?: number | null;
  mime_type?: string | null;
  thumbnail_url?: string | null;
  status: string;
  origin?: string | null;
  equipment?: string | null;
  professional_name?: string | null;
  observations?: string | null;
  report_text?: string | null;
  report_url?: string | null;
  tags?: string[] | null;
  annotations?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export function useExamGallery(patientId?: string) {
  return useQuery({
    queryKey: ["exam-gallery", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_gallery_items" as any)
        .select("*")
        .eq("patient_id", patientId!)
        .order("exam_date", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ExamGalleryItem[];
    },
    enabled: !!patientId,
  });
}

export function useCreateExamGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<ExamGalleryItem>) => {
      const { data, error } = await supabase
        .from("exam_gallery_items" as any)
        .insert(item as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["exam-gallery", vars.patient_id] });
      toast.success("Arquivo adicionado à galeria");
    },
    onError: () => toast.error("Erro ao adicionar arquivo"),
  });
}

export function useUpdateExamGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExamGalleryItem> & { id: string }) => {
      const { error } = await supabase
        .from("exam_gallery_items" as any)
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam-gallery"] });
      toast.success("Registro atualizado");
    },
  });
}

export function useDeleteExamGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exam_gallery_items" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam-gallery"] });
      toast.success("Arquivo removido");
    },
  });
}

const EXAM_URL_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

/**
 * Uploads to the private `exam-gallery` bucket and returns a signed URL.
 * The bucket is not public and cannot be listed by anonymous visitors.
 */
export async function uploadExamFile(file: File, patientId: string) {
  const ext = file.name.split(".").pop();
  const path = `${patientId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from("exam-gallery").upload(path, file);
  if (error) throw error;
  const { data: signed, error: signError } = await supabase.storage
    .from("exam-gallery")
    .createSignedUrl(data.path, EXAM_URL_TTL_SECONDS);
  if (signError || !signed) throw signError || new Error("Não foi possível gerar o link do arquivo");
  return signed.signedUrl;
}

/** Re-signs a stored exam file URL (used when an old link expires). */
export async function refreshExamFileUrl(fileUrl: string) {
  const match = fileUrl.match(/exam-gallery\/(.+?)(\?|$)/);
  if (!match) return fileUrl;
  const { data } = await supabase.storage.from("exam-gallery").createSignedUrl(match[1], EXAM_URL_TTL_SECONDS);
  return data?.signedUrl || fileUrl;
}

