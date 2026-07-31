import { supabase } from "@/integrations/supabase/client";

/**
 * Public self-service API (totem, portal and lobby TV).
 * All anonymous reads/writes go through the `queue-public` edge function,
 * which validates identity (CPF + birth date) server-side. No anonymous
 * access to clinical tables is granted directly.
 */
export async function callPublicQueue<T = any>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("queue-public", {
    body: { action, ...payload },
  });
  if (error) {
    let message = "Não foi possível concluir a operação.";
    try {
      const ctx = (error as any).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) message = body.error;
      }
    } catch {
      /* keep generic message */
    }
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}
