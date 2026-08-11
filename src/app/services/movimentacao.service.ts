import { Injectable, computed, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Movimentacao, NovaMovimentacao } from "../models/movimentacao.model";

const STORAGE_KEY = "financeiro:movimentacoes";

/**
 * @Injectable({ providedIn: 'root' }) é o equivalente a criar uma store
 * com defineStore(...) e ela já vir "global" — qualquer componente que injetar
 * esse service recebe a MESMA instância (singleton).
 *
 * Estratégia de armazenamento/leitura (para explicar na apresentação):
 * 1. Na inicialização, tenta ler do localStorage (dados já "persistidos" pelo usuário).
 * 2. Se não existir nada ainda, faz a carga inicial a partir de um JSON mock em /assets
 *    (simulando um "banco de dados" inicial, como pedido no case).
 * 3. Toda alteração (criar movimentação) atualiza o signal em memória E regrava
 *    o localStorage, simulando a gravação em arquivo JSON.
 */
@Injectable({ providedIn: "root" })
export class MovimentacaoService {
  // signal é o equivalente direto ao ref() do Vue (estado reativo).
  // Quando atualizamos ele com .set() ou .update(), qualquer tela que o use atualiza na hora!
  private readonly _movimentacoes = signal<Movimentacao[]>([]);
  private readonly _carregado = signal(false);

  // Expomos como somente-leitura pra fora do service (ninguém de fora deveria
  // conseguir sobrescrever a lista sem passar pelos métodos abaixo)
  readonly movimentacoes = this._movimentacoes.asReadonly();
  readonly carregado = this._carregado.asReadonly();

  // computed() é IDÊNTICO ao computed() do Vue: deriva valor e recalcula sozinho
  // sempre que o signal usado dentro dele mudar.
  readonly movimentacoesOrdenadas = computed(() =>
    [...this._movimentacoes()].sort((a, b) => (a.data < b.data ? 1 : -1)),
  );

  readonly totalEntradas = computed(() =>
    this._movimentacoes()
      .filter((m) => m.tipo === "Entrada")
      .reduce((soma, m) => soma + m.valor, 0),
  );

  readonly totalSaidas = computed(() =>
    this._movimentacoes()
      .filter((m) => m.tipo === "Saida")
      .reduce((soma, m) => soma + m.valor, 0),
  );

  // Lógica de incremento e decremento do saldo:
  // Entrada soma, Saída subtrai. Fica derivado (nunca guardamos "saldo" separado
  // pra não correr risco de ele dessincronizar da lista de movimentações).
  readonly saldoAtual = computed(
    () => this.totalEntradas() - this.totalSaidas(),
  );

  private http = inject(HttpClient);

  /** Carrega os dados (localStorage -> ou JSON mock, se for o 1º acesso) */
  async carregarDados(): Promise<void> {
    if (this._carregado()) return;

    const salvos = localStorage.getItem(STORAGE_KEY);
    if (salvos) {
      this._movimentacoes.set(JSON.parse(salvos));
      this._carregado.set(true);
      return;
    }

    // TODO: Explicar Observable na Entrevista!
    // No Vue usamos Fetch/Axios (que retornam Promises). O HttpClient do Angular retorna um Observable (RxJS).
    // Usamos o firstValueFrom() para converter esse Observable numa Promise e poder usar o await tranquilamente.
    // Primeiro acesso: busca o JSON mock via HttpClient
    const iniciais = await firstValueFrom(
      this.http.get<Movimentacao[]>("assets/movimentacoes-iniciais.json"),
    );
    this._movimentacoes.set(iniciais);
    this.persistir();
    this._carregado.set(true);
  }

  /** Cadastra uma nova movimentação, valida, persiste e retorna sucesso/erro */
  async salvar(
    nova: NovaMovimentacao,
  ): Promise<{ ok: boolean; mensagem: string }> {
    const erro = this.validar(nova);
    if (erro) return { ok: false, mensagem: erro };

    const movimentacao: Movimentacao = {
      ...nova,
      id: crypto.randomUUID(),
    };

    this._movimentacoes.update((lista) => [...lista, movimentacao]);
    this.persistir();

    return { ok: true, mensagem: "Movimentação salva com sucesso!" };
  }

  /** Regras de validação do formulário (Tela 1 do case) */
  private validar(nova: NovaMovimentacao): string | null {
    if (
      !nova.data ||
      !nova.tipo ||
      !nova.categoria ||
      !nova.descricao ||
      nova.valor == null
    ) {
      return "Todos os campos são obrigatórios.";
    }
    const hoje = new Date().toISOString().slice(0, 10);
    if (nova.data > hoje) {
      return "A data não pode ser futura.";
    }
    if (nova.descricao.length < 5 || nova.descricao.length > 100) {
      return "A descrição deve ter entre 5 e 100 caracteres.";
    }
    if (nova.valor <= 0) {
      return "O valor deve ser maior que zero.";
    }
    return null;
  }

  /** "Grava no JSON (mock)" -> na prática, persiste no localStorage do navegador */
  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._movimentacoes()));
  }
}
