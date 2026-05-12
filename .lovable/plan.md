## Objetivo

Evoluir o módulo de Autoatendimento para suportar **múltiplas unidades** e **múltiplos totens físicos**, com toda a parametrização concentrada em `/admin-autoatendimento` e seleção do totem físico na primeira abertura da tela operacional `/kiosk`.

## Situação atual

- Tabela `unit_config` é **singleton** (uma linha global) — todas as configurações servem para um único totem.
- `unit_ads` referencia `unit_config_id` mas tudo opera como uma única unidade.
- `queue_tickets` tem `queue_name` e `sector` como texto livre — não há vínculo com unidade nem catálogo de tipos de senha.
- `/admin-autoatendimento` edita o singleton via abas (Identidade, TV, Locução, Impressão, Anúncios, etc.).
- `/kiosk` carrega o singleton e exibe sempre as mesmas opções (Senha / Check-in).

## Modelo de dados (nova arquitetura)

```
totem_units (Unidade de Totem)
 ├─ id, name, active, observations
 ├─ logo_url, primary_color, secondary_color, background_image_url
 ├─ todos os campos de config hoje em unit_config
 │  (impressão, locução, TV, check-in, timeouts, privacidade...)
 └─ 1:N → totem_devices, totem_ticket_types, unit_ads

totem_devices (Totem Físico)
 ├─ id, unit_id (FK), name, location, device_identifier
 ├─ active, observations
 └─ overrides JSONB (sobrescritas opcionais sobre a unidade)

totem_ticket_types (Tipos de Senha por Unidade)
 ├─ id, unit_id (FK), code, label
 ├─ priority (0=normal, 1=preferencial, 2=urgência...)
 ├─ color, prefix (letra ex.: "C", "P", "U"), display_order, active
 └─ ex.: Ambulatório → Consulta, Retorno, Preferencial, 60+, 80+
        PS → Triagem, Urgência, Preferencial
        CC → Admissão Cirúrgica, Pós-op, Acompanhante

unit_ads (já existe) — repontar FK para totem_units
```

## Migrações de banco

1. Criar `totem_units` copiando a estrutura completa de `unit_config` + nome, status, observações.
2. **Migrar a linha existente** de `unit_config` para `totem_units` como "Unidade Padrão" (preserva configs atuais).
3. Criar `totem_devices` com FK para `totem_units`.
4. Criar `totem_ticket_types` com FK para `totem_units`. Seed dos tipos atuais (Normal, Preferencial, etc.) na unidade padrão.
5. Adicionar `device_id` (uuid, FK opcional → totem_devices) em `queue_tickets` para rastreabilidade.
6. Repontar `unit_ads.unit_config_id` → `unit_id` em `totem_units` (manter dados).
7. RLS: leitura pública (anon + auth) para `totem_units`, `totem_devices`, `totem_ticket_types` (necessário para totem operar). Escrita restrita a `authenticated`.
8. Manter `unit_config` no banco temporariamente como view/legado para compatibilidade — código novo lê de `totem_units`.

## Frontend

### `/admin-autoatendimento` (reescrita do shell)

Estrutura nova:

```
┌─ Sidebar/Selector ─┐  ┌─ Conteúdo (abas) ────────────────┐
│ Unidades de Totem  │  │ [Geral] [Identidade] [TV]        │
│  • Ambulatório  ✓  │  │ [Locução] [Impressão] [Check-in] │
│  • Pronto-Socorro  │  │ [Tipos de Senha] [Totens Físicos]│
│  • Centro Cirúrg.  │  │ [Anúncios]                       │
│  + Nova unidade    │  │                                  │
└────────────────────┘  └──────────────────────────────────┘
```

- Seletor lateral lista todas as unidades; ao escolher, todas as abas operam na unidade selecionada.
- Botão "+ Nova unidade" cria registro com defaults.
- **Aba Tipos de Senha**: CRUD inline (label, prefixo, prioridade, cor, ordem, ativo).
- **Aba Totens Físicos**: CRUD inline (nome, localização, identificador, ativo). Botão "Copiar link de acesso" gera URL com `?device=<id>` para provisionar dispositivo.
- Demais abas (impressão, locução, TV, identidade) reaproveitam controles atuais, agora gravando em `totem_units` da unidade selecionada.

