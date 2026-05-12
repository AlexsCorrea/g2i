# Plano — Refino do /admin-autoatendimento (Unidades, Identidade e Tipo×Prioridade)

## Objetivo
Refatorar 3 frentes do módulo Autoatendimento:
1. UX de cadastro de Unidades de Totem (drawer profissional, sem `prompt()`).
2. Identidade visual com remoção de logo/fundo + clareza entre **Instituição** e **Unidade**.
3. Separar **Tipo de Senha** (categoria de atendimento) de **Prioridade** (Normal, Preferencial, 60+, 80+), com amarração N:N e fluxo correto no totem.

---

## 1) Gestão de Unidades de Totem

### Interface
- Substituir `prompt()/confirm()` por **Drawer lateral grande** ("Gerenciar Unidades") aberto a partir de um botão `Gerenciar Unidades` na barra de seleção.
- Drawer lista todas as unidades em tabela (Nome, Situação, Observações, ações Editar/Excluir).
- Botão "Nova Unidade" abre formulário inline com campos:
  - **Nome da Unidade** (ex.: Ambulatório, Pronto-Socorro, Centro Cirúrgico, Internação, Exames)
  - **Situação** (Ativa / Inativa — toggle)
  - **Observações** (textarea opcional)
- Edição inline na mesma tabela; exclusão com confirmação modal (não `confirm()` nativo).
- Mensagens de erro/sucesso via `toast`.

### Schema
- Adicionar coluna `observations TEXT NULL` em `totem_units` (já existe `active`, `name`).

---

## 2) Identidade Visual — Trocar e Remover

- Na aba **Identidade** adicionar botão **Remover** ao lado de **Trocar** para:
  - Logo (`logo_url`)
  - Imagem de fundo (`background_image_url`)
- Ao remover, fazer `update` setando o campo para `NULL` e atualizar pré-visualização.
- Placeholders visuais quando ausentes:
  - Logo: ícone `Building2` em quadro pontilhado
  - Fundo: gradiente padrão (primary→secondary)
- Garantir que totem (`Kiosk.tsx`) e TV (`QueueTV.tsx`) já tratam `null` (já tratam — verificado).

### Distinção Instituição × Unidade
- Adicionar nova seção "Identidade da Instituição" (nível global) com campo **Nome da Instituição** (ex.: OftalmoCenter).
- Campo **Nome da Unidade** permanece por unidade (Ambulatório etc.).
- Atualizar labels e textos de ajuda em ambas as áreas.

### Schema
- Criar tabela singleton `institution_settings` (id, name, logo_url, updated_at) OU adicionar `institution_name TEXT` num registro de configuração global.
- Decisão: criar `institution_settings` com 1 linha (mais limpo, permite logo institucional futura).
- Exibição no Totem: cabeçalho mostra "Instituição • Unidade" (ex.: "OftalmoCenter — Ambulatório").

---

## 3) Tipo de Senha × Prioridade (regra de negócio)

### Modelo de dados
- **Tipos de senha** (`totem_ticket_types`) deixam de carregar prioridade no próprio registro. Manter colunas existentes mas remover semântica de "preferencial/60+/80+" como tipos.
- Criar **catálogo fixo de prioridades** (enum em código, não tabela):
  - `normal` (peso 0)
  - `preferencial` (peso 2)
  - `preferencial_60` (peso 3)
  - `preferencial_80` (peso 4)
- Criar tabela de amarração N:N:
  ```
  totem_ticket_type_priorities (
    id uuid pk,
    ticket_type_id uuid fk → totem_ticket_types,
    priority_code text,         -- 'normal' | 'preferencial' | 'preferencial_60' | 'preferencial_80'
    enabled boolean default true,
    unique(ticket_type_id, priority_code)
  )
  ```
- Em `queue_tickets` adicionar coluna `priority_code TEXT` (mantém `priority` numérico para ordenação retro-compatível). Default `normal`.

### Migração de dados
- Limpar tipos existentes que são prioridades disfarçadas:
  - Remover/converter `preferencial`, `preferencial_60`, `preferencial_80` da tabela `totem_ticket_types` se existirem como tipos (apenas seed).
- Reseedar tipos por unidade conforme exemplos:
  - Ambulatório: Consulta, Retorno, Exames
  - Pronto-Socorro: Triagem, Consulta
  - Financeiro: Financeiro
  - etc.
- Para cada tipo, criar amarrações em `totem_ticket_type_priorities`:
  - Consulta, Pós-operatório, Triagem, Retorno: todas as 4 prioridades
  - Financeiro: Normal, Preferencial
  - Exames: Normal, Preferencial, 60+, 80+

### Aba "Tipos de Senha" (admin)
- Layout reformulado: cada linha de tipo expõe **chips multi-select de prioridades aceitas** (Normal / Preferencial / 60+ / 80+).
- Header da seção deixa explícito: "Tipo é a **categoria de atendimento**. Prioridade é uma **característica configurável**."
- Campos do tipo: código, rótulo, sigla (prefixo), ordem, cor, ativo, **prioridades aceitas**.

