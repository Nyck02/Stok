export interface Produto {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  precoCompra: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  fornecedorId: string; // Fornecedor principal
  descricao: string;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string; // ISO String (AAAA-MM-DD ou completo)
  motivo: 'Compra' | 'Venda' | 'Ajuste' | 'Devolução';
  valorUnitario: number; // Preço na hora da movimentação
  clienteId?: string; // Preenchido em caso de 'Venda' (saída)
  fornecedorId?: string; // Preenchido em caso de 'Compra' (entrada)
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string; // CPF ou CNPJ
  cidade: string;
  estado: string;
}

export interface Fornecedor {
  id: string;
  nome: string;
  contato: string;
  email: string;
  telefone: string;
  documento: string; // CNPJ
  cidade: string;
  estado: string;
}

export type PeriodoFiltro = '7d' | '30d' | '90d' | 'tudo' | 'custom';
