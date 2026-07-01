import { useState, useMemo } from 'react';
import { Movimentacao, Produto, Cliente, Fornecedor } from '../types';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Filter, 
  Search, 
  Layers, 
  User, 
  Truck, 
  Tag, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Undo2
} from 'lucide-react';

interface MovementsProps {
  movimentacoes: Movimentacao[];
  produtos: Produto[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  onEstornarMovimentacao: (id: string) => void;
  categorias: string[];
}

export default function Movements({
  movimentacoes,
  produtos,
  clientes,
  fornecedores,
  onEstornarMovimentacao,
  categorias
}: MovementsProps) {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [motivoFiltro, setMotivoFiltro] = useState<string>('');
  const [produtoFiltro, setProdutoFiltro] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [periodoFiltro, setPeriodoFiltro] = useState<'7d' | '30d' | '90d' | 'tudo'>('tudo');

  // Formatar Moeda (BRL)
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Formatar Data ISO para Legível
  const formatData = (isoString: string) => {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar de forma robusta e intuitiva (Filtros Requisito 8)
  const movimentacoesFiltradas = useMemo(() => {
    return [...movimentacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()) // Mais recentes primeiro
      .filter(mov => {
        const prod = produtos.find(p => p.id === mov.produtoId);
        if (!prod) return false;

        // 1. Busca por nome do produto ou SKU
        const bateBusca = prod.nome.toLowerCase().includes(busca.toLowerCase()) || prod.sku.toLowerCase().includes(busca.toLowerCase());
        if (!bateBusca) return false;

        // 2. Tipo de Movimento (entrada / saida)
        if (tipoFiltro !== 'todos' && mov.tipo !== tipoFiltro) return false;

        // 3. Motivo específico
        if (motivoFiltro && mov.motivo !== motivoFiltro) return false;

        // 4. Produto específico
        if (produtoFiltro && mov.produtoId !== produtoFiltro) return false;

        // 5. Categoria específica
        if (categoriaFiltro && prod.categoria !== categoriaFiltro) return false;

        // 6. Período selecionado
        const dataMov = new Date(mov.data);
        const dataReferencia = new Date('2026-07-01T12:00:00Z'); // Data base de simulação

        if (periodoFiltro === '7d') {
          const limite = new Date(dataReferencia);
          limite.setDate(limite.getDate() - 7);
          if (dataMov < limite) return false;
        } else if (periodoFiltro === '30d') {
          const limite = new Date(dataReferencia);
          limite.setDate(limite.getDate() - 30);
          if (dataMov < limite) return false;
        } else if (periodoFiltro === '90d') {
          const limite = new Date(dataReferencia);
          limite.setDate(limite.getDate() - 90);
          if (dataMov < limite) return false;
        }

        return true;
      });
  }, [movimentacoes, produtos, busca, tipoFiltro, motivoFiltro, produtoFiltro, categoriaFiltro, periodoFiltro]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Histórico de Movimentações</h2>
          <p className="text-xs text-slate-500">Audite e analise todo o fluxo de entrada e saída de produtos</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
          <Clock className="h-6 w-6" />
        </div>
      </div>

      {/* Seção Multifiltros (Filtro Requisito 8) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Filter className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-700">Filtros Rápidos e Avançados</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca por texto */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <input
              id="history-search"
              type="text"
              placeholder="Produto ou SKU..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Tipo de Movimento */}
          <div>
            <select
              id="history-filter-type"
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="entrada">Apenas Entradas (+)</option>
              <option value="saida">Apenas Saídas (-)</option>
            </select>
          </div>

          {/* Motivo do Movimento */}
          <div>
            <select
              id="history-filter-motif"
              value={motivoFiltro}
              onChange={(e) => setMotivoFiltro(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-indigo-500"
            >
              <option value="">Todos os Motivos</option>
              <option value="Compra">Compra / Reposição</option>
              <option value="Venda">Venda / Faturamento</option>
              <option value="Devolução">Devolução</option>
              <option value="Ajuste">Ajuste de Inventário</option>
            </select>
          </div>

          {/* Filtro por Categoria */}
          <div>
            <select
              id="history-filter-category"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-indigo-500"
            >
              <option value="">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Período */}
          <div>
            <select
              id="history-filter-period"
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-indigo-500"
            >
              <option value="tudo">Qualquer Período</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* Botão de Limpeza rápida */}
        {(busca !== '' || tipoFiltro !== 'todos' || motivoFiltro !== '' || categoriaFiltro !== '' || periodoFiltro !== 'tudo') && (
          <div className="flex justify-end pt-1">
            <button
              id="btn-history-clear-filters"
              onClick={() => {
                setBusca('');
                setTipoFiltro('todos');
                setMotivoFiltro('');
                setProdutoFiltro('');
                setCategoriaFiltro('');
                setPeriodoFiltro('tudo');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Movimentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                <th className="p-4">Data e Hora</th>
                <th className="p-4">Operação</th>
                <th className="p-4">Produto</th>
                <th className="p-4">Motivo</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4 text-right">Valor Unitário</th>
                <th className="p-4 text-right">Valor Total</th>
                <th className="p-4">Vínculo (Cliente/Fornecedor)</th>
                <th className="p-4 text-right">Estorno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {movimentacoesFiltradas.length > 0 ? (
                movimentacoesFiltradas.map(mov => {
                  const prod = produtos.find(p => p.id === mov.produtoId);
                  
                  // Identificar vínculo
                  let vinculoNome = '-';
                  let vinculoIcon = null;

                  if (mov.tipo === 'saida' && mov.clienteId) {
                    const cli = clientes.find(c => c.id === mov.clienteId);
                    vinculoNome = cli ? cli.nome : 'Cliente Desconhecido';
                    vinculoIcon = <User className="h-3.5 w-3.5 text-indigo-400 mr-1.5 shrink-0" />;
                  } else if (mov.tipo === 'entrada' && mov.fornecedorId) {
                    const forn = fornecedores.find(f => f.id === mov.fornecedorId);
                    vinculoNome = forn ? forn.nome : 'Fornecedor Desconhecido';
                    vinculoIcon = <Truck className="h-3.5 w-3.5 text-emerald-400 mr-1.5 shrink-0" />;
                  }

                  const total = mov.quantidade * mov.valorUnitario;

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Data */}
                      <td className="p-4 text-slate-500 whitespace-nowrap">
                        {formatData(mov.data)}
                      </td>
                      {/* Operação */}
                      <td className="p-4">
                        {mov.tipo === 'entrada' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <ArrowDownLeft className="h-3 w-3 mr-1" />
                            Entrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            Saída
                          </span>
                        )}
                      </td>
                      {/* Produto */}
                      <td className="p-4 font-semibold text-slate-800">
                        <div>
                          <span>{prod ? prod.nome : 'Produto Removido'}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">SKU: {prod ? prod.sku : '-'}</span>
                        </div>
                      </td>
                      {/* Motivo */}
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          mov.motivo === 'Venda' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          mov.motivo === 'Compra' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          mov.motivo === 'Devolução' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {mov.motivo}
                        </span>
                      </td>
                      {/* Quantidade */}
                      <td className="p-4 text-center font-bold">
                        {mov.quantidade}
                      </td>
                      {/* Valor Unitário */}
                      <td className="p-4 text-right font-medium text-slate-500">
                        {formatBRL(mov.valorUnitario)}
                      </td>
                      {/* Valor Total */}
                      <td className="p-4 text-right font-bold text-slate-800">
                        {formatBRL(total)}
                      </td>
                      {/* Vínculo */}
                      <td className="p-4">
                        <div className="flex items-center text-slate-600 max-w-[180px] truncate">
                          {vinculoIcon}
                          <span className="truncate" title={vinculoNome}>{vinculoNome}</span>
                        </div>
                      </td>
                      {/* Reverter / Estornar */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Deseja estornar esta movimentação? Isso reverterá o saldo de estoque correspondente.')) {
                              onEstornarMovimentacao(mov.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex"
                          title="Estornar movimentação"
                        >
                          <Undo2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Nenhuma movimentação encontrada com os filtros configurados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
