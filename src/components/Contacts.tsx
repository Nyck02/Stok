import { useState, useMemo, FormEvent } from 'react';
import { Cliente, Fornecedor, Movimentacao } from '../types';
import { 
  Users, 
  Truck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Trash2, 
  Edit3, 
  X,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';

interface ContactsProps {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  movimentacoes: Movimentacao[];
  onAdicionarCliente: (c: Omit<Cliente, 'id'>) => void;
  onEditarCliente: (id: string, c: Partial<Cliente>) => void;
  onExcluirCliente: (id: string) => void;
  onAdicionarFornecedor: (f: Omit<Fornecedor, 'id'>) => void;
  onEditarFornecedor: (id: string, f: Partial<Fornecedor>) => void;
  onExcluirFornecedor: (id: string) => void;
}

export default function Contacts({
  clientes,
  fornecedores,
  movimentacoes,
  onAdicionarCliente,
  onEditarCliente,
  onExcluirCliente,
  onAdicionarFornecedor,
  onEditarFornecedor,
  onExcluirFornecedor
}: ContactsProps) {
  const [subTab, setSubTab] = useState<'clientes' | 'fornecedores'>('clientes');
  const [busca, setBusca] = useState('');

  // Modais de Cadastro
  const [showCliModal, setShowCliModal] = useState(false);
  const [showForModal, setShowForModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Campos de Formulário Cliente
  const [cliNome, setCliNome] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliTelefone, setCliTelefone] = useState('');
  const [cliDocumento, setCliDocumento] = useState('');
  const [cliCidade, setCliCidade] = useState('');
  const [cliEstado, setCliEstado] = useState('');

  // Campos de Formulário Fornecedor
  const [forNome, setForNome] = useState('');
  const [forContato, setForContato] = useState('');
  const [forEmail, setForEmail] = useState('');
  const [forTelefone, setForTelefone] = useState('');
  const [forDocumento, setForDocumento] = useState('');
  const [forCidade, setForCidade] = useState('');
  const [forEstado, setForEstado] = useState('');

  // Formatar moeda brasileira (BRL)
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular métricas de clientes de forma dinâmica
  const metricasClientes = useMemo(() => {
    const mapa: { [key: string]: { totalVendas: number; totalGasto: number } } = {};
    
    movimentacoes.forEach(mov => {
      if (mov.tipo === 'saida' && mov.motivo === 'Venda' && mov.clienteId) {
        if (!mapa[mov.clienteId]) {
          mapa[mov.clienteId] = { totalVendas: 0, totalGasto: 0 };
        }
        mapa[mov.clienteId].totalVendas += 1;
        mapa[mov.clienteId].totalGasto += mov.quantidade * mov.valorUnitario;
      }
    });

    return mapa;
  }, [movimentacoes]);

  // Calcular compras por fornecedor
  const comprasFornecedores = useMemo(() => {
    const mapa: { [key: string]: { totalCompras: number; totalComprado: number } } = {};

    movimentacoes.forEach(mov => {
      if (mov.tipo === 'entrada' && mov.motivo === 'Compra' && mov.fornecedorId) {
        if (!mapa[mov.fornecedorId]) {
          mapa[mov.fornecedorId] = { totalCompras: 0, totalComprado: 0 };
        }
        mapa[mov.fornecedorId].totalCompras += 1;
        mapa[mov.fornecedorId].totalComprado += mov.quantidade * mov.valorUnitario;
      }
    });

    return mapa;
  }, [movimentacoes]);

  // Filtragem
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(busca.toLowerCase()) || 
      c.documento.includes(busca) || 
      c.email.toLowerCase().includes(busca.toLowerCase())
    );
  }, [clientes, busca]);

  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter(f => 
      f.nome.toLowerCase().includes(busca.toLowerCase()) || 
      f.documento.includes(busca) || 
      f.contato.toLowerCase().includes(busca.toLowerCase())
    );
  }, [fornecedores, busca]);

  // Abertura de Modais para Novo
  const handleOpenNovoCliente = () => {
    setEditMode(false);
    setSelectedId(null);
    setCliNome('');
    setCliEmail('');
    setCliTelefone('');
    setCliDocumento('');
    setCliCidade('');
    setCliEstado('');
    setShowCliModal(true);
  };

  const handleOpenNovoFornecedor = () => {
    setEditMode(false);
    setSelectedId(null);
    setForNome('');
    setForContato('');
    setForEmail('');
    setForTelefone('');
    setForDocumento('');
    setForCidade('');
    setForEstado('');
    setShowForModal(true);
  };

  // Abertura para Edição
  const handleOpenEditCliente = (c: Cliente) => {
    setEditMode(true);
    setSelectedId(c.id);
    setCliNome(c.nome);
    setCliEmail(c.email);
    setCliTelefone(c.telefone);
    setCliDocumento(c.documento);
    setCliCidade(c.cidade);
    setCliEstado(c.estado);
    setShowCliModal(true);
  };

  const handleOpenEditFornecedor = (f: Fornecedor) => {
    setEditMode(true);
    setSelectedId(f.id);
    setForNome(f.nome);
    setForContato(f.contato);
    setForEmail(f.email);
    setForTelefone(f.telefone);
    setForDocumento(f.documento);
    setForCidade(f.cidade);
    setForEstado(f.estado);
    setShowForModal(true);
  };

  // Salvar Clientes
  const handleSaveCliente = (e: FormEvent) => {
    e.preventDefault();
    if (!cliNome || !cliDocumento) {
      alert('Nome e Documento (CPF/CNPJ) são campos obrigatórios.');
      return;
    }

    const payload = {
      nome: cliNome,
      email: cliEmail,
      telefone: cliTelefone,
      documento: cliDocumento,
      cidade: cliCidade,
      estado: cliEstado
    };

    if (editMode && selectedId) {
      onEditarCliente(selectedId, payload);
    } else {
      onAdicionarCliente(payload);
    }

    setShowCliModal(false);
  };

  // Salvar Fornecedores
  const handleSaveFornecedor = (e: FormEvent) => {
    e.preventDefault();
    if (!forNome || !forDocumento) {
      alert('Nome e Documento (CNPJ) são obrigatórios.');
      return;
    }

    const payload = {
      nome: forNome,
      contato: forContato,
      email: forEmail,
      telefone: forTelefone,
      documento: forDocumento,
      cidade: forCidade,
      estado: forEstado
    };

    if (editMode && selectedId) {
      onEditarFornecedor(selectedId, payload);
    } else {
      onAdicionarFornecedor(payload);
    }

    setShowForModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Menu Superior - Seleção de Clientes ou Fornecedores */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            id="tab-sub-clients"
            onClick={() => {
              setSubTab('clientes');
              setBusca('');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              subTab === 'clientes' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clientes</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {clientes.length}
            </span>
          </button>
          <button
            id="tab-sub-suppliers"
            onClick={() => {
              setSubTab('fornecedores');
              setBusca('');
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${
              subTab === 'fornecedores' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Fornecedores</span>
            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {fornecedores.length}
            </span>
          </button>
        </div>

        <div>
          {subTab === 'clientes' ? (
            <button
              id="btn-add-client"
              onClick={handleOpenNovoCliente}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Cliente</span>
            </button>
          ) : (
            <button
              id="btn-add-supplier"
              onClick={handleOpenNovoFornecedor}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Fornecedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Caixa de Pesquisa */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            id="search-contacts"
            type="text"
            placeholder={subTab === 'clientes' ? "Buscar clientes por nome, e-mail ou CPF/CNPJ..." : "Buscar fornecedores por empresa, CNPJ ou contato..."}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Exibição em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subTab === 'clientes' ? (
          clientesFiltrados.length > 0 ? (
            clientesFiltrados.map(cli => {
              const info = metricasClientes[cli.id] || { totalVendas: 0, totalGasto: 0 };
              return (
                <div key={cli.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col justify-between">
                  {/* Cabeçalho */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                        {cli.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditCliente(cli)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar cadastro"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o cliente "${cli.nome}"?`)) {
                              onExcluirCliente(cli.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir cadastro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xs font-bold text-slate-800 mt-3 line-clamp-1">{cli.nome}</h3>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">{cli.documento}</span>
                  </div>

                  {/* Informações de Contato */}
                  <div className="p-5 space-y-2 text-slate-600 border-b border-slate-50 flex-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate">{cli.email || 'Sem email cadastrado'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-mono">{cli.telefone || 'Sem telefone'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate">{cli.cidade} - {cli.estado}</span>
                    </div>
                  </div>

                  {/* Pé de Card: Estatísticas Operacionais */}
                  <div className="bg-slate-50 p-4 flex items-center justify-between text-xs border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pedidos</span>
                      <span className="font-bold text-slate-700 flex items-center mt-0.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                        {info.totalVendas} compras
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Gasto</span>
                      <span className="font-bold text-indigo-600 block mt-0.5">
                        {formatBRL(info.totalGasto)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200 shadow-sm">
              Nenhum cliente cadastrado ou encontrado.
            </div>
          )
        ) : (
          fornecedoresFiltrados.length > 0 ? (
            fornecedoresFiltrados.map(f => {
              const compraInfo = comprasFornecedores[f.id] || { totalCompras: 0, totalComprado: 0 };
              return (
                <div key={f.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col justify-between">
                  {/* Cabeçalho */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleOpenEditFornecedor(f)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar cadastro"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir o fornecedor "${f.nome}"?`)) {
                              onExcluirFornecedor(f.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir cadastro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xs font-bold text-slate-800 mt-3 line-clamp-1">{f.nome}</h3>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">CNPJ: {f.documento}</span>
                  </div>

                  {/* Informações de Contato */}
                  <div className="p-5 space-y-2 text-slate-600 border-b border-slate-50 flex-1">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-700">Contato: {f.contato}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate">{f.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-mono">{f.telefone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate">{f.cidade} - {f.estado}</span>
                    </div>
                  </div>

                  {/* Pé de Card: Estatísticas Operacionais */}
                  <div className="bg-slate-50 p-4 flex items-center justify-between text-xs border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Fornecimentos</span>
                      <span className="font-bold text-slate-700 flex items-center mt-0.5">
                        <TrendingUp className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                        {compraInfo.totalCompras} remessas
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Comprado</span>
                      <span className="font-bold text-emerald-600 block mt-0.5">
                        {formatBRL(compraInfo.totalComprado)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200 shadow-sm">
              Nenhum fornecedor cadastrado ou encontrado.
            </div>
          )
        )}
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO CLIENTE */}
      {showCliModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editMode ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
              <button onClick={() => setShowCliModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCliente} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={cliNome}
                  onChange={(e) => setCliNome(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  placeholder="Ex: Carlos Eduardo Souza"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Documento (CPF ou CNPJ) *</label>
                <input
                  type="text"
                  required
                  value={cliDocumento}
                  onChange={(e) => setCliDocumento(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-mono"
                  placeholder="Ex: 123.456.789-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={cliEmail}
                    onChange={(e) => setCliEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="carlos@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={cliTelefone}
                    onChange={(e) => setCliTelefone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-mono"
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cliCidade}
                    onChange={(e) => setCliCidade(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={cliEstado}
                    onChange={(e) => setCliEstado(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 text-center font-mono"
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCliModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editMode ? 'Salvar Cliente' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO / EDIÇÃO FORNECEDOR */}
      {showForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editMode ? 'Editar Fornecedor' : 'Cadastrar Fornecedor'}</h3>
              <button onClick={() => setShowForModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFornecedor} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Razão Social / Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={forNome}
                  onChange={(e) => setForNome(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                  placeholder="Ex: Distribuidora Tech Brasil Ltda"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome de Contato</label>
                  <input
                    type="text"
                    value={forContato}
                    onChange={(e) => setForContato(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="Ex: Roberto Alencar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">CNPJ do Fornecedor *</label>
                  <input
                    type="text"
                    required
                    value={forDocumento}
                    onChange={(e) => setForDocumento(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-mono"
                    placeholder="Ex: 12.345.678/0001-90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    value={forEmail}
                    onChange={(e) => setForEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="comercial@tech.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={forTelefone}
                    onChange={(e) => setForTelefone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 font-mono"
                    placeholder="(11) 3344-5566"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={forCidade}
                    onChange={(e) => setForCidade(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={forEstado}
                    onChange={(e) => setForEstado(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 text-center font-mono"
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editMode ? 'Salvar Fornecedor' : 'Cadastrar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