---

## 4) Fluxo no Totem (KioskTicket)

Novo fluxo em 2 passos:
1. **Passo 1 — Tipo de senha**: usuário escolhe Consulta, Triagem, Financeiro etc.
2. **Passo 2 — Prioridade**:
   - Buscar `totem_ticket_type_priorities` do tipo escolhido.
   - Se houver **só uma** prioridade habilitada → seleciona automaticamente e gera senha.
   - Se houver várias → exibir botões grandes (Normal, Preferencial, 60+, 80+) com cores semânticas (verde/azul/laranja/vermelho).
3. Geração: `useGenerateTicket` recebe `ticket_type` + `priority_code` + `priority` (peso). Prefixo do bilhete combina sigla do tipo (já não derivado da prioridade).

### Hook `useGenerateTicket`
- Aceitar `priority_code` e mapear para peso numérico via util.
- Remover `getPriorityFromType` / `getPrefixFromType` (lógica obsoleta) — prefixo vem do `totem_ticket_types.prefix`.

---

## 5) Exibição da prioridade em todas as telas

Mostrar **Tipo + Prioridade** sempre lado a lado:
- **KioskResult**: badge do tipo + badge de prioridade (cor semântica).
- **Impressão térmica**: linha extra "Prioridade: ..." abaixo do tipo.
- **QueueTV**: adicionar segundo badge de prioridade ao lado do nome.
- **QueuePanel**: badge de prioridade nas listas (separado do tipo).
- **Portal mobile (`/portal`, `QueueMobile`)**: incluir prioridade no card do ticket.

Helper único `priorityMeta(code)` em `src/lib/queuePriority.ts` retorna `{ label, color, weight, speech }`.

---

## 6) Telas/Arquivos impactados

```text
Migrations
  supabase/migrations/<ts>_unit_observations_priorities.sql
    - alter totem_units add observations
    - create institution_settings
    - alter queue_tickets add priority_code
    - create totem_ticket_type_priorities (+ RLS)
    - seed priorities das unidades existentes

Hooks
  src/hooks/useTotem.ts            (institutionSettings, ticketTypePriorities CRUD)
  src/hooks/useQueueTickets.ts     (aceitar priority_code, remover legacy mappers)
  src/hooks/useUnitConfig.ts       (priorityToSpeech usar priority_code)

Lib
  src/lib/queuePriority.ts         (NEW — catálogo + helpers)

Admin
  src/pages/AdminAutoatendimento.tsx
    - novo header "Identidade da Instituição"
    - drawer "Gerenciar Unidades"
    - aba Identidade: botões Remover logo/fundo + placeholders
  src/components/autoatendimento/UnitsManagerDrawer.tsx (NEW)
  src/components/autoatendimento/InstitutionSettingsCard.tsx (NEW)
  src/components/autoatendimento/TicketTypesTab.tsx
    - chips multi-select de prioridades por tipo
    - texto explicativo Tipo ≠ Prioridade

Operacional
  src/components/kiosk/KioskTicket.tsx        (passo 1 tipo → passo 2 prioridade)
  src/components/kiosk/KioskResult.tsx        (badge prioridade + linha de impressão)
  src/components/kiosk/KioskHome.tsx          (mostrar Instituição • Unidade)
  src/pages/QueueTV.tsx                       (badge prioridade)
  src/pages/QueuePanel.tsx                    (badge prioridade nas listas)
  src/pages/QueueMobile.tsx / Portal.tsx      (exibir prioridade)
```

---

## Detalhes técnicos

- **Catálogo de prioridades** fica em `src/lib/queuePriority.ts` (enum + label/cor/peso/locução). Não vira tabela para evitar over-engineering — são valores fixos legais (Estatuto do Idoso 60+/80+).
- **RLS**: novas tabelas seguem padrão existente (read público para totens; write restrito a roles autenticados). `institution_settings` segue mesmo padrão de `totem_units`.
- **Migração retro-compatível**: `queue_tickets.priority` (numérico) preservado para ordenação; `priority_code` é fonte de verdade para exibição/regra. Trigger pequeno: ao inserir, se `priority_code` setado e `priority` nulo → derivar peso.
- **TV/locução**: `priorityToSpeech` passa a usar `priority_code` (não mais `ticket_type`).
- **Compatibilidade de tickets antigos**: backfill: `update queue_tickets set priority_code = case ticket_type when 'preferencial_80' then 'preferencial_80' ... else 'normal' end where priority_code is null`.
- **Drawer** usa `@/components/ui/drawer` (vaul, já presente) com `direction="right"` ou Sheet lateral existente.

## Resultado esperado
- Cadastro de unidades profissional via drawer, sem prompts nativos.
- Identidade visual permite remover logo/fundo, com placeholders limpos.
- Distinção clara entre Nome da Instituição e Nome da Unidade.
- Tipo de Senha e Prioridade tratados como dimensões independentes, com amarração configurável.
- Totem coleta tipo → prioridade (auto-seleciona quando só há uma).
- Painéis, TV, portal e impressão sempre exibem **Tipo + Prioridade**.
