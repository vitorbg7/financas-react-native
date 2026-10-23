import { dataBrParaISO, dataValida, deslocarMes, formatarMes, isoParaDataBr, mesAtual } from '../dominio/datas';
import { centavosParaTexto, formatarMoeda, parseValorEmCentavos } from '../dominio/dinheiro';
import { gerarDadosDeExemplo } from '../dominio/exemplo';
import { gastosPorCategoria, paraCSV, progressoLimite, resumo } from '../dominio/relatorios';
import {
  criarTransacao,
  ehTransacaoValida,
  filtrar,
  filtrarPorMes,
  ordenar,
  type DadosTransacao,
  type Transacao,
} from '../dominio/transacoes';

const base: DadosTransacao = {
  descricao: 'Mercado',
  valor: '10,50',
  tipo: 'despesa',
  categoria: 'Alimentação',
  data: '2026-10-05',
};

const t = (id: string, extra: Partial<Transacao> = {}): Transacao => ({
  id,
  descricao: 'Item',
  valorCentavos: 1000,
  tipo: 'despesa',
  categoria: 'Outros',
  data: '2026-10-05',
  criadoEm: 0,
  ...extra,
});

describe('dinheiro', () => {
  it.each([
    ['10', 1000],
    ['10,5', 1050],
    ['1.234,56', 123456],
    ['R$ 7,90', 790],
    ['12.5', 1250],
    ['0,01', 1],
  ])('converte "%s" em %i centavos', (entrada, esperado) => {
    expect(parseValorEmCentavos(entrada)).toBe(esperado);
  });

  it.each(['', '  ', 'abc', '1,234', '-5', '10,5,5', '1,005'])('rejeita "%s"', (entrada) => {
    expect(() => parseValorEmCentavos(entrada)).toThrow();
  });

  it('rejeita valores acima do máximo', () => {
    expect(() => parseValorEmCentavos('1.000.000.001,00')).toThrow('alto demais');
    expect(() => parseValorEmCentavos('9'.repeat(40))).toThrow('alto demais');
  });

  it('formata em reais', () => {
    expect(formatarMoeda(123456)).toBe('R$ 1.234,56');
    expect(formatarMoeda(5)).toBe('R$ 0,05');
    expect(formatarMoeda(100000000)).toBe('R$ 1.000.000,00');
    expect(formatarMoeda(-250)).toBe('-R$ 2,50');
  });

  it('formata sem símbolo para o CSV', () => {
    expect(centavosParaTexto(1290)).toBe('12,90');
    expect(centavosParaTexto(5)).toBe('0,05');
  });
});

describe('datas', () => {
  it('valida datas reais', () => {
    expect(dataValida('2026-02-28')).toBe(true);
    expect(dataValida('2024-02-29')).toBe(true);
    expect(dataValida('2026-02-29')).toBe(false);
    expect(dataValida('2026-13-01')).toBe(false);
    expect(dataValida('23/10/2026')).toBe(false);
    expect(dataValida(20261023)).toBe(false);
  });

  it('converte entre DD/MM/AAAA e AAAA-MM-DD', () => {
    expect(dataBrParaISO('23/10/2026')).toBe('2026-10-23');
    expect(dataBrParaISO('5/3/2026')).toBe('2026-03-05');
    expect(isoParaDataBr('2026-10-23')).toBe('23/10/2026');
    expect(() => dataBrParaISO('31/02/2026')).toThrow('DD/MM/AAAA');
    expect(() => dataBrParaISO('2026-10-23')).toThrow();
  });

  it('desloca meses atravessando o ano', () => {
    expect(deslocarMes('2026-01', -1)).toBe('2025-12');
    expect(deslocarMes('2026-12', 1)).toBe('2027-01');
    expect(deslocarMes('2026-10', -12)).toBe('2025-10');
  });

  it('formata o nome do mês e acha o mês atual', () => {
    expect(formatarMes('2026-03')).toBe('Março de 2026');
    expect(mesAtual(new Date(2026, 9, 23))).toBe('2026-10');
  });
});

describe('criarTransacao', () => {
  it('cria um lançamento válido', () => {
    expect(criarTransacao(base, { id: 'x', agora: 1 })).toEqual({
      id: 'x',
      descricao: 'Mercado',
      valorCentavos: 1050,
      tipo: 'despesa',
      categoria: 'Alimentação',
      data: '2026-10-05',
      criadoEm: 1,
    });
  });

  it('tira espaços da descrição', () => {
    expect(criarTransacao({ ...base, descricao: '  Mercado  ' }).descricao).toBe('Mercado');
  });

  it.each<[string, Partial<DadosTransacao>, string]>([
    ['descrição vazia', { descricao: '   ' }, 'descrição'],
    ['descrição longa', { descricao: 'a'.repeat(61) }, 'até 60'],
    ['categoria de outro tipo', { categoria: 'Salário' }, 'categoria'],
    ['data inexistente', { data: '2026-02-30' }, 'data'],
    ['valor zero', { valor: '0' }, 'maior que zero'],
    ['valor inválido', { valor: 'dez' }, 'inválido'],
  ])('rejeita %s', (_nome, mudanca, trecho) => {
    expect(() => criarTransacao({ ...base, ...mudanca })).toThrow(trecho);
  });
});

