// Isso é 100% igual ao TypeScript que você já usa no Vue — não muda nada aqui.
export type TipoMovimentacao = 'Entrada' | 'Saida';

export type CategoriaMovimentacao =
  | 'Salário'
  | 'PIX'
  | 'TED'
  | 'Boleto'
  | 'Cartão'
  | 'Investimento'
  | 'Outros';

export interface Movimentacao {
  id: string;
  data: string; // formato ISO 'yyyy-MM-dd'
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: number; // sempre positivo; o sinal é definido pelo "tipo"
}

// O "shape" de uma movimentação nova, antes de ganhar um id (usado no formulário)
export type NovaMovimentacao = Omit<Movimentacao, 'id'>;
