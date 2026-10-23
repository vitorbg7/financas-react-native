// Hook que guarda o estado do app (lançamentos e limite mensal) e o mantém salvo no aparelho.
// As telas só chamam estas funções; não sabem nada de armazenamento.

import { useCallback, useEffect, useState } from 'react';

import { carregar, estadoVazio, salvar, type Estado } from './armazenamento';
import { VALOR_MAXIMO, parseValorEmCentavos } from './dominio/dinheiro';
import { gerarDadosDeExemplo } from './dominio/exemplo';
import { criarTransacao, type DadosTransacao } from './dominio/transacoes';

export function useFinancas() {
  const [estado, setEstado] = useState<Estado>(estadoVazio);
  const [carregado, setCarregado] = useState(false);
  const [falhouAoSalvar, setFalhouAoSalvar] = useState(false);

  // Lê o que estava guardado quando o app abre.
  useEffect(() => {
    let ativo = true;
    carregar().then((guardado) => {
      if (!ativo) return;
      setEstado(guardado);
      setCarregado(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Salva a cada mudança, mas só depois da leitura inicial (senão apagaria os dados guardados).
  useEffect(() => {
    if (!carregado) return;
    salvar(estado).then((ok) => setFalhouAoSalvar(!ok));
  }, [estado, carregado]);

  /** Lança Error com mensagem amigável se os dados forem inválidos. */
  const adicionar = useCallback((dados: DadosTransacao) => {
    const nova = criarTransacao(dados);
    setEstado((atual) => ({ ...atual, transacoes: [...atual.transacoes, nova] }));
  }, []);

  const remover = useCallback((id: string) => {
    setEstado((atual) => ({ ...atual, transacoes: atual.transacoes.filter((t) => t.id !== id) }));
  }, []);

  /** Texto vazio remove o limite. Lança Error se o valor for inválido. */
  const definirLimite = useCallback((texto: string) => {
    const limite = texto.trim() === '' ? 0 : parseValorEmCentavos(texto);
    if (limite > VALOR_MAXIMO) throw new Error('Esse valor é alto demais.');
    setEstado((atual) => ({ ...atual, limite }));
  }, []);

  const carregarExemplo = useCallback(() => {
    setEstado((atual) => ({ ...atual, transacoes: gerarDadosDeExemplo() }));
  }, []);

  const apagarTudo = useCallback(() => setEstado(estadoVazio()), []);

  return {
    transacoes: estado.transacoes,
    limite: estado.limite,
    carregado,
    falhouAoSalvar,
    adicionar,
    remover,
    definirLimite,
    carregarExemplo,
    apagarTudo,
  };
}
