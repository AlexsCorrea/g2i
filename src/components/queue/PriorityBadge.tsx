import { priorityMeta } from "@/lib/queuePriority";

interface Props {
  priorityCode?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Visual badge for ticket priority. Falls back to "Normal" when no code is set.
 * Uses the centralized priority catalog so kiosk/panel/TV stay aligned.
 */
export function PriorityBadge({ priorityCode, size = "md", className = "" }: Props) {
  const meta = priorityMeta(priorityCode);
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border border-black/5 ${sizes[size]} ${className}`}
      style={{ background: meta.hex, color: "#fff" }}
    >
      {meta.label}
    </span>
  );
}
