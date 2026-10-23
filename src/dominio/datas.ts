// Datas são sempre texto "AAAA-MM-DD", sem fuso horário: assim "23/10" nunca vira
// "22/10" por causa de conversão de fuso. Meses são texto "AAAA-MM".

const NOMES_DOS_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function dataValida(texto: unknown): texto is string {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

export function dataISOHoje(hoje: Date = new Date()): string {
  return `${hoje.getFullYear()}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(hoje.getDate())}`;
}

/** "23/10/2026" -> "2026-10-23". Lança Error se a data não existir. */
export function dataBrParaISO(texto: string): string {
  const partes = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto.trim());
  const iso = partes ? `${partes[3]}-${doisDigitos(Number(partes[2]))}-${doisDigitos(Number(partes[1]))}` : '';
  if (!dataValida(iso)) throw new Error('Informe uma data válida no formato DD/MM/AAAA.');
  return iso;
}

/** "2026-10-23" -> "23/10/2026" */
export function isoParaDataBr(data: string): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** "2026-10-23" -> "23/10" */
export function dataCurta(data: string): string {
  return isoParaDataBr(data).slice(0, 5);
}

/** "2026-10-23" -> "2026-10" */
export function mesDe(data: string): string {
  return data.slice(0, 7);
}

export function mesAtual(hoje: Date = new Date()): string {
  return mesDe(dataISOHoje(hoje));
}

/** deslocarMes("2026-01", -1) -> "2025-12" */
export function deslocarMes(mes: string, delta: number): string {
  const [ano, numero] = mes.split('-').map(Number);
  const total = ano * 12 + (numero - 1) + delta;
  return `${Math.floor(total / 12)}-${doisDigitos((total % 12) + 1)}`;
}

/** "2026-10" -> "Outubro de 2026" */
export function formatarMes(mes: string): string {
  const [ano, numero] = mes.split('-').map(Number);
  return `${NOMES_DOS_MESES[numero - 1]} de ${ano}`;
}
