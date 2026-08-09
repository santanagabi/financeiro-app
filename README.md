# Financeiro App — Case Técnico (Angular)

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

## Decisões técnicas (roteiro para a apresentação)

1. **Standalone Components** em vez de NgModules — é o padrão atual do Angular
   (desde a v14+, consolidado na v17/18), reduz boilerplate e deixa a estrutura
   mais parecida com componentes isolados, um por pasta/responsabilidade.

2. **Signals** (`signal`, `computed`, `effect`) para gerenciar estado reativo no
   `MovimentacaoService`, em vez de `BehaviorSubject`/RxJS puro. É a abordagem
   recomendada atualmente pelo time do Angular para estado local/de aplicação,
   e o `computed()` recalcula sozinho saldo, totais de entrada/saída etc.
   sempre que a lista de movimentações muda — sem precisar de código manual
   de sincronização.

3. **Persistência**: como é uma aplicação 100% front-end (sem back-end, como
   pedido no case), "gravar no JSON" foi resolvido em duas partes:
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
