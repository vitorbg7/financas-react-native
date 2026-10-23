// Persistência no aparelho (AsyncStorage). Toda leitura e escrita fica dentro de
// try/catch: o armazenamento pode falhar ou estar cheio, e o app não pode quebrar por isso.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { ehTransacaoValida, type Transacao } from './dominio/transacoes';

const CHAVE = 'financas-mobile:v1';

export interface Estado {
  transacoes: Transacao[];
  limite: number; // centavos; 0 = sem limite
}

export const estadoVazio = (): Estado => ({ transacoes: [], limite: 0 });

export async function carregar(): Promise<Estado> {
  try {
    const bruto = await AsyncStorage.getItem(CHAVE);
    if (!bruto) return estadoVazio();

    const dados: unknown = JSON.parse(bruto);
    if (typeof dados !== 'object' || dados === null) return estadoVazio();
    const { transacoes, limite } = dados as { transacoes?: unknown; limite?: unknown };

    return {
      // Descarta qualquer item corrompido em vez de quebrar o app inteiro.
      transacoes: Array.isArray(transacoes)
        ? transacoes.filter(ehTransacaoValida).map((t) => ({ ...t, criadoEm: Number.isFinite(t.criadoEm) ? t.criadoEm : 0 }))
        : [],
      limite: typeof limite === 'number' && Number.isSafeInteger(limite) && limite > 0 ? limite : 0,
    };
  } catch {
    return estadoVazio();
  }
}

/** Devolve true se salvou; false se o aparelho não deixou. */
export async function salvar(estado: Estado): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}
