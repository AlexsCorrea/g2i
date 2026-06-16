// Parsers for benchtop laboratory equipment.
// Each parser receives a raw payload (text) and returns a normalized result:
// { sampleBarcode, results: [{ code, value, unit, flag? }], rawMeta }
//
// Implementations are intentionally permissive — they accept the common shapes
// each vendor exposes (ASTM E1394 frames for Sysmex/Roche, plain TXT/CSV for AVL).
// They MUST not throw on partial input; instead, return parse_error in the envelope.

export type ParsedResult = {
  code: string;
  value: string;
  unit?: string;
  flag?: string;
};

export type ParseEnvelope = {
  ok: boolean;
  protocol: string;
  sampleBarcode?: string;
  results: ParsedResult[];
  meta?: Record<string, any>;
  parse_error?: string;
};

const stripCtl = (s: string) => s.replace(/[\x02\x03\x04\x05\x06\x17\x0b\x1c-\x1f]/g, "");

/** ASTM E1394 generic frame parser (used by Sysmex XN-series and Roche cobas).
 *  Splits on CR/LF, identifies H/P/O/R records. */
export function parseAstm(raw: string): ParseEnvelope {
  try {
    const text = stripCtl(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let sampleBarcode: string | undefined;
    const results: ParsedResult[] = [];
    for (const line of lines) {
      const type = line[0];
      const fields = line.slice(2).split("|");
      if (type === "O") {
        // O|seq|sampleID|...
        sampleBarcode = fields[1]?.split("^")[0] || sampleBarcode;
      }
      if (type === "R") {
        // R|seq|^^^TEST|value|unit|refRange|flag|...
        const testRaw = fields[1] || "";
        const code = testRaw.split("^").filter(Boolean).pop() || testRaw;
        const value = fields[2] ?? "";
        const unit = fields[3] || undefined;
        const flag = fields[5] || undefined;
        if (code && value !== "") results.push({ code, value, unit, flag });
      }
    }
    return { ok: true, protocol: "ASTM", sampleBarcode, results };
  } catch (e: any) {
    return { ok: false, protocol: "ASTM", results: [], parse_error: e?.message ?? "parse error" };
  }
}

/** Roche AVL 9180 — text output. The 9180 prints a small ticket-like block
 *  with one analyte per line: "Na   140 mmol/L". Sample id, when present,
 *  appears as "Sample: 12345" or "Sample ID: 12345". */
export function parseAvl9180(raw: string): ParseEnvelope {
  try {
    const text = raw.replace(/\r/g, "\n");
    const lines = text.split("\n").map(l => l.trim());
    let sampleBarcode: string | undefined;
    const results: ParsedResult[] = [];
    const analyteRe = /^(Na\+?|K\+?|Ca2?\+?|Cl-?|Li\+?)\s*[:=]?\s*([\d.,-]+)\s*([a-zA-Z\/^0-9]+)?/i;
    for (const line of lines) {
      const idMatch = line.match(/sample(?:\s*id)?\s*[:=]?\s*([A-Za-z0-9-]+)/i);
      if (idMatch) sampleBarcode = idMatch[1];
      const m = line.match(analyteRe);
      if (m) {
        const code = m[1].replace("+", "").replace("-", "").replace("2", "");
        const value = m[2].replace(",", ".");
        const unit = m[3] || "mmol/L";
        results.push({ code, value, unit });
      }
    }
    return { ok: true, protocol: "AVL-TXT", sampleBarcode, results };
  } catch (e: any) {
    return { ok: false, protocol: "AVL-TXT", results: [], parse_error: e?.message ?? "parse error" };
  }
}

/** Detects protocol heuristically and dispatches. */
export function autoParse(raw: string, hint?: string): ParseEnvelope {
  const r = raw.trim();
  if (hint === "AVL-TXT" || /^(Na|K|Ca)[\s:=]/im.test(r)) return parseAvl9180(r);
  if (hint?.startsWith("ASTM") || /^H\|/m.test(r)) return parseAstm(r);
  // fall back to ASTM (covers Sysmex/Roche default)
  return parseAstm(r);
}

/** Sample payloads used by the simulator. */
export const SAMPLE_PAYLOADS = {
  sysmexXn350: [
    "H|\\^&|||XN-350^1.0|||||||P|E1394-97|20260616",
    "P|1||PAT001||DOE^JOHN||19800101|M",
    "O|1|SAMP123||^^^CBC|R||||||||||||||||||||F",
    "R|1|^^^WBC|7.42|x10^3/uL||N",
    "R|2|^^^RBC|4.85|x10^6/uL||N",
    "R|3|^^^HGB|14.2|g/dL||N",
    "R|4|^^^HCT|42.1|%||N",
    "R|5|^^^MCV|86.8|fL||N",
    "R|6|^^^PLT|232|x10^3/uL||N",
    "R|7|^^^NEUT|58.4|%||N",
    "R|8|^^^LYMPH|32.1|%||N",
    "L|1|N",
  ].join("\r\n"),

  cobasC111: [
    "H|\\^&|||c111^2.4|||||||P|E1394-97|20260616",
    "P|1||PAT002||SILVA^MARIA||19751212|F",
    "O|1|SAMP456||^^^BIOQ|R||||||||||||||||||||F",
    "R|1|^^^GLUC|98|mg/dL||N",
    "R|2|^^^UREA|34|mg/dL||N",
    "R|3|^^^CREA|0.92|mg/dL||N",
    "R|4|^^^CHOL|182|mg/dL||N",
    "R|5|^^^TRIG|125|mg/dL||N",
    "R|6|^^^AST|22|U/L||N",
    "R|7|^^^ALT|19|U/L||N",
    "L|1|N",
  ].join("\r\n"),

  avl9180: [
    "ROCHE AVL 9180 - ELECTROLYTE ANALYZER",
    "Sample ID: SAMP789",
    "Date: 16/06/2026   Time: 09:42",
    "------------------------------------",
    "Na   140 mmol/L",
    "K    4.2 mmol/L",
    "Ca   1.18 mmol/L",
    "------------------------------------",
  ].join("\n"),
};
