# Financeiro App (Angular)
<div align="center">
  <video src="docs/assets/financeiro.mp4" controls="controls" muted="muted" style="max-height:640px; min-height: 200px; width: 100%; max-width: 800px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ccc;">
  </video>
</div>

## Tecnologias Utilizadas
- **Framework**: Angular versão 18.2.0 (A versão mais moderna disponível).
- **Linguagem**: TypeScript (TS). No universo Angular, ao contrário do Vue.js (onde é opcional), o desenvolvimento é 100% feito em TypeScript por padrão. Isso é muito valorizado no mercado, pois garante que os dados tenham "tipos" definidos, prevenindo vários bugs de produção.
- **Componentes Visuais**: **Angular Material**, a biblioteca oficial de design do Google para o Angular, garantindo acessibilidade, responsividade e um visual moderno para os botões, menus, tabelas e formulários.
- **Visualização de Dados**: **Chart.js**, utilizado para renderizar os gráficos de alta performance no Dashboard (Gráficos de Rosca, Linha e Barras).
- **Arquitetura (SPA)**: Esta aplicação é uma **SPA (Single Page Application)** renderizada no lado do cliente (Client-Side Rendering). Não estamos usando SSR (Server-Side Rendering) porque a persistência de dados da aplicação foi feita via `localStorage` diretamente no navegador, o que impossibilita o uso de um servidor para pré-renderizar as telas.
- **Gerenciamento de Estado**: Não usamos bibliotecas complexas como NGRX (que seria o "Redux" ou "Vuex" pesadão do Angular) porque seria "matar uma formiga com uma bazuca" para o tamanho desse projeto. Em vez disso, usamos os **Signals** nativos do próprio Angular 18, que são super simples de entender e funcionam de forma idêntica ao Pinia/Vuex que usamos no Vue.js.

## Como rodar

```bash
npm install
npm start
```

Acesse `http://localhost:4200`. A rota inicial redireciona para `/dashboard`.

Se não tiver o Angular CLI globalmente, não tem problema: o `npm start` roda
via `npx` automaticamente porque `@angular/cli` está no `devDependencies`.

## Estrutura do projeto

```
src/app/
├── models/movimentacao.model.ts     -> tipos/interfaces (TS puro)
├── services/movimentacao.service.ts -> "store": estado + persistência + regras de negócio
├── pages/cadastro/                  -> Tela 1: formulário (Reactive Forms)
├── pages/dashboard/                 -> Tela 2: gráficos (Chart.js) + tabela
├── app.component.*                  -> layout (sidebar + topbar) + router-outlet
├── app.routes.ts                    -> rotas
└── app.config.ts                    -> providers globais (router, http client)
```

## Decisões técnicas

1. **Standalone Components** em vez de NgModules — é o padrão atual do Angular
   (desde a v14+, consolidado na v17/18), reduz boilerplate e deixa a estrutura
   mais parecida com componentes isolados, um por pasta/responsabilidade.

2. **Signals** (`signal`, `computed`, `effect`) para gerenciar estado reativo no
   `MovimentacaoService`, em vez de `BehaviorSubject`/RxJS puro. É a abordagem
   recomendada atualmente pelo time do Angular para estado local/de aplicação,
   e o `computed()` recalcula sozinho saldo, totais de entrada/saída etc.
   sempre que a lista de movimentações muda — sem precisar de código manual
   de sincronização.

3. **Persistência**: como é uma aplicação 100% front-end (sem back-end),
   "gravar no JSON" foi resolvido em duas partes:
   - Carga inicial: um arquivo `assets/movimentacoes-iniciais.json` é lido via
     `HttpClient` na primeira execução, simulando o mock de dados.
   - Persistência das alterações: feita no `localStorage` do navegador, já que
     uma aplicação Angular rodando no client não tem permissão de escrever em
     disco. Isso mantém os dados entre recarregamentos da página.

4. **Lógica de saldo**: nunca é guardado um "saldo" isolado no estado — ele é
   sempre **derivado** (`computed`) da soma de entradas menos saída de todas
   as movimentações. Isso evita bugs de dessincronização (ex: saldo ficar
   desatualizado depois de um cadastro).

5. **Reactive Forms** (`FormBuilder`, `Validators`) na Tela 1, em vez de
   Template-Driven Forms — mais robusto para validações compostas (obrigatório
   + min/max de caracteres + regra customizada de "data não pode ser futura"),
   e mais fácil de testar unitariamente.

6. **Chart.js** direto (via `@ViewChild` + `<canvas>`) em vez de um wrapper
   (ex: ng2-charts), para reduzir dependências e mostrar domínio de como o
   Angular expõe referências de DOM (`ViewChild`) e ciclo de vida
   (`AfterViewInit`).

7. **Lazy loading de rotas** (`loadComponent`) — cada tela só é baixada quando
   o usuário navega até ela, boa prática de performance mesmo em app pequeno.

## Coisas que você pode citar como "próximos passos" (mostra maturidade)

- Testes unitários (Jasmine/Karma já vêm com o Angular CLI) para o `service`,
  principalmente a lógica de validação e cálculo de saldo.
- Paginação/filtro na tabela de extrato quando o volume de dados crescer.
- Extrair os componentes de gráfico em componentes reutilizáveis
  (`<app-doughnut-chart [data]="...">`) se o dashboard crescer.