### Hooks

- Reescrever `useUnitConfig.ts` → `useTotemUnits`, `useTotemUnit(id)`, `useTotemDevices(unitId)`, `useTicketTypes(unitId)`, `useUpdateTotemUnit`, `useSelectedDevice` (lê localStorage e resolve unidade).
- Manter shape compatível para componentes que não foram refatorados (alias).

### `/kiosk` (tela operacional)

Fluxo:

1. Hook `useSelectedDevice()` lê `localStorage["zurich.totem.device_id"]`.
2. Se vazio OU `?device=` na URL → tela **"Qual totem é este?"**:
   - Lista totens ativos agrupados por unidade.
   - Ao selecionar, persiste em localStorage e recarrega.
   - Aceita `?device=<uuid>` para provisionamento via QR/link.
3. Resolve `unit_id` do device → carrega config da unidade + tipos de senha.
4. `KioskHome` exibe botões só para os fluxos habilitados na unidade (Senha / Check-in).
5. `KioskTicket` exibe **apenas** os `totem_ticket_types` da unidade vinculada ao totem (substitui lista hard-coded).
6. Identidade visual (logo, cores, background) vem da unidade.
7. Rodapé do kiosk mostra discreto: `Unidade • Totem` + ícone de engrenagem para "Trocar totem" (limpa localStorage).
8. Se nenhum totem cadastrado/ativo → bloqueia operação com aviso "Selecione o totem para iniciar o autoatendimento."
9. Ticket emitido grava `device_id` e `unit_id` em `queue_tickets.checkin_data` (ou nova coluna).

### Componentes a criar

- `src/components/autoatendimento/UnitSelector.tsx` — sidebar de unidades.
- `src/components/autoatendimento/UnitGeneralTab.tsx` — nome/ativo/observações.
- `src/components/autoatendimento/TicketTypesTab.tsx` — CRUD tipos de senha.
- `src/components/autoatendimento/DevicesTab.tsx` — CRUD totens físicos.
- `src/components/kiosk/KioskDeviceSelect.tsx` — tela "Qual totem é este?".
- `src/hooks/useTotem.ts` — hooks novos (units, devices, ticket types, selected).

### Componentes a editar

- `src/pages/AdminAutoatendimento.tsx` — adicionar seletor de unidade + 2 abas novas; abas existentes passam a receber `unitId`.
- `src/pages/Kiosk.tsx` — gate de seleção de totem; carrega config por `unit_id`.
- `src/components/kiosk/KioskHome.tsx` — usa config da unidade selecionada; rodapé com totem/troca.
- `src/components/kiosk/KioskTicket.tsx` — lista tipos de senha vindos da unidade.

## Regras de segurança / operacionais

- Sem totem selecionado → kiosk bloqueia emissão.
- Sobrescritas (`overrides` no device) têm prioridade sobre config da unidade quando preenchidas.
- Trocar totem requer confirmação (limpa cache local).
- localStorage key: `zurich.totem.device_id` (uma por dispositivo).

## Massa de teste (seed)

- 3 unidades: Ambulatório, Pronto-Socorro, Centro Cirúrgico (cada uma com config completa).
- 5 totens: Ambulatório-1, Ambulatório-2, PS-Recepção, PS-Triagem, CC-1.
- Tipos de senha por unidade conforme exemplos do briefing.

## Resumo de arquivos

| Ação | Arquivo |
|---|---|
| Migration | nova `totem_units` + `totem_devices` + `totem_ticket_types` + migração de dados + `device_id` em queue_tickets |
| Seed | unidades, totens e tipos de senha exemplo |
| Reescrever | `src/pages/AdminAutoatendimento.tsx`, `src/hooks/useUnitConfig.ts` (→ `useTotem.ts`), `src/pages/Kiosk.tsx` |
| Editar | `src/components/kiosk/KioskHome.tsx`, `KioskTicket.tsx`, `KioskCheckin.tsx` |
| Criar | `UnitSelector`, `TicketTypesTab`, `DevicesTab`, `UnitGeneralTab`, `KioskDeviceSelect` |
