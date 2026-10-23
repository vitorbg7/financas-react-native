import { centavosParaTexto } from './dinheiro';
import { ordenar, type Transacao } from './transacoes';

export interface Resumo {
  receitas: number;
  despesas: number;
  saldo: number;
}

export function resumo(transacoes: Transacao[]): Resumo {
  let receitas = 0;
  let despesas = 0;
  for (const t of transacoes) {
    if (t.tipo === 'receita') receitas += t.valorCentavos;
    else despesas += t.valorCentavos;
  }
  return { receitas, despesas, saldo: receitas - despesas };
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
  percentual: number; // uma casa decimal
}

/** Despesas somadas por categoria, da maior para a menor. */
export function gastosPorCategoria(transacoes: Transacao[]): GastoPorCategoria[] {
  const totais = new Map<string, number>();
  let totalGeral = 0;
  for (const t of transacoes) {
    if (t.tipo !== 'despesa') continue;
    totais.set(t.categoria, (totais.get(t.categoria) ?? 0) + t.valorCentavos);
    totalGeral += t.valorCentavos;
  }
  return [...totais.entries()]
    .map(([categoria, total]) => ({ categoria, total, percentual: Math.round((total / totalGeral) * 1000) / 10 }))
    .sort((a, b) => b.total - a.total);
}

export interface ProgressoLimite {
  percentual: number;
  restante: number;
  estourou: boolean;
}

/** Quanto do limite mensal de gastos já foi usado. Devolve null se não há limite definido. */
export function progressoLimite(gastoCentavos: number, limiteCentavos: number): ProgressoLimite | null {
  if (!(limiteCentavos > 0)) return null;
  return {
    percentual: Math.round((gastoCentavos / limiteCentavos) * 100),
    restante: limiteCentavos - gastoCentavos,
    estourou: gastoCentavos > limiteCentavos,
  };
}

// ---------- Exportação ----------

// Células que começam com = + - @ podem virar fórmulas no Excel (CSV injection).
// O apóstrofo força o Excel a tratar como texto.
function campoCSV(valor: string): string {
  let texto = valor;
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  if (/[;"\n\r]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

/** CSV com ponto e vírgula (padrão do Excel em português). */
export function paraCSV(transacoes: Transacao[]): string {
  const linhas = [['data', 'descricao', 'tipo', 'categoria', 'valor'].join(';')];
  for (const t of ordenar(transacoes)) {
    linhas.push(
      [t.data, t.descricao, t.tipo, t.categoria, centavosParaTexto(t.valorCentavos)].map(campoCSV).join(';'),
    );
  }
  return linhas.join('\r\n');
}