describe('ehTransacaoValida', () => {
  it('aceita um lançamento íntegro e recusa lixo', () => {
    expect(ehTransacaoValida(t('a'))).toBe(true);
    expect(ehTransacaoValida(null)).toBe(false);
    expect(ehTransacaoValida('texto')).toBe(false);
    expect(ehTransacaoValida({ ...t('a'), valorCentavos: -1 })).toBe(false);
    expect(ehTransacaoValida({ ...t('a'), valorCentavos: 1.5 })).toBe(false);
    expect(ehTransacaoValida({ ...t('a'), tipo: 'outro' })).toBe(false);
    expect(ehTransacaoValida({ ...t('a'), categoria: 'Salário' })).toBe(false);
    expect(ehTransacaoValida({ ...t('a'), data: '2026-99-99' })).toBe(false);
  });
});

describe('consultas', () => {
  const lista = [
    t('1', { descricao: 'Café da manhã', data: '2026-10-05', criadoEm: 1 }),
    t('2', { descricao: 'Salário', tipo: 'receita', categoria: 'Salário', data: '2026-10-05', criadoEm: 2 }),
    t('3', { descricao: 'Cinema', data: '2026-09-20', criadoEm: 3 }),
  ];

  it('filtra por mês', () => {
    expect(filtrarPorMes(lista, '2026-10').map((x) => x.id)).toEqual(['1', '2']);
  });

  it('filtra por tipo e busca ignorando acentos e maiúsculas', () => {
    expect(filtrar(lista, { tipo: 'receita', busca: '' }).map((x) => x.id)).toEqual(['2']);
    expect(filtrar(lista, { tipo: 'todos', busca: 'CAFE' }).map((x) => x.id)).toEqual(['1']);
    expect(filtrar(lista, { tipo: 'todos', busca: 'salario' }).map((x) => x.id)).toEqual(['2']);
  });

  it('ordena do mais recente e desempata pelo último adicionado', () => {
    expect(ordenar(lista).map((x) => x.id)).toEqual(['2', '1', '3']);
  });

  it('não altera a lista original ao ordenar', () => {
    const copia = [...lista];
    ordenar(lista);
    expect(lista).toEqual(copia);
  });
});

describe('relatórios', () => {
  const lista = [
    t('1', { valorCentavos: 30000, categoria: 'Moradia' }),
    t('2', { valorCentavos: 10000, categoria: 'Lazer' }),
    t('3', { valorCentavos: 10000, categoria: 'Moradia' }),
    t('4', { valorCentavos: 100000, tipo: 'receita', categoria: 'Salário' }),
  ];

  it('soma receitas, despesas e saldo', () => {
    expect(resumo(lista)).toEqual({ receitas: 100000, despesas: 50000, saldo: 50000 });
    expect(resumo([])).toEqual({ receitas: 0, despesas: 0, saldo: 0 });
  });

  it('agrupa despesas por categoria, da maior para a menor', () => {
    expect(gastosPorCategoria(lista)).toEqual([
      { categoria: 'Moradia', total: 40000, percentual: 80 },
      { categoria: 'Lazer', total: 10000, percentual: 20 },
    ]);
  });

  it('calcula o progresso do limite', () => {
    expect(progressoLimite(5000, 0)).toBeNull();
    expect(progressoLimite(5000, 10000)).toEqual({ percentual: 50, restante: 5000, estourou: false });
    expect(progressoLimite(12000, 10000)).toEqual({ percentual: 120, restante: -2000, estourou: true });
  });
});

describe('paraCSV', () => {
  it('gera cabeçalho, ordem por data e valores com vírgula', () => {
    const csv = paraCSV([
      t('1', { descricao: 'Antigo', data: '2026-09-01', valorCentavos: 1290 }),
      t('2', { descricao: 'Novo', data: '2026-10-01', valorCentavos: 500 }),
    ]);
    expect(csv.split('\r\n')).toEqual([
      'data;descricao;tipo;categoria;valor',
      '2026-10-01;Novo;despesa;Outros;5,00',
      '2026-09-01;Antigo;despesa;Outros;12,90',
    ]);
  });

  it('protege contra fórmulas e escapa aspas e ponto e vírgula', () => {
    const csv = paraCSV([t('1', { descricao: '=HYPERLINK("x")' }), t('2', { descricao: 'a;b', criadoEm: 5 })]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain('"a;b"');
  });
});

describe('dados de exemplo', () => {
  it('gera lançamentos válidos, sem datas no futuro', () => {
    const hoje = new Date(2026, 9, 3); // dia 3 de outubro
    const dados = gerarDadosDeExemplo(hoje);
    expect(dados.length).toBeGreaterThan(10);
    expect(dados.every(ehTransacaoValida)).toBe(true);
    expect(dados.every((d) => d.data <= '2026-10-03')).toBe(true);
    expect(new Set(dados.map((d) => d.id)).size).toBe(dados.length);
  });
});
