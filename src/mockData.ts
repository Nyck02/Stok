import { Produto, Cliente, Fornecedor, Movimentacao } from './types';

export const CATEGORIAS_MOCK = [
  'Eletrônicos',
  'Informática',
  'Acessórios',
  'Escritório',
  'Ferramentas',
  'Mobiliário'
];

export const CLIENTES_MOCK: Cliente[] = [
  {
    id: 'cli-1',
    nome: 'Carlos Eduardo Souza',
    email: 'carlos.eduardo@gmail.com',
    telefone: '(11) 98765-4321',
    documento: '123.456.789-00',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  {
    id: 'cli-2',
    nome: 'Beatriz Maria Pinheiro',
    email: 'beatriz.pinheiro@yahoo.com.br',
    telefone: '(21) 97654-3210',
    documento: '987.654.321-11',
    cidade: 'Rio de Janeiro',
    estado: 'RJ'
  },
  {
    id: 'cli-3',
    nome: 'Alexandre Mendes Ramos',
    email: 'alex.mendes@outlook.com',
    telefone: '(31) 96543-2109',
    documento: '456.789.123-22',
    cidade: 'Belo Horizonte',
    estado: 'MG'
  },
  {
    id: 'cli-4',
    nome: 'Mariana Costa Lima',
    email: 'mari.lima@gmail.com',
    telefone: '(41) 95432-1098',
    documento: '789.123.456-33',
    cidade: 'Curitiba',
    estado: 'PR'
  },
  {
    id: 'cli-5',
    nome: 'Juliana Barbosa Neves',
    email: 'juliana.neves@gmail.com',
    telefone: '(19) 94321-0987',
    documento: '321.654.987-44',
    cidade: 'Campinas',
    estado: 'SP'
  }
];

export const FORNECEDORES_MOCK: Fornecedor[] = [
  {
    id: 'for-1',
    nome: 'Distribuidora Tech Brasil Ltda',
    contato: 'Roberto Alencar',
    email: 'comercial@techbrasil.com.br',
    telefone: '(11) 3344-5566',
    documento: '12.345.678/0001-90',
    cidade: 'São Paulo',
    estado: 'SP'
  },
  {
    id: 'for-2',
    nome: 'Mega suprimentos Atacadista',
    contato: 'Fernanda Rocha',
    email: 'vendas@megasuprimentos.com',
    telefone: '(21) 2233-4455',
    documento: '98.765.432/0001-21',
    cidade: 'Duque de Caxias',
    estado: 'RJ'
  },
  {
    id: 'for-3',
    nome: 'Nacional Logística & Equipamentos',
    contato: 'Sérgio Reis',
    email: 'atendimento@nacionallog.com.br',
    telefone: '(47) 3456-7890',
    documento: '45.678.912/0001-34',
    cidade: 'Itajaí',
    estado: 'SC'
  }
];

export const PRODUTOS_MOCK: Produto[] = [
  {
    id: 'prod-1',
    nome: 'Teclado Mecânico RGB Gamer',
    sku: 'TEC-MEC-01',
    categoria: 'Acessórios',
    precoCompra: 120.00,
    precoVenda: 249.90,
    estoqueAtual: 28,
    estoqueMinimo: 10,
    fornecedorId: 'for-1',
    descricao: 'Teclado mecânico switch blue com retroiluminação RGB e layout ABNT2.'
  },
  {
    id: 'prod-2',
    nome: 'Mouse Sem Fio Ergonômico',
    sku: 'MOU-SEM-02',
    categoria: 'Acessórios',
    precoCompra: 45.00,
    precoVenda: 99.90,
    estoqueAtual: 4, // Abaixo do mínimo!
    estoqueMinimo: 15,
    fornecedorId: 'for-1',
    descricao: 'Mouse ergonômico sem fio com ajuste de DPI e bateria recarregável.'
  },
  {
    id: 'prod-3',
    nome: 'Monitor LED 24" Full HD 75Hz',
    sku: 'MON-LED-24',
    categoria: 'Eletrônicos',
    precoCompra: 450.00,
    precoVenda: 799.00,
    estoqueAtual: 12,
    estoqueMinimo: 5,
    fornecedorId: 'for-3',
    descricao: 'Monitor LED widescreen de 24 polegadas com entradas HDMI e VGA.'
  },
  {
    id: 'prod-4',
    nome: 'SSD NVMe M.2 1TB Kingston',
    sku: 'SSD-NVM-1T',
    categoria: 'Informática',
    precoCompra: 210.00,
    precoVenda: 459.90,
    estoqueAtual: 3, // Abaixo do mínimo!
    estoqueMinimo: 8,
    fornecedorId: 'for-2',
    descricao: 'SSD ultrarrápido de 1TB com velocidades de leitura de até 3500MB/s.'
  },
  {
    id: 'prod-5',
    nome: 'Memória RAM DDR4 16GB 3200MHz',
    sku: 'RAM-DDR4-16',
    categoria: 'Informática',
    precoCompra: 150.00,
    precoVenda: 329.00,
    estoqueAtual: 22,
    estoqueMinimo: 10,
    fornecedorId: 'for-1',
    descricao: 'Módulo de memória RAM de alto desempenho com dissipador de calor.'
  },
  {
    id: 'prod-6',
    nome: 'Cadeira Office Ergonômica',
    sku: 'CAD-OFF-09',
    categoria: 'Mobiliário',
    precoCompra: 380.00,
    precoVenda: 749.00,
    estoqueAtual: 1, // Alerta crítico!
    estoqueMinimo: 3,
    fornecedorId: 'for-3',
    descricao: 'Cadeira com encosto de tela mesh, ajuste de altura e apoio lombar.'
  },
  {
    id: 'prod-7',
    nome: 'Webcam 1080p com Microfone',
    sku: 'WEB-CAM-10',
    categoria: 'Acessórios',
    precoCompra: 85.00,
    precoVenda: 189.00,
    estoqueAtual: 18,
    estoqueMinimo: 6,
    fornecedorId: 'for-2',
    descricao: 'Webcam Full HD com foco automático e anel de luz embutido.'
  },
  {
    id: 'prod-8',
    nome: 'Hub USB-C 7 em 1 Alumínio',
    sku: 'HUB-USBC-7',
    categoria: 'Acessórios',
    precoCompra: 65.00,
    precoVenda: 149.90,
    estoqueAtual: 32,
    estoqueMinimo: 12,
    fornecedorId: 'for-1',
    descricao: 'Hub com conexões HDMI 4K, leitor de cartões, portas USB 3.0 e USB-C PD.'
  }
];

// Gerar movimentações históricas cobrindo de Abril de 2026 até hoje (1 de Julho de 2026)
export const MOVIMENTACOES_MOCK: Movimentacao[] = [
  // Abril 2026
  {
    id: 'mov-1',
    produtoId: 'prod-1',
    tipo: 'entrada',
    quantidade: 30,
    data: '2026-04-05T10:00:00.000Z',
    motivo: 'Compra',
    valorUnitario: 120.00,
    fornecedorId: 'for-1'
  },
  {
    id: 'mov-2',
    produtoId: 'prod-3',
    tipo: 'entrada',
    quantidade: 10,
    data: '2026-04-06T14:30:00.000Z',
    motivo: 'Compra',
    valorUnitario: 450.00,
    fornecedorId: 'for-3'
  },
  {
    id: 'mov-3',
    produtoId: 'prod-1',
    tipo: 'saida',
    quantidade: 3,
    data: '2026-04-10T16:15:00.000Z',
    motivo: 'Venda',
    valorUnitario: 249.90,
    clienteId: 'cli-1'
  },
  {
    id: 'mov-4',
    produtoId: 'prod-3',
    tipo: 'saida',
    quantidade: 2,
    data: '2026-04-12T11:00:00.000Z',
    motivo: 'Venda',
    valorUnitario: 799.00,
    clienteId: 'cli-2'
  },
  {
    id: 'mov-5',
    produtoId: 'prod-4',
    tipo: 'entrada',
    quantidade: 15,
    data: '2026-04-15T09:10:00.000Z',
    motivo: 'Compra',
    valorUnitario: 210.00,
    fornecedorId: 'for-2'
  },
  {
    id: 'mov-6',
    produtoId: 'prod-4',
    tipo: 'saida',
    quantidade: 5,
    data: '2026-04-18T15:40:00.000Z',
    motivo: 'Venda',
    valorUnitario: 459.90,
    clienteId: 'cli-1' // Carlos mais um pedido
  },
  {
    id: 'mov-7',
    produtoId: 'prod-2',
    tipo: 'entrada',
    quantidade: 20,
    data: '2026-04-20T08:00:00.000Z',
    motivo: 'Compra',
    valorUnitario: 45.00,
    fornecedorId: 'for-1'
  },
  {
    id: 'mov-8',
    produtoId: 'prod-2',
    tipo: 'saida',
    quantidade: 8,
    data: '2026-04-25T13:20:00.000Z',
    motivo: 'Venda',
    valorUnitario: 99.90,
    clienteId: 'cli-3'
  },

  // Maio 2026
  {
    id: 'mov-9',
    produtoId: 'prod-5',
    tipo: 'entrada',
    quantidade: 25,
    data: '2026-05-02T10:40:00.000Z',
    motivo: 'Compra',
    valorUnitario: 150.00,
    fornecedorId: 'for-1'
  },
  {
    id: 'mov-10',
    produtoId: 'prod-5',
    tipo: 'saida',
    quantidade: 4,
    data: '2026-05-05T14:15:00.000Z',
    motivo: 'Venda',
    valorUnitario: 329.00,
    clienteId: 'cli-4'
  },
  {
    id: 'mov-11',
    produtoId: 'prod-1',
    tipo: 'saida',
    quantidade: 5,
    data: '2026-05-10T11:30:00.000Z',
    motivo: 'Venda',
    valorUnitario: 249.90,
    clienteId: 'cli-1' // Carlos compra de novo
  },
  {
    id: 'mov-12',
    produtoId: 'prod-6',
    tipo: 'entrada',
    quantidade: 5,
    data: '2026-05-12T16:00:00.000Z',
    motivo: 'Compra',
    valorUnitario: 380.00,
    fornecedorId: 'for-3'
  },
  {
    id: 'mov-13',
    produtoId: 'prod-6',
    tipo: 'saida',
    quantidade: 2,
    data: '2026-05-15T10:20:00.000Z',
    motivo: 'Venda',
    valorUnitario: 749.00,
    clienteId: 'cli-5'
  },
  {
    id: 'mov-14',
    produtoId: 'prod-2',
    tipo: 'saida',
    quantidade: 5,
    data: '2026-05-18T13:45:00.000Z',
    motivo: 'Venda',
    valorUnitario: 99.90,
    clienteId: 'cli-4' // Mariana compra de novo
  },
  {
    id: 'mov-15',
    produtoId: 'prod-7',
    tipo: 'entrada',
    quantidade: 20,
    data: '2026-05-20T09:00:00.000Z',
    motivo: 'Compra',
    valorUnitario: 85.00,
    fornecedorId: 'for-2'
  },
  {
    id: 'mov-16',
    produtoId: 'prod-7',
    tipo: 'saida',
    quantidade: 2,
    data: '2026-05-25T15:50:00.000Z',
    motivo: 'Venda',
    valorUnitario: 189.00,
    clienteId: 'cli-1' // Carlos compra de novo! (Muito ativo)
  },

  // Junho 2026
  {
    id: 'mov-17',
    produtoId: 'prod-8',
    tipo: 'entrada',
    quantidade: 40,
    data: '2026-06-02T10:00:00.000Z',
    motivo: 'Compra',
    valorUnitario: 65.00,
    fornecedorId: 'for-1'
  },
  {
    id: 'mov-18',
    produtoId: 'prod-8',
    tipo: 'saida',
    quantidade: 8,
    data: '2026-06-05T14:00:00.000Z',
    motivo: 'Venda',
    valorUnitario: 149.90,
    clienteId: 'cli-2' // Beatriz compra de novo
  },
  {
    id: 'mov-19',
    produtoId: 'prod-4',
    tipo: 'saida',
    quantidade: 7,
    data: '2026-06-10T11:15:00.000Z',
    motivo: 'Venda',
    valorUnitario: 459.90,
    clienteId: 'cli-3' // Alexandre
  },
  {
    id: 'mov-20',
    produtoId: 'prod-3',
    tipo: 'saida',
    quantidade: 3,
    data: '2026-06-12T15:30:00.000Z',
    motivo: 'Venda',
    valorUnitario: 799.00,
    clienteId: 'cli-1' // Carlos compra de novo! (5 pedidos)
  },
  {
    id: 'mov-21',
    produtoId: 'prod-6',
    tipo: 'saida',
    quantidade: 2,
    data: '2026-06-18T10:45:00.000Z',
    motivo: 'Venda',
    valorUnitario: 749.00,
    clienteId: 'cli-2' // Beatriz (3 pedidos)
  },
  {
    id: 'mov-22',
    produtoId: 'prod-2',
    tipo: 'saida',
    quantidade: 3,
    data: '2026-06-22T14:50:00.000Z',
    motivo: 'Venda',
    valorUnitario: 99.90,
    clienteId: 'cli-5' // Juliana
  },
  {
    id: 'mov-23',
    produtoId: 'prod-3',
    tipo: 'entrada',
    quantidade: 7,
    data: '2026-06-25T09:30:00.000Z',
    motivo: 'Compra',
    valorUnitario: 450.00,
    fornecedorId: 'for-3'
  },
  {
    id: 'mov-24',
    produtoId: 'prod-5',
    tipo: 'saida',
    quantidade: 3,
    data: '2026-06-28T16:00:00.000Z',
    motivo: 'Venda',
    valorUnitario: 329.00,
    clienteId: 'cli-3' // Alexandre
  },
  // Ajuste de inventário para demonstração
  {
    id: 'mov-25',
    produtoId: 'prod-1',
    tipo: 'saida',
    quantidade: 1,
    data: '2026-06-30T10:00:00.000Z',
    motivo: 'Ajuste',
    valorUnitario: 120.00
  }
];
