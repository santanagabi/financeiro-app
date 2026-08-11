import { Injectable, computed, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Movimentacao, NovaMovimentacao } from "../interfaces/movimentacao";

const STORAGE_KEY = "financeiro:movimentacoes";

/**
 * --- CONCEITOS ARQUITETURAIS APLICADOS (Para a Entrevista) ---
 * 
 * 1. Single Responsibility (Responsabilidade Única): 
 *    Este service é o único responsável pelas regras de negócio das movimentações
 *    (carregar, validar, salvar, calcular totais e gerenciar a persistência). 
 *    Os componentes apenas "assistem" os dados e reagem a eles, delegando toda a lógica para cá.
 * 
 * 2. Single Source of Truth (Fonte Única da Verdade):
 *    O signal privado `_movimentacoes` é a única fonte verdadeira dos dados de todo o sistema.
 *    Extrato, Gráficos e Saldos são apenas "derivados" (computed) dessa mesma fonte.
 *    Por estar encapsulado e exposto como `.asReadonly()`, os componentes não conseguem
 *    modificá-lo diretamente, garantindo que o estado da aplicação nunca fique inconsistente.
 */
@Injectable({ providedIn: "root" })
export class MovimentacaoService {
  private readonly _movimentacoes = signal<Movimentacao[]>([]);
  private readonly _carregado = signal(false);

  readonly movimentacoes = this._movimentacoes.asReadonly();
  readonly carregado = this._carregado.asReadonly();

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

  readonly saldoAtual = computed(
    () => this.totalEntradas() - this.totalSaidas(),
  );

  private http = inject(HttpClient);

  /**
   * Carrega os dados persistidos no localStorage ou inicializa via JSON estático.
   */
  async carregarDados(): Promise<void> {
    if (this._carregado()) return;

    const salvos = localStorage.getItem(STORAGE_KEY);
    if (salvos) {
      this._movimentacoes.set(JSON.parse(salvos));
      this._carregado.set(true);
      return;
    }

    const iniciais = await firstValueFrom(
      this.http.get<Movimentacao[]>("assets/movimentacoes-iniciais.json"),
    );
    this._movimentacoes.set(iniciais);
    this.persistir();
    this._carregado.set(true);
  }

  /**
   * Valida e adiciona uma nova movimentação ao estado.
   */
  async salvar(
    nova: NovaMovimentacao,
  ): Promise<{ ok: boolean; mensagem: string }> {
    const erro = this.validar(nova);
    if (erro) return { ok: false, mensagem: erro };

    const movimentacao: Movimentacao = {
      ...nova,
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : Math.random().toString(36).substring(2, 9),
    };

    this._movimentacoes.update((lista) => [...lista, movimentacao]);
    this.persistir();

    return { ok: true, mensagem: "Movimentação salva com sucesso!" };
  }

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

  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._movimentacoes()));
  }
}

