import { dataValida, mesDe } from './datas';
import { parseValorEmCentavos, VALOR_MAXIMO } from './dinheiro';

export const TIPOS = ['receita', 'despesa'] as const;
export type Tipo = (typeof TIPOS)[number];

export const CATEGORIAS: Record<Tipo, readonly string[]> = {
  despesa: ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros'],
  receita: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
};

export const LIMITE_DESCRICAO = 60;

export interface Transacao {
  id: string;
  descricao: string;
  valorCentavos: number;
  tipo: Tipo;
  categoria: string;
  data: string; // AAAA-MM-DD
  criadoEm: number;
}

/** Dados como vêm do formulário: valor ainda é o texto digitado. */
export interface DadosTransacao {
  descricao: string;
  valor: string;
  tipo: Tipo;
  categoria: string;
  data: string; // AAAA-MM-DD
}

export function gerarId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Valida os dados do formulário e devolve um lançamento pronto para guardar.
 * `opcoes` existe só para os testes poderem fixar o id e o horário.
 */
export function criarTransacao(
  dados: DadosTransacao,
  { id = gerarId(), agora = Date.now() }: { id?: string; agora?: number } = {},
): Transacao {
  const descricao = dados.descricao.trim();
  if (!descricao) throw new Error('Informe uma descrição.');
  if (descricao.length > LIMITE_DESCRICAO) {
    throw new Error(`A descrição pode ter até ${LIMITE_DESCRICAO} caracteres.`);
  }
  if (!TIPOS.includes(dados.tipo)) throw new Error('Escolha receita ou despesa.');
  if (!CATEGORIAS[dados.tipo].includes(dados.categoria)) throw new Error('Escolha uma categoria válida.');
  if (!dataValida(dados.data)) throw new Error('Informe uma data válida.');

  const valorCentavos = parseValorEmCentavos(dados.valor);
  if (valorCentavos <= 0) throw new Error('O valor deve ser maior que zero.');
  if (valorCentavos > VALOR_MAXIMO) throw new Error('Esse valor é alto demais.');

  return { id, descricao, valorCentavos, tipo: dados.tipo, categoria: dados.categoria, data: dados.data, criadoEm: agora };
}

/** Confere se um objeto lido do armazenamento tem o formato esperado. */
export function ehTransacaoValida(t: unknown): t is Transacao {
  if (typeof t !== 'object' || t === null) return false;
  const x = t as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.descricao === 'string' &&
    x.descricao.trim() !== '' &&
    typeof x.valorCentavos === 'number' &&
    Number.isSafeInteger(x.valorCentavos) &&
    x.valorCentavos > 0 &&
    (TIPOS as readonly unknown[]).includes(x.tipo) &&
    CATEGORIAS[x.tipo as Tipo].includes(x.categoria as string) &&
    dataValida(x.data)
  );
}

// ---------- Consultas ----------

export function filtrarPorMes(transacoes: Transacao[], mes: string): Transacao[] {
  return transacoes.filter((t) => mesDe(t.data) === mes);
}

// Remove acentos e maiúsculas para a busca achar "cafe" em "Café".
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface Filtros {
  tipo: 'todos' | Tipo;
  busca: string;
}

export function filtrar(transacoes: Transacao[], { tipo, busca }: Filtros): Transacao[] {
  const termo = normalizar(busca.trim());
  return transacoes.filter(
    (t) => (tipo === 'todos' || t.tipo === tipo) && (termo === '' || normalizar(t.descricao).includes(termo)),
  );
}

/** Mais recentes primeiro; na mesma data, o último adicionado aparece antes. */
export function ordenar(transacoes: Transacao[]): Transacao[] {
  return [...transacoes].sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm - a.criadoEm);
}
