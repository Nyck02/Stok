import { useState, useMemo } from 'react';
import { Produto, Movimentacao, Cliente, PeriodoFiltro } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  ShoppingBag, 
  Users, 
  Calendar,
  Layers,
  Award,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  produtos: Produto[];
  movimentacoes: Movimentacao[];
  clientes: Cliente[];
  filtroPeriodo: PeriodoFiltro;
  setFiltroPeriodo: (p: PeriodoFiltro) => void;
  filtroCategoria: string;
  setFiltroCategoria: (c: string) => void;
  filtroProduto: string;
  setFiltroProduto: (p: string) => void;
  categorias: string[];
}

export default function Dashboard({
  produtos,
  movimentacoes,
  clientes,
  filtroPeriodo,
  setFiltroPeriodo,
  filtroCategoria,
  setFiltroCategoria,
  filtroProduto,
  setFiltroProduto,
  categorias
}: DashboardProps) {
  // Filtros customizados de data (se filtroPeriodo === 'custom')
  const [dataInicio, setDataInicio] = useState('2026-04-01');
  const [dataFim, setDataFim] = useState('2026-07-01');

  // Formatar moeda brasileira (BRL)
  const formatBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar as movimentações com base no período, produto e categoria selecionados
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter(mov => {
      // 1. Filtrar por Produto
      if (filtroProduto && mov.produtoId !== filtroProduto) return false;

      // Encontrar produto correspondente para ver categoria
      const prod = produtos.find(p => p.id === mov.produtoId);
      if (!prod) return false;

      // 2. Filtrar por Categoria
      if (filtroCategoria && prod.categoria !== filtroCategoria) return false;

      // 3. Filtrar por Período
      const dataMov = new Date(mov.data);
      const dataReferencia = new Date('2026-07-01T12:00:00Z'); // Usar a data do sistema como referência

      if (filtroPeriodo === '7d') {
        const limite = new Date(dataReferencia);
        limite.setDate(limite.getDate() - 7);
        if (dataMov < limite) return false;
      } else if (filtroPeriodo === '30d') {
        const limite = new Date(dataReferencia);
        limite.setDate(limite.getDate() - 30);
        if (dataMov < limite) return false;
      } else if (filtroPeriodo === '90d') {
        const limite = new Date(dataReferencia);
        limite.setDate(limite.getDate() - 90);
        if (dataMov < limite) return false;
      } else if (filtroPeriodo === 'custom') {
        const inicio = new Date(dataInicio + 'T00:00:00Z');
        const fim = new Date(dataFim + 'T23:59:59Z');
        if (dataMov < inicio || dataMov > fim) return false;
      }

      return true;
    });
  }, [movimentacoes, produtos, filtroPeriodo, filtroCategoria, filtroProduto, dataInicio, dataFim]);

  // Alertas de estoque mínimo (isto não depende do período das movimentações, é o estado atual)
  const produtosAbaixoMinimo = useMemo(() => {
    return produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo);
  }, [produtos]);

  // Estatísticas Financeiras
  const financeiro = useMemo(() => {
    let receita = 0;
    let despesas = 0;
    let custoMercadoriaVendida = 0;

    movimentacoesFiltradas.forEach(mov => {
      const prod = produtos.find(p => p.id === mov.produtoId);
      
      if (mov.tipo === 'saida') {
        if (mov.motivo === 'Venda') {
          receita += mov.quantidade * mov.valorUnitario;
          // Se soubermos o preço de compra do produto, calculamos o custo da mercadoria vendida
          if (prod) {
            custoMercadoriaVendida += mov.quantidade * prod.precoCompra;
          }
        } else if (mov.motivo === 'Ajuste') {
          // Ajustes de saída contam como perda/despesa
          despesas += mov.quantidade * mov.valorUnitario;
        }
      } else if (mov.tipo === 'entrada') {
        if (mov.motivo === 'Compra') {
          despesas += mov.quantidade * mov.valorUnitario;
        } else if (mov.motivo === 'Devolução') {
          // Devolução para estoque pode abater da receita ou ser uma entrada neutra
          // Vamos considerar um estorno de venda se necessário, mas aqui vamos manter simples
        }
      }
    });

    // Lucro Operacional Simples = Receita de Vendas - Despesas de Compra/Ajustes
    // Mas comercialmente, o Lucro Bruto Real das vendas é: Receita - Custo das Mercadorias Vendidas (CMV)
    // Mostraremos as duas visões de forma clara!
    const lucroBruto = receita - custoMercadoriaVendida;
    const saldoEstoque = receita - despesas; // Fluxo de Caixa imediato

    return {
      receita,
      despesas,
      lucroBruto,
      saldoEstoque,
      custoMercadoriaVendida
    };
  }, [movimentacoesFiltradas, produtos]);

  // Ranking de Clientes com mais pedidos (Filtro 4)
  const clientesMaisPedidos = useMemo(() => {
    const pedidosPorCliente: { [key: string]: { totalVendas: number; totalGasto: number } } = {};
    
    movimentacoesFiltradas.forEach(mov => {
      if (mov.tipo === 'saida' && mov.motivo === 'Venda' && mov.clienteId) {
        if (!pedidosPorCliente[mov.clienteId]) {
          pedidosPorCliente[mov.clienteId] = { totalVendas: 0, totalGasto: 0 };
        }
        pedidosPorCliente[mov.clienteId].totalVendas += 1;
        pedidosPorCliente[mov.clienteId].totalGasto += mov.quantidade * mov.valorUnitario;
      }
    });

    return Object.entries(pedidosPorCliente)
      .map(([id, info]) => {
        const clienteObj = clientes.find(c => c.id === id);
        return {
          id,
          nome: clienteObj ? clienteObj.nome : 'Cliente Desconhecido',
          documento: clienteObj ? clienteObj.documento : '',
          cidade: clienteObj ? `${clienteObj.cidade} - ${clienteObj.estado}` : '',
          pedidos: info.totalVendas,
          totalGasto: info.totalGasto
        };
      })
      .sort((a, b) => b.pedidos - a.pedidos || b.totalGasto - a.totalGasto)
      .slice(0, 5); // Top 5
  }, [movimentacoesFiltradas, clientes]);

  // Ranking de Produtos mais vendidos (Filtro 5)
  const itensMaisVendidos = useMemo(() => {
    const vendasPorProduto: { [key: string]: { quantidade: number; receitaGerada: number } } = {};

    movimentacoesFiltradas.forEach(mov => {
      if (mov.tipo === 'saida' && mov.motivo === 'Venda') {
        if (!vendasPorProduto[mov.produtoId]) {
          vendasPorProduto[mov.produtoId] = { quantidade: 0, receitaGerada: 0 };
        }
        vendasPorProduto[mov.produtoId].quantidade += mov.quantidade;
        vendasPorProduto[mov.produtoId].receitaGerada += mov.quantidade * mov.valorUnitario;
      }
    });

    return Object.entries(vendasPorProduto)
      .map(([id, info]) => {
        const prodObj = produtos.find(p => p.id === id);
        return {
          id,
          nome: prodObj ? prodObj.nome : 'Produto Removido',
          sku: prodObj ? prodObj.sku : '',
          categoria: prodObj ? prodObj.categoria : '',
          estoqueAtual: prodObj ? prodObj.estoqueAtual : 0,
          quantidadeVendida: info.quantidade,
          receita: info.receitaGerada
        };
      })
      .sort((a, b) => b.quantidadeVendida - a.quantidadeVendida)
      .slice(0, 5); // Top 5
  }, [movimentacoesFiltradas, produtos]);

  // Dados para Gráficos - Agrupados por Mês para visão histórica ou por Dia
  const dadosGraficoMensal = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosPorMes: { [key: number]: { receita: number; despesa: number; lucro: number } } = {};

    // Inicializar meses com base no período de interesse (Abril a Julho)
    [3, 4, 5, 6].forEach(mesIdx => {
      dadosPorMes[mesIdx] = { receita: 0, despesa: 0, lucro: 0 };
    });

    movimentacoesFiltradas.forEach(mov => {
      const data = new Date(mov.data);
      const mesIdx = data.getMonth(); // 0-11
      
      // Só computamos para meses válidos no nosso escopo de mock ou do ano corrente
      if (dadosPorMes[mesIdx] !== undefined) {
        if (mov.tipo === 'saida') {
          if (mov.motivo === 'Venda') {
            dadosPorMes[mesIdx].receita += mov.quantidade * mov.valorUnitario;
          } else if (mov.motivo === 'Ajuste') {
            dadosPorMes[mesIdx].despesa += mov.quantidade * mov.valorUnitario;
          }
        } else if (mov.tipo === 'entrada') {
          if (mov.motivo === 'Compra') {
            dadosPorMes[mesIdx].despesa += mov.quantidade * mov.valorUnitario;
          }
        }
      }
    });

    return Object.entries(dadosPorMes).map(([mesIdx, valores]) => {
      const index = parseInt(mesIdx, 10);
      const receita = parseFloat(valores.receita.toFixed(2));
      const despesa = parseFloat(valores.despesa.toFixed(2));
      const lucro = parseFloat((receita - despesa).toFixed(2));
      return {
        name: meses[index],
        Receita: receita,
        Despesas: despesa,
        Lucro: lucro
      };
    });
  }, [movimentacoesFiltradas]);

  // Gráfico de Desempenho de Vendas ao longo do tempo (diário ou semanal)
  const dadosVendasAoLongoTempo = useMemo(() => {
    // Agrupar vendas por data (YYYY-MM-DD)
    const vendasPorDia: { [key: string]: number } = {};

    movimentacoesFiltradas.forEach(mov => {
      if (mov.tipo === 'saida' && mov.motivo === 'Venda') {
        const dia = mov.data.substring(0, 10); // Formato YYYY-MM-DD
        const valor = mov.quantidade * mov.valorUnitario;
        vendasPorDia[dia] = (vendasPorDia[dia] || 0) + valor;
      }
    });

    // Ordenar datas
    return Object.entries(vendasPorDia)
      .map(([data, valor]) => {
        // Formatar para exibição: DD/MM
        const partes = data.split('-');
        const dataFormatada = partes.length === 3 ? `${partes[2]}/${partes[1]}` : data;
        return {
          dataOriginal: data,
          name: dataFormatada,
          Vendas: parseFloat(valor.toFixed(2))
        };
      })
      .sort((a, b) => a.dataOriginal.localeCompare(b.dataOriginal));
  }, [movimentacoesFiltradas]);

  // Distribuição de vendas por Categoria (Gráfico de Pizza)
  const dadosVendasPorCategoria = useMemo(() => {
    const categoriasVendas: { [key: string]: number } = {};

    movimentacoesFiltradas.forEach(mov => {
      if (mov.tipo === 'saida' && mov.motivo === 'Venda') {
        const prod = produtos.find(p => p.id === mov.produtoId);
        if (prod) {
          const cat = prod.categoria;
          const valor = mov.quantidade * mov.valorUnitario;
          categoriasVendas[cat] = (categoriasVendas[cat] || 0) + valor;
        }
      }
    });

    const CORES = ['#9e8b75', '#56645e', '#8c7a68', '#6b7d75', '#bda893', '#414f48'];

    return Object.entries(categoriasVendas).map(([name, value], idx) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: CORES[idx % CORES.length]
    })).sort((a, b) => b.value - a.value);
  }, [movimentacoesFiltradas, produtos]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Rápidos (Requisito 8) */}
      <div id="filter-bar" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-slate-700">
          <Calendar className="h-5 w-5 text-stok-gold" />
          <span className="font-semibold text-sm">Filtros de Relatório:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Período */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              id="filter-period-7d"
              onClick={() => setFiltroPeriodo('7d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filtroPeriodo === '7d' 
                  ? 'bg-stok-dark text-stok-gold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Dias
            </button>
            <button
              id="filter-period-30d"
              onClick={() => setFiltroPeriodo('30d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filtroPeriodo === '30d' 
                  ? 'bg-stok-dark text-stok-gold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Dias
            </button>
            <button
              id="filter-period-90d"
              onClick={() => setFiltroPeriodo('90d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filtroPeriodo === '90d' 
                  ? 'bg-stok-dark text-stok-gold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90 Dias
            </button>
            <button
              id="filter-period-tudo"
              onClick={() => setFiltroPeriodo('tudo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filtroPeriodo === 'tudo' 
                  ? 'bg-stok-dark text-stok-gold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tudo
            </button>
            <button
              id="filter-period-custom"
              onClick={() => setFiltroPeriodo('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filtroPeriodo === 'custom' 
                  ? 'bg-stok-dark text-stok-gold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personalizado
            </button>
          </div>

          {/* Categoria */}
          <div className="flex items-center space-x-1">
            <Layers className="h-4 w-4 text-slate-400" />
            <select
              id="filter-category"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 focus:ring-stok-gold focus:border-stok-gold"
            >
              <option value="">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Produto */}
          <div className="flex items-center space-x-1">
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            <select
              id="filter-product"
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2 max-w-[200px] focus:ring-stok-gold focus:border-stok-gold"
            >
              <option value="">Todos Produtos</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* Botão de Limpar */}
          {(filtroPeriodo !== '30d' || filtroCategoria !== '' || filtroProduto !== '') && (
            <button
              id="btn-clear-filters"
              onClick={() => {
                setFiltroPeriodo('30d');
                setFiltroCategoria('');
                setFiltroProduto('');
              }}
              className="text-xs text-stok-gold hover:text-stok-gold-hover font-bold"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Datas Customizadas (se selecionado) */}
      {filtroPeriodo === 'custom' && (
        <div id="custom-date-selectors" className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">De:</span>
            <input
              id="input-date-start"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-medium">Até:</span>
            <input
              id="input-date-end"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
            />
          </div>
        </div>
      )}

      {/* Alertas Automáticos de Nível Mínimo (Requisito 2) */}
      {produtosAbaixoMinimo.length > 0 && (
        <div id="low-stock-alert-banner" className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 shadow-sm relative overflow-hidden">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">Alertas de Nível de Estoque</h4>
            <p className="text-xs text-amber-800 mt-1">
              Existem <strong>{produtosAbaixoMinimo.length}</strong> itens abaixo ou igual ao nível de estoque mínimo configurado. É recomendável realizar pedidos de reposição com os fornecedores.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {produtosAbaixoMinimo.slice(0, 4).map(p => (
                <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/50 shadow-2xs">
                  {p.nome}: {p.estoqueAtual} / min {p.estoqueMinimo}
                </span>
              ))}
              {produtosAbaixoMinimo.length > 4 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/50 shadow-2xs">
                  + {produtosAbaixoMinimo.length - 4} outros
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards (Requisito 6 - Receita, Lucro, Despesas) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Receita */}
        <div id="kpi-receita" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Receita Total</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{formatBRL(financeiro.receita)}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Faturamento Bruto
            </span>
          </div>
          <div className="bg-stok-gold-light p-3 rounded-xl text-stok-gold">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Despesas */}
        <div id="kpi-despesas" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Despesas</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{formatBRL(financeiro.despesas)}</span>
            <span className="text-xs text-rose-600 font-semibold flex items-center mt-1">
              <TrendingDown className="h-3.5 w-3.5 mr-1" />
              Compras + Ajustes
            </span>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl text-rose-600">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

        {/* Lucro Bruto Comercial */}
        <div id="kpi-lucro" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Lucro Real (Vendas)</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{formatBRL(financeiro.lucroBruto)}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Margem Comercial
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Saldo Operacional (Fluxo) */}
        <div id="kpi-saldo" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Saldo do Fluxo</span>
            <span className={`text-2xl font-bold mt-1 block ${financeiro.saldoEstoque >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {formatBRL(financeiro.saldoEstoque)}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              Receita menos Compras
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl text-slate-600">
            <Layers className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Gráficos Financeiros (Requisito 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Visão Geral Financeira (Receita vs Despesas vs Lucro) */}
        <div id="chart-financial-overview" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Visão Geral Financeira por Mês</h3>
              <p className="text-xs text-slate-500">Comparação histórica de faturamento e despesas</p>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosGraficoMensal}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tickFormatter={(val) => `R$${val}`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatBRL(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Receita" fill="#9e8b75" radius={[4, 4, 0, 0]} name="Receita" />
                <Bar dataKey="Despesas" fill="#c85a53" radius={[4, 4, 0, 0]} name="Despesas" />
                <Bar dataKey="Lucro" fill="#56645e" radius={[4, 4, 0, 0]} name="Lucro Líquido" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Desempenho de Vendas ao longo do Tempo */}
        <div id="chart-sales-performance" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Desempenho de Vendas ao Longo do Tempo</h3>
              <p className="text-xs text-slate-500">Volume diário de faturamento em vendas</p>
            </div>
            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="h-72">
            {dadosVendasAoLongoTempo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosVendasAoLongoTempo}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                     <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#9e8b75" stopOpacity={0.15}/>
                       <stop offset="95%" stopColor="#9e8b75" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis tickFormatter={(val) => `R$${val}`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [formatBRL(Number(value)), 'Vendas']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="Vendas" stroke="#9e8b75" strokeWidth={2} fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Nenhuma venda registrada no período selecionado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rankings: Clientes que mais Pediram & Itens Mais Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisito 4: Clientes com mais Pedidos */}
        <div id="ranking-top-clients" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Clientes com Mais Pedidos</h3>
                <p className="text-xs text-slate-500">Ranking baseado na quantidade de compras</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-1 rounded">
              TOP 5 Clientes
            </span>
          </div>

          {clientesMaisPedidos.length > 0 ? (
            <div className="space-y-3">
              {clientesMaisPedidos.map((cli, index) => (
                <div key={cli.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-100 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{cli.nome}</h4>
                      <div className="flex space-x-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-mono">{cli.documento}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">{cli.cidade}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">{cli.pedidos} pedidos</span>
                    <span className="text-[10px] text-stok-gold font-bold block">Total: {formatBRL(cli.totalGasto)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum pedido de cliente registrado com os filtros atuais.
            </div>
          )}
        </div>

        {/* Requisito 5: Itens Mais Vendidos */}
        <div id="ranking-best-sellers" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-stok-gold" />
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Itens Mais Vendidos</h3>
                <p className="text-xs text-slate-500">Ranking baseado em unidades comercializadas</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-stok-gold-light text-stok-gold px-2 py-1 rounded">
              TOP 5 Itens
            </span>
          </div>

          {itensMaisVendidos.length > 0 ? (
            <div className="space-y-3">
              {itensMaisVendidos.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-stok-gold-light text-stok-gold border border-stok-gold/20' :
                      index === 1 ? 'bg-stok-sage-light text-stok-sage border border-stok-sage/10' :
                      index === 2 ? 'bg-slate-100 text-slate-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">{item.nome}</h4>
                      <div className="flex space-x-2 mt-0.5">
                        <span className="text-[10px] text-stok-gold font-semibold">{item.categoria}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 block">{item.quantidadeVendida} un.</span>
                    <span className="text-[10px] text-[#56645e] font-semibold block">Gerado: {formatBRL(item.receita)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma venda de item registrada com os filtros atuais.
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Distribuição por Categoria */}
      <div id="chart-category-distribution" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Participação das Categorias nas Vendas</h3>
            <p className="text-xs text-slate-500">Divisão de faturamento gerado por cada nicho</p>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        {dadosVendasPorCategoria.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosVendasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dadosVendasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatBRL(Number(value)), 'Vendas']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {dadosVendasPorCategoria.map((item, idx) => {
                const total = dadosVendasPorCategoria.reduce((sum, current) => sum + current.value, 0);
                const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                return (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 mr-2">{formatBRL(item.value)}</span>
                      <span className="text-[10px] text-stok-gold font-bold bg-stok-gold-light px-1.5 py-0.5 rounded">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma venda registrada para categorização.
          </div>
        )}
      </div>
    </div>
  );
}
