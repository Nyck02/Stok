import { useState, useEffect, useMemo } from 'react';
import { 
  Produto, 
  Movimentacao, 
  Cliente, 
  Fornecedor, 
  PeriodoFiltro 
} from './types';
import { 
  CLIENTES_MOCK, 
  FORNECEDORES_MOCK, 
  PRODUTOS_MOCK, 
  MOVIMENTACOES_MOCK, 
  CATEGORIAS_MOCK 
} from './mockData';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Contacts from './components/Contacts';
import Movements from './components/Movements';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  History, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  Boxes,
  Bell
} from 'lucide-react';

export function StokLogo({ className = "w-8 h-8", alt = 'STOK logo' }: { className?: string; alt?: string }) {
  // Usa imagem estática em `assets/logo.png` para facilitar substituição
  return (
    <img
      src="/Stok/assets/logo.png"
      alt={alt}
      className={className + ' object-contain'}
      id="stok-logo-img"
    />
  );
}

export default function App() {
  // Configuração inicial de Estado carregando do LocalStorage ou usando Mock
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const salvo = localStorage.getItem('estoque_produtos');
    return salvo ? JSON.parse(salvo) : PRODUTOS_MOCK;
  });

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(() => {
    const salvo = localStorage.getItem('estoque_movimentacoes');
    return salvo ? JSON.parse(salvo) : MOVIMENTACOES_MOCK;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const salvo = localStorage.getItem('estoque_clientes');
    return salvo ? JSON.parse(salvo) : CLIENTES_MOCK;
  });

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const salvo = localStorage.getItem('estoque_fornecedores');
    return salvo ? JSON.parse(salvo) : FORNECEDORES_MOCK;
  });

  const [categorias, setCategorias] = useState<string[]>(() => {
    const salvo = localStorage.getItem('estoque_categorias');
    return salvo ? JSON.parse(salvo) : CATEGORIAS_MOCK;
  });

  // Tab Principal Ativa
  const [activeTab, setActiveTab] = useState<'dashboard' | 'estoque' | 'contatos' | 'historico'>('dashboard');

  // Filtros Globais Compartilhados (Filtros Requisito 8)
  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoFiltro>('30d');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroProduto, setFiltroProduto] = useState<string>('');

  // Sincronização automática para LocalStorage
  useEffect(() => {
    localStorage.setItem('estoque_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('estoque_movimentacoes', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  useEffect(() => {
    localStorage.setItem('estoque_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('estoque_fornecedores', JSON.stringify(fornecedores));
  }, [fornecedores]);

  useEffect(() => {
    localStorage.setItem('estoque_categorias', JSON.stringify(categorias));
  }, [categorias]);

  // Atualizar título do documento
  useEffect(() => {
    document.title = "Gerenciador Inteligente de Estoque";
  }, []);

  // Alerta dinâmico: Quantidade de produtos abaixo do mínimo
  const alertasEstoqueCount = useMemo(() => {
    return produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo).length;
  }, [produtos]);

  // Função para redefinir para dados padrão (Excelente para testes)
  const handleResetDados = () => {
    if (window.confirm('Atenção: Isso redefinirá todo o banco de dados para os valores padrão de demonstração. Deseja continuar?')) {
      setProdutos(PRODUTOS_MOCK);
      setMovimentacoes(MOVIMENTACOES_MOCK);
      setClientes(CLIENTES_MOCK);
      setFornecedores(FORNECEDORES_MOCK);
      setCategorias(CATEGORIAS_MOCK);
      setFiltroPeriodo('30d');
      setFiltroCategoria('');
      setFiltroProduto('');
      setActiveTab('dashboard');
    }
  };

  // OPERAÇÕES: PRODUTOS
  const handleAdicionarProduto = (novoProd: Omit<Produto, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const produtoFinal: Produto = { id, ...novoProd };
    setProdutos(prev => [...prev, produtoFinal]);
  };

  const handleEditarProduto = (id: string, atualizacoes: Partial<Produto>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...atualizacoes } : p));
  };

  const handleExcluirProduto = (id: string) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
    // Também remover movimentações associadas para manter consistência
    setMovimentacoes(prev => prev.filter(mov => mov.produtoId !== id));
  };

  // OPERAÇÕES: MOVIMENTAÇÃO (Requisito 1 & 2)
  const handleRegistrarMovimentacao = (novaMov: Omit<Movimentacao, 'id' | 'data'>) => {
    const id = `mov-${Date.now()}`;
    const data = new Date().toISOString();
    const movimentacaoFinal: Movimentacao = { id, data, ...novaMov };

    // Atualizar o estoque do produto correspondente
    setProdutos(prev => prev.map(p => {
      if (p.id === novaMov.produtoId) {
        let novoEstoque = p.estoqueAtual;
        if (novaMov.tipo === 'entrada') {
          novoEstoque += novaMov.quantidade;
        } else if (novaMov.tipo === 'saida') {
          novoEstoque -= novaMov.quantidade;
        }
        return { ...p, estoqueAtual: Math.max(0, novoEstoque) }; // Não deixa ficar negativo por segurança
      }
      return p;
    }));

    setMovimentacoes(prev => [movimentacaoFinal, ...prev]);
  };

  // OPERAÇÃO: ESTORNO DE MOVIMENTAÇÃO
  const handleEstornarMovimentacao = (id: string) => {
    const movObj = movimentacoes.find(m => m.id === id);
    if (!movObj) return;

    // Reverter o estoque do produto
    setProdutos(prev => prev.map(p => {
      if (p.id === movObj.produtoId) {
        let novoEstoque = p.estoqueAtual;
        // Se a movimentação estornada foi ENTRADA, agora subtraímos do estoque
        if (movObj.tipo === 'entrada') {
          novoEstoque -= movObj.quantidade;
        } 
        // Se foi SAÍDA, agora somamos de volta ao estoque
        else if (movObj.tipo === 'saida') {
          novoEstoque += movObj.quantidade;
        }
        return { ...p, estoqueAtual: Math.max(0, novoEstoque) };
      }
      return p;
    }));

    // Remover movimentação do histórico
    setMovimentacoes(prev => prev.filter(m => m.id !== id));
  };

  // OPERAÇÕES: CLIENTES
  const handleAdicionarCliente = (novoCli: Omit<Cliente, 'id'>) => {
    const id = `cli-${Date.now()}`;
    setClientes(prev => [...prev, { id, ...novoCli }]);
  };

  const handleEditarCliente = (id: string, atualizacoes: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...atualizacoes } : c));
  };

  const handleExcluirCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
    // Desvincular movimentações órfãs do cliente
    setMovimentacoes(prev => prev.map(m => m.clienteId === id ? { ...m, clienteId: undefined } : m));
  };

  // OPERAÇÕES: FORNECEDORES
  const handleAdicionarFornecedor = (novoForn: Omit<Fornecedor, 'id'>) => {
    const id = `for-${Date.now()}`;
    setFornecedores(prev => [...prev, { id, ...novoForn }]);
  };

  const handleEditarFornecedor = (id: string, atualizacoes: Partial<Fornecedor>) => {
    setFornecedores(prev => prev.map(f => f.id === id ? { ...f, ...atualizacoes } : f));
  };

  const handleExcluirFornecedor = (id: string) => {
    setFornecedores(prev => prev.filter(f => f.id !== id));
    // Desvincular fornecedor principal de produtos e de movimentações órfãs
    setProdutos(prev => prev.map(p => p.fornecedorId === id ? { ...p, fornecedorId: '' } : p));
    setMovimentacoes(prev => prev.map(m => m.fornecedorId === id ? { ...m, fornecedorId: undefined } : m));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* Top Navigation Bar */}
      <nav className="bg-stok-dark border-b border-stok-dark-light/50 px-4 sm:px-6 shrink-0 sticky top-0 z-50 text-white shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2 sm:py-0 sm:h-16">
          <div className="flex items-center justify-between sm:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3.5 py-1">
              <div className="w-10 h-10 bg-stok-dark border border-stok-gold/30 rounded flex items-center justify-center shadow-md shadow-black/25">
                <StokLogo className="w-7 h-7" strokeColor="#9e8b75" strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-2xl font-bold font-display tracking-[0.18em] text-[#f4f6f5] block leading-none">STOK</span>
                <span className="text-[9px] text-[#9e8b75] font-display font-bold tracking-widest uppercase">Gestão de Estoque</span>
              </div>
            </div>

            {/* Notification & Reset for mobile */}
            <div className="flex items-center gap-3 sm:hidden">
              <button
                onClick={handleResetDados}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Redefinir Dados"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <div className="relative cursor-pointer">
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-stok-dark"></span>
                <Bell className="w-5 h-5 text-slate-300 hover:text-white" />
              </div>
              <div className="w-8 h-8 bg-stok-dark-light rounded-full flex items-center justify-center text-xs font-semibold text-[#f4f6f5] border border-stok-gold/25">
                JD
              </div>
            </div>
          </div>

          {/* Tab Menu - Horizontal scrolling or wrapped */}
          <div className="flex items-center overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 h-10 sm:h-16">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`font-semibold text-sm tracking-tight h-10 sm:h-16 flex items-center border-b-2 transition-all shrink-0 ${
                activeTab === 'dashboard'
                  ? 'text-stok-gold border-stok-gold font-bold'
                  : 'text-slate-300 hover:text-[#f4f6f5] border-transparent'
              }`}
            >
              Dashboard
            </button>

            <button
              id="tab-estoque"
              onClick={() => setActiveTab('estoque')}
              className={`font-semibold text-sm tracking-tight h-10 sm:h-16 flex items-center border-b-2 transition-all shrink-0 relative ${
                activeTab === 'estoque'
                  ? 'text-stok-gold border-stok-gold font-bold'
                  : 'text-slate-300 hover:text-[#f4f6f5] border-transparent'
              }`}
            >
              Estoque
              {alertasEstoqueCount > 0 && (
                <span className="ml-1.5 bg-stok-gold text-stok-dark text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-xs">
                  {alertasEstoqueCount}
                </span>
              )}
            </button>

            <button
              id="tab-contatos"
              onClick={() => setActiveTab('contatos')}
              className={`font-semibold text-sm tracking-tight h-10 sm:h-16 flex items-center border-b-2 transition-all shrink-0 ${
                activeTab === 'contatos'
                  ? 'text-stok-gold border-stok-gold font-bold'
                  : 'text-slate-300 hover:text-[#f4f6f5] border-transparent'
              }`}
            >
              Clientes & Fornecedores
            </button>

            <button
              id="tab-historico"
              onClick={() => setActiveTab('historico')}
              className={`font-semibold text-sm tracking-tight h-10 sm:h-16 flex items-center border-b-2 transition-all shrink-0 ${
                activeTab === 'historico'
                  ? 'text-stok-gold border-stok-gold font-bold'
                  : 'text-slate-300 hover:text-[#f4f6f5] border-transparent'
              }`}
            >
              Lançamentos
            </button>
          </div>

          {/* Right Action Items on Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              id="btn-reset-db"
              onClick={handleResetDados}
              className="flex items-center space-x-1.5 text-slate-300 hover:text-stok-gold text-xs font-semibold py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Redefinir banco de dados para os valores padrão"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Redefinir Dados</span>
            </button>

            <div className="h-4 w-[1px] bg-stok-dark-light"></div>

            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer">
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-stok-dark"></span>
                <Bell className="w-5 h-5 text-slate-300 hover:text-white transition-colors" />
              </div>
              <div className="w-10 h-10 bg-stok-dark-light rounded-full flex items-center justify-center border border-stok-gold/25 font-semibold text-[#f4f6f5] text-sm shadow-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal (Main Area) */}
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
        
        {/* Conteúdo Condicional */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              produtos={produtos}
              movimentacoes={movimentacoes}
              clientes={clientes}
              filtroPeriodo={filtroPeriodo}
              setFiltroPeriodo={setFiltroPeriodo}
              filtroCategoria={filtroCategoria}
              setFiltroCategoria={setFiltroCategoria}
              filtroProduto={filtroProduto}
              setFiltroProduto={setFiltroProduto}
              categorias={categorias}
            />
          )}

          {activeTab === 'estoque' && (
            <Inventory 
              produtos={produtos}
              fornecedores={fornecedores}
              clientes={clientes}
              onAdicionarProduto={handleAdicionarProduto}
              onEditarProduto={handleEditarProduto}
              onExcluirProduto={handleExcluirProduto}
              onRegistrarMovimentacao={handleRegistrarMovimentacao}
              categorias={categorias}
            />
          )}

          {activeTab === 'contatos' && (
            <Contacts 
              clientes={clientes}
              fornecedores={fornecedores}
              movimentacoes={movimentacoes}
              onAdicionarCliente={handleAdicionarCliente}
              onEditarCliente={handleEditarCliente}
              onExcluirCliente={handleExcluirCliente}
              onAdicionarFornecedor={handleAdicionarFornecedor}
              onEditarFornecedor={handleEditarFornecedor}
              onExcluirFornecedor={handleExcluirFornecedor}
            />
          )}

          {activeTab === 'historico' && (
            <Movements 
              movimentacoes={movimentacoes}
              produtos={produtos}
              clientes={clientes}
              fornecedores={fornecedores}
              onEstornarMovimentacao={handleEstornarMovimentacao}
              categorias={categorias}
            />
          )}
        </div>
      </main>

    </div>
  );
}
