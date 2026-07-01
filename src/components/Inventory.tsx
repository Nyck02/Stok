import { useState, FormEvent } from 'react';
import { Produto, Fornecedor, Cliente, Movimentacao } from '../types';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit3, 
  Package, 
  Trash2, 
  Layers, 
  Tag, 
  SlidersHorizontal,
  X,
  FileSpreadsheet
} from 'lucide-react';

interface InventoryProps {
  produtos: Produto[];
  fornecedores: Fornecedor[];
  clientes: Cliente[];
  onAdicionarProduto: (p: Omit<Produto, 'id'>) => void;
  onEditarProduto: (id: string, p: Partial<Produto>) => void;
  onExcluirProduto: (id: string) => void;
  onRegistrarMovimentacao: (mov: Omit<Movimentacao, 'id' | 'data'>) => void;
  categorias: string[];
}

export default function Inventory({
  produtos,
  fornecedores,
  clientes,
  onAdicionarProduto,
  onEditarProduto,
  onExcluirProduto,
  onRegistrarMovimentacao,
  categorias
}: InventoryProps) {
  // Estado para filtros de busca local
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [statusEstoque, setStatusEstoque] = useState<'todos' | 'alerta' | 'esgotado'>('todos');

  // Controle de Modais/Formulários
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  // Estados de formulário para NOVO PRODUTO
  const [novoNome, setNovoNome] = useState('');
  const [novoSku, setNovoSku] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoPrecoCompra, setNovoPrecoCompra] = useState(0);
  const [novoPrecoVenda, setNovoPrecoVenda] = useState(0);
  const [novoEstoqueMinimo, setNovoEstoqueMinimo] = useState(5);
  const [novoFornecedorId, setNovoFornecedorId] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');

  // Estados de formulário para REGISTRAR MOVIMENTAÇÃO
  const [movTipo, setMovTipo] = useState<'entrada' | 'saida'>('entrada');
  const [movQuantidade, setMovQuantidade] = useState(1);
  const [movMotivo, setMovMotivo] = useState<'Compra' | 'Venda' | 'Ajuste' | 'Devolução'>('Compra');
  const [movValorUnitario, setMovValorUnitario] = useState(0);
  const [movClienteId, setMovClienteId] = useState('');
  const [movFornecedorId, setMovFornecedorId] = useState('');

  // Filtros aplicados localmente
  const produtosFiltrados = produtos.filter(p => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase());
    const bateCategoria = categoriaSelecionada ? p.categoria === categoriaSelecionada : true;
    
    let bateStatus = true;
    if (statusEstoque === 'alerta') {
      bateStatus = p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0;
    } else if (statusEstoque === 'esgotado') {
      bateStatus = p.estoqueAtual <= 0;
    }

    return bateBusca && bateCategoria && bateStatus;
  });

  // Abrir modal de edição de produto
  const handleOpenEdit = (p: Produto) => {
    setSelectedProduct(p);
    setNovoNome(p.nome);
    setNovoSku(p.sku);
    setNovaCategoria(p.categoria);
    setNovoPrecoCompra(p.precoCompra);
    setNovoPrecoVenda(p.precoVenda);
    setNovoEstoqueMinimo(p.estoqueMinimo);
    setNovoFornecedorId(p.fornecedorId);
    setNovaDescricao(p.descricao);
    setShowEditModal(true);
  };

  // Abrir modal de movimentação (Entrada/Saída)
  const handleOpenMov = (p: Produto) => {
    setSelectedProduct(p);
    setMovTipo('entrada');
    setMovQuantidade(1);
    setMovMotivo('Compra');
    setMovValorUnitario(p.precoCompra); // Default compra
    setMovClienteId('');
    setMovFornecedorId(p.fornecedorId || '');
    setShowMovModal(true);
  };

  // Salvar novo produto
  const handleSaveNovo = (e: FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoSku || !novaCategoria) {
      alert('Por favor, preencha nome, SKU e categoria.');
      return;
    }
    onAdicionarProduto({
      nome: novoNome,
      sku: novoSku,
      categoria: novaCategoria,
      precoCompra: Number(novoPrecoCompra),
      precoVenda: Number(novoPrecoVenda),
      estoqueAtual: 0, // Começa zerado, deve dar entrada
      estoqueMinimo: Number(novoEstoqueMinimo),
      fornecedorId: novoFornecedorId,
      descricao: novaDescricao
    });
    // Limpar
    resetNovoForm();
    setShowAddModal(false);
  };

  const resetNovoForm = () => {
    setNovoNome('');
    setNovoSku('');
    setNovaCategoria('');
    setNovoPrecoCompra(0);
    setNovoPrecoVenda(0);
    setNovoEstoqueMinimo(5);
    setNovoFornecedorId('');
    setNovaDescricao('');
  };

  // Salvar edição de produto
  const handleSaveEdicao = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    onEditarProduto(selectedProduct.id, {
      nome: novoNome,
      sku: novoSku,
      categoria: novaCategoria,
      precoCompra: Number(novoPrecoCompra),
      precoVenda: Number(novoPrecoVenda),
      estoqueMinimo: Number(novoEstoqueMinimo),
      fornecedorId: novoFornecedorId,
      descricao: novaDescricao
    });
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  // Salvar movimentação
  const handleSaveMovimentacao = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (movQuantidade <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    // Se for saída, verificar se há estoque suficiente
    if (movTipo === 'saida' && selectedProduct.estoqueAtual < movQuantidade) {
      const confirma = window.confirm(`Estoque insuficiente! O estoque atual é de ${selectedProduct.estoqueAtual} unidades, mas você está retirando ${movQuantidade}. Deseja prosseguir e deixar o estoque negativo?`);
      if (!confirma) return;
    }

    onRegistrarMovimentacao({
      produtoId: selectedProduct.id,
      tipo: movTipo,
      quantidade: Number(movQuantidade),
      motivo: movMotivo,
      valorUnitario: Number(movValorUnitario),
      clienteId: movTipo === 'saida' ? movClienteId : undefined,
      fornecedorId: movTipo === 'entrada' ? movFornecedorId : undefined
    });

    setShowMovModal(false);
    setSelectedProduct(null);
  };

  // Alternar tipo de movimento para atualizar sugestão de motivos e preços
  const handleTipoMovChange = (tipo: 'entrada' | 'saida') => {
    setMovTipo(tipo);
    if (!selectedProduct) return;

    if (tipo === 'entrada') {
      setMovMotivo('Compra');
      setMovValorUnitario(selectedProduct.precoCompra);
    } else {
      setMovMotivo('Venda');
      setMovValorUnitario(selectedProduct.precoVenda);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Catálogo de Produtos</h2>
          <p className="text-xs text-slate-500">Cadastre, edite e controle as entradas e saídas de mercadorias</p>
        </div>
        <button
          id="btn-add-product"
          onClick={() => {
            resetNovoForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-stok-dark hover:bg-[#343e39] text-[#f4f6f5] border border-stok-gold/30 font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <Plus className="h-4 w-4 text-stok-gold" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            id="search-inventory"
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-stok-gold/20 focus:border-stok-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Categoria */}
          <div className="flex items-center space-x-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              id="filter-inv-category"
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-stok-gold"
            >
              <option value="">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Status de Alerta */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              id="status-all"
              onClick={() => setStatusEstoque('todos')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                statusEstoque === 'todos' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              id="status-alert"
              onClick={() => setStatusEstoque('alerta')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all flex items-center space-x-1 ${
                statusEstoque === 'alerta' ? 'bg-amber-100 text-amber-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span>Abaixo do Mínimo</span>
            </button>
            <button
              id="status-empty"
              onClick={() => setStatusEstoque('esgotado')}
              className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all flex items-center space-x-1 ${
                statusEstoque === 'esgotado' ? 'bg-rose-100 text-rose-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <span>Esgotados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Produtos (Tabela Responsiva) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                <th className="p-4">Produto</th>
                <th className="p-4">SKU / Categoria</th>
                <th className="p-4 text-right">Preço Custo</th>
                <th className="p-4 text-right">Preço Venda</th>
                <th className="p-4 text-center">Estoque Atual</th>
                <th className="p-4 text-center">Estoque Mínimo</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map(p => {
                  const isAbaixoMinimo = p.estoqueAtual <= p.estoqueMinimo && p.estoqueAtual > 0;
                  const isEsgotado = p.estoqueAtual <= 0;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Nome e Descrição */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{p.nome}</span>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{p.descricao || 'Sem descrição cadastrada'}</span>
                          </div>
                        </div>
                      </td>
                      {/* SKU e Categoria */}
                      <td className="p-4">
                        <span className="font-mono text-slate-500 block">{p.sku}</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 mt-1">
                          {p.categoria}
                        </span>
                      </td>
                      {/* Preço de Compra */}
                      <td className="p-4 text-right font-medium text-slate-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoCompra)}
                      </td>
                      {/* Preço de Venda */}
                      <td className="p-4 text-right font-semibold text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.precoVenda)}
                      </td>
                      {/* Estoque Atual */}
                      <td className="p-4 text-center">
                        <span className={`text-sm font-bold ${
                          isEsgotado ? 'text-rose-600' :
                          isAbaixoMinimo ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          {p.estoqueAtual}
                        </span>
                      </td>
                      {/* Estoque Mínimo */}
                      <td className="p-4 text-center text-slate-500 font-medium">
                        {p.estoqueMinimo}
                      </td>
                      {/* Alerta de Status */}
                      <td className="p-4 text-center">
                        {isEsgotado ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Sem Estoque
                          </span>
                        ) : isAbaixoMinimo ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            Baixo Estoque
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ok
                          </span>
                        )}
                      </td>
                      {/* Ações */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            id={`btn-mov-${p.id}`}
                            onClick={() => handleOpenMov(p)}
                            className="bg-stok-gold-light hover:bg-[#f3eae0] text-stok-gold font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                            title="Lançar entrada/saída"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span>Movimentar</span>
                          </button>
                          <button
                            id={`btn-edit-${p.id}`}
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-del-${p.id}`}
                            onClick={() => {
                              if (window.confirm(`Tem certeza de que deseja remover o produto "${p.nome}"?`)) {
                                onExcluirProduto(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nenhum produto encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRAR NOVO PRODUTO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Novo Produto</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNovo} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="Ex: Mousepad Gamer HyperX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    value={novoSku}
                    onChange={(e) => setNovoSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="Ex: PAD-HYP-03"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria *</label>
                  <select
                    required
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoPrecoCompra}
                    onChange={(e) => setNovoPrecoCompra(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoPrecoVenda}
                    onChange={(e) => setNovoPrecoVenda(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={novoEstoqueMinimo}
                    onChange={(e) => setNovoEstoqueMinimo(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fornecedor Principal</label>
                <select
                  value={novoFornecedorId}
                  onChange={(e) => setNovoFornecedorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                >
                  <option value="">Nenhum</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 h-20 resize-none"
                  placeholder="Informações extras sobre o produto..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-stok-dark bg-stok-gold hover:bg-stok-gold-hover rounded-lg shadow-xs"
                >
                  Cadastrar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRODUTO */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Editar Produto</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdicao} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    value={novoSku}
                    onChange={(e) => setNovoSku(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria *</label>
                  <select
                    required
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoPrecoCompra}
                    onChange={(e) => setNovoPrecoCompra(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={novoPrecoVenda}
                    onChange={(e) => setNovoPrecoVenda(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    value={novoEstoqueMinimo}
                    onChange={(e) => setNovoEstoqueMinimo(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fornecedor Principal</label>
                <select
                  value={novoFornecedorId}
                  onChange={(e) => setNovoFornecedorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                >
                  <option value="">Nenhum</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 h-20 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-stok-dark bg-stok-gold hover:bg-stok-gold-hover rounded-lg shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MOVIMENTAÇÃO DE ESTOQUE (ENTRADA / SAÍDA) - REQUISITO 1 */}
      {showMovModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Lançar Entrada / Saída de Estoque</h3>
                <p className="text-[10px] text-stok-gold font-bold mt-0.5">{selectedProduct.nome} (Estoque Atual: {selectedProduct.estoqueAtual})</p>
              </div>
              <button onClick={() => setShowMovModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMovimentacao} className="p-5 space-y-4">
              {/* Seletor Entrada vs Saída */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  id="mov-type-in"
                  onClick={() => handleTipoMovChange('entrada')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    movTipo === 'entrada' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Entrada (Stock In)</span>
                </button>
                <button
                  type="button"
                  id="mov-type-out"
                  onClick={() => handleTipoMovChange('saida')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    movTipo === 'saida' 
                      ? 'bg-rose-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Saída (Stock Out)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantidade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movQuantidade}
                    onChange={(e) => setMovQuantidade(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-bold"
                  />
                </div>

                {/* Valor Unitário */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={movValorUnitario}
                    onChange={(e) => setMovValorUnitario(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Motivo do Movimento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Motivo do Lançamento *</label>
                  <select
                    value={movMotivo}
                    onChange={(e) => setMovMotivo(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  >
                    {movTipo === 'entrada' ? (
                      <>
                        <option value="Compra">Compra / Reposição</option>
                        <option value="Devolução">Devolução de Cliente</option>
                        <option value="Ajuste">Ajuste de Inventário (+)</option>
                      </>
                    ) : (
                      <>
                        <option value="Venda">Venda / Faturamento</option>
                        <option value="Ajuste">Ajuste / Perda / Descarte (-)</option>
                        <option value="Devolução">Devolução para Fornecedor</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Cliente (para Vendas) */}
                {movTipo === 'saida' && movMotivo === 'Venda' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente Vinculado</label>
                    <select
                      value={movClienteId}
                      onChange={(e) => setMovClienteId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="">Selecione o Cliente...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Fornecedor (para Compras) */}
                {movTipo === 'entrada' && movMotivo === 'Compra' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fornecedor Vinculado</label>
                    <select
                      value={movFornecedorId}
                      onChange={(e) => setMovFornecedorId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    >
                      <option value="">Selecione o Fornecedor...</option>
                      {fornecedores.map(f => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Informativo de Subtotal */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Subtotal da Movimentação:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(movQuantidade * movValorUnitario)}
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMovModal(false);
                    setSelectedProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs ${
                    movTipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
