// Dinheiro é sempre guardado em CENTAVOS (número inteiro), nunca em decimal,
// para evitar erros como 0.1 + 0.2 = 0.30000000000000004.

export const VALOR_MAXIMO = 100_000_000_000; // R$ 1 bilhão, em centavos

/**
 * Converte o que a pessoa digitou ("1.234,56", "12,5", "R$ 10") em centavos.
 * Lança Error com mensagem amigável se o valor não fizer sentido.
 */
export function parseValorEmCentavos(entrada: string): number {
  let texto = entrada.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  if (!texto) throw new Error('Informe um valor.');

  // Formato brasileiro: ponto separa milhar e vírgula separa centavos.
  if (texto.includes(',')) texto = texto.replace(/\./g, '').replace(',', '.');

  if (!/^\d+(\.\d{1,2})?$/.test(texto)) throw new Error('Valor inválido. Use o formato 1234,56.');

  const [reais, centavos = ''] = texto.split('.');
  const total = Number(reais) * 100 + Number(centavos.padEnd(2, '0'));
  if (!Number.isSafeInteger(total) || total > VALOR_MAXIMO) throw new Error('Esse valor é alto demais.');
  return total;
}

/** 123456 -> "R$ 1.234,56". Feito à mão para não depender do suporte a Intl de cada aparelho. */
export function formatarMoeda(centavos: number): string {
  const sinal = centavos < 0 ? '-' : '';
  const absoluto = Math.abs(centavos);
  const reais = String(Math.floor(absoluto / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sinal}R$ ${reais},${String(absoluto % 100).padStart(2, '0')}`;
}

/** 1290 -> "12,90" (sem símbolo, usado no CSV). */
export function centavosParaTexto(centavos: number): string {
  return `${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, '0')}`;
}
