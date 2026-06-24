# Prompt de Redesign — Painel Jarvis - Marcellus (MCLL)

> Objetivo: modernizar **todo** o layout e design do painel (rota/arquivo `painel_atrix` mantida), deixando todos os painéis mais **simples e claros de entender**, **sem perder nenhuma informação, gráfico, tabela, modal ou imagem** já existente.

> **Nome de exibição:** o painel passa a se chamar **Painel Jarvis - Marcellus** em todos os pontos visíveis (cabeçalho, tela de login, `<title>` da página). A rota/arquivo `painel_atrix`, os IDs/classes e os nomes de assets (`Logomarca.png`, `jarvis.png`) **permanecem inalterados**.

---

## 1. Restrições inegociáveis (rollback-safe)

1. **Todas as mudanças visuais vivem em um único arquivo CSS novo** (`painel-atrix-redesign.css`), carregado **por último** no `<head>`. Nenhuma regra de estilo é alterada no HTML/JS existente.
2. **Nenhuma alteração na lógica JS atual.** Se for necessário toggle de tema ou troca de aba, adicionar em **bloco JS aditivo separado** (`painel-atrix-redesign.js`), nunca editando funções existentes.
3. **IDs, classes e estrutura de DOM existentes são preservados.** O redesign atua por cima (override de CSS +, se preciso, wrappers aditivos), permitindo desligar o redesign removendo só os 2 arquivos novos.
4. **Zero remoção de conteúdo.** Todo gráfico, KPI, tabela, filtro, modal e texto continua presente.

---

## 2. Imagens a preservar (apenas reposicionar, nunca substituir)

- `assets/Logomarca.png` — login (tela de acesso) **e** cabeçalho do painel.
- `assets/jarvis.png` — faixa "Jarvis Monitor" no topo, ao lado dos contadores globais.

Manter os `src` originais. Reposicionar/redimensionar somente via CSS.

---

## 3. Sistema de design

### 3.1 Tema claro + escuro com toggle
- Implementar com **CSS custom properties** num escopo raiz (`:root` claro) e `[data-theme="dark"]` (escuro).
- Toggle no cabeçalho (ícone sol/lua), persistindo a escolha em `localStorage` (`atrix-theme`).
- Respeitar `prefers-color-scheme` na primeira visita.

Tokens sugeridos:

| Token | Claro | Escuro |
| --- | --- | --- |
| `--bg` | `#F6F7F9` | `#0E1116` |
| `--surface` | `#FFFFFF` | `#171B22` |
| `--surface-2` | `#F1F3F6` | `#1E232C` |
| `--border` | `rgba(0,0,0,.10)` | `rgba(255,255,255,.12)` |
| `--text` | `#1A1D23` | `#E8EAED` |
| `--text-muted` | `#5C636E` | `#9AA1AC` |
| `--accent` | `#2E6BE6` | `#5B8CF5` |

### 3.2 Cor codifica **status apenas** (regra MCLL)
Nenhuma cor decorativa. Paleta semântica única em todos os painéis:

| Status | Cor (claro) | Cor (escuro) | Uso |
| --- | --- | --- | --- |
| Meta / OK | `#1E9E6A` | `#34C98A` | dentro do prazo, dentro da meta |
| Atenção | `#C98A14` | `#E0A93A` | risco, próximo do limite |
| Crítico | `#D23B3B` | `#EF5B5B` | fora do prazo, outlier, severo |
| Neutro | `--text-muted` | `--text-muted` | dados sem julgamento |

Séries de gráfico sem significado de status usam o **accent** (azul) e um tom neutro — nunca arco-íris.

### 3.3 Tipografia (mantida)
- Texto e números: **Inter** (400 e 500 apenas).
- Dados/códigos/protocolos/SLA: **JetBrains Mono**.
- Carregar via `@font-face` local ou Google Fonts já em uso. Sentence case sempre, sem ALL CAPS.

### 3.4 Tokens de layout
- Raio: cards `12px`, controles `8px`, pills `20px`.
- Borda: `0.5px solid var(--border)`.
- Sem sombras, gradientes ou brilhos. Superfícies planas.
- Espaçamento vertical em múltiplos de `8px`.

---

## 4. Estrutura padrão de **todos** os painéis

Ordem fixa e previsível em cada aba (leitura imediata):

1. **Barra de filtros** (chips/selects compactos, alinhados; ações à direita: upload, exportar CSV, gerar relatório).
2. **KPIs** — 3 a 4 metric cards no topo, com a meta explícita abaixo do número quando houver.
3. **Grade de gráficos** — 2 colunas responsivas (`auto-fit, minmax(220px, 1fr)`), cada gráfico em card com título + subtítulo curto.
4. **Tabela(s) de detalhe** — cabeçalho fixo, status por pill colorida, exportável.

Cabeçalho global persistente: logo + título **Painel Jarvis - Marcellus** + faixa Jarvis com contadores **Abertos / Encerrados / Repetidos** + toggle de tema + legenda de status.

---

## 5. Especificação aba a aba (9 abas — todas mantidas)

