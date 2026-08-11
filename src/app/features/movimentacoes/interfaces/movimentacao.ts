export type CategoriaMovimentacao = 'Salário' | 'PIX' | 'TED' | 'Boleto' | 'Cartão' | 'Investimento' | 'Outros';

export interface Movimentacao {
    id: string;
    data: string;
    tipo: 'Entrada' | 'Saida';
    categoria: CategoriaMovimentacao;
    descricao: string;
    valor: number;
}

// Tipo utilitário usado para a criação (DTO) na tela de cadastro.
// Omit copia todos os campos de Movimentacao, mas REMOVE a obrigatoriedade do 'id',
// garantindo que o frontend envie os dados corretos sem precisar mockar um ID.
export type NovaMovimentacao = Omit<Movimentacao, 'id'>;