### 5.1 B2B Abertos
- KPIs: Em aberto · Dentro 8h · Outlier +24h · Aguardando.
- Gráficos: Faixa de SLA · Produção (diário) · Por MOP/EPS · Por substatus.
- Bloco: Referência MOP/EPS por região (MA CAP, MA INT, PI, PA, AP/AM).
- Tabela: chamados em aberto. Ações: adicionar chamado manual, exportar CSV.

### 5.2 B2B Encerrados
- KPIs: Encerrados · Prazo ≤8h · Outlier +24h · TME.
- Gráficos: Performance por cluster · Faixa SLA (aging CCS) · Causa raiz (Pareto) · Distribuição por regra SLA · Análise de prazo e outlier · Evolução por semana · Por segmento · Por UF.
- Tabela: chamados encerrados.

### 5.3 B2B Repetidos
- KPIs: Clientes ofensores · Reincidências · Maior recorrente · Outlier repetido.
- Gráficos: Top clientes repetidos · Causas dominantes · Evolução semanal de reincidências · Distribuição SLA.
- Blocos: Indicativo de ofensores · Detalhamento por cliente (tabela).

### 5.4 Rede
- Sub-abas: **Backbone + Acesso · Acesso · Backbone**. Cluster: Todos · MA CAP · MA INT · PI · NORTE. Granularidade: Acumulado · Mês · Semana. Filtros avançados.
- KPIs com metas: **Prazo ≥88,9% · Outlier ≤4,9% · TME ≤6,0h** + total de chamados.
- Gráficos: Mês diário (barras + evolução) · Evolução consolidada · Meta acumulado · Backbone × Acesso.
- Tabelas: Desempenho por cluster · Cidades ofensoras & causas · Top OS críticas · Backbone × Acesso.
- Relatório executivo automático (actuals vs metas, Pareto, plano de ação).

### 5.5 Combustíveis
- KPIs: Saldo cartão · Aporte do ciclo · Consumo mês · Veículos ativos.
- Gráficos: Consumo por condutor · Ranking maiores consumos · Projeção mês × próximo · Resumo por status de frota.
- Tabelas: Dados da frota · Solicitações · Histórico de retiradas · Aporte do ciclo.
- Ações: importar Alelo, Portal Alelo, cadastrar veículo/condutor.

### 5.6 Report
- Sincronizado via B2B Abertos · abrir em nova aba · formatos PDF/PPTX · status de sync.

### 5.7 WhatsApp / Monitor
- Sub-abas: Monitor · Conversas · Grupos · Contatos.
- KPIs: Status conexão · Grupos · Não lidas · Alertas hoje.
- Lista de grupos: Massivos · INFRA · Gerência · SLN MA/PA · contatos. Painel de conversa + testar alerta.

### 5.8 Produtividade OFS
- KPIs: Técnicos · Atividades · Taxa de conclusão · Em alerta.
- Gráficos: Ranking de produtividade · Status geral · Taxa de conclusão por técnico · Tipos de atividade · Volume diário · Análise por UF/Grupo.
- Tabelas: Análise por UF · por Grupo · Alertas e riscos (card clicável filtra tabela) · Chamados do técnico.
- Ações: upload OFS, gerenciar técnicos.

### 5.9 Acesso & Modais (consolidação das telas auxiliares)
- Login **Painel Jarvis - Marcellus** (usuário/senha) com Logomarca.
- Usuários do painel (listar/criar).
- Backup Google Sheets (URL Apps Script, salvar automático, enviar agora).
- Gerar relatório (seleção de painéis: completo, abertos, encerrados, repetidos, combustíveis, rede, OFS, técnicos).
- Adicionar chamado manual (ID, cliente, UF, cidade, SLA, substatus — MOP/EPS automático).
- Cadastrar veículo/condutor · Gerenciar técnicos OFS.

Rodapé global: `© 2026 · MCLL Monitoramento B2B · Wanderson Marcellus Penha Costa`.

---

## 6. Componentes padronizados
- **Metric card**: rótulo 12px muted, número 22px/500, meta opcional abaixo.
- **Chart card**: título 13px/500 + subtítulo 11px muted + canvas (Chart.js existente preservado).
- **Tabela**: cabeçalho sticky, zebra sutil, pill de status, colunas com ellipsis, scroll horizontal só quando necessário.
- **Chip de filtro**: estado ativo com accent; selects pré-estilizados.
- **Modal**: superfície clara/escura, overlay translúcido, fechar no canto.

---

## 7. Acessibilidade e responsividade
- Contraste AA em ambos os temas.
- Grades reflow para 1 coluna em telas estreitas; tabelas com scroll horizontal.
- Foco visível (ring), navegação por teclado preservada.
- `font-size` mínimo 12px.

---

## 8. Entregáveis
1. `painel-atrix-redesign.css` — camada de override completa (temas, tokens, layout, componentes).
2. `painel-atrix-redesign.js` — bloco aditivo: toggle de tema (persistência) e, se necessário, controle de sub-abas/tema. Nada que toque a lógica existente.
3. Duas linhas de inclusão no `<head>`/fim do `<body>` do `painel_atrix`, carregadas por último.
4. Rollback: remover as duas linhas restaura 100% o painel atual.

---

### Pré-requisito para implementação
Para gerar o CSS/JS preservando exatamente classes, IDs e seletores, é necessário o **HTML fonte cru** do `painel_atrix` (arquivo ou conteúdo colado) — a URL pública não expõe o markup real.
