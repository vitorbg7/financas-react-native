import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { dataCurta } from '../dominio/datas';
import { formatarMoeda } from '../dominio/dinheiro';
import type { Transacao } from '../dominio/transacoes';
import { cores } from '../tema';

interface Props {
  transacao: Transacao;
  onExcluir: (id: string) => void;
}

export function ItemTransacao({ transacao, onExcluir }: Props) {
  const receita = transacao.tipo === 'receita';

  const confirmarExclusao = () =>
    Alert.alert('Excluir lançamento', `Excluir "${transacao.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onExcluir(transacao.id) },
    ]);

  return (
    <View style={styles.linha}>
      <View style={styles.dados}>
        <Text style={styles.descricao} numberOfLines={1}>
          {transacao.descricao}
        </Text>
        <Text style={styles.detalhe}>
          {transacao.categoria} · {dataCurta(transacao.data)}
        </Text>
      </View>

      <View style={styles.direita}>
        <Text style={[styles.valor, { color: receita ? cores.receita : cores.despesa }]}>
          {receita ? '+' : '-'} {formatarMoeda(transacao.valorCentavos)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${transacao.descricao}`}
          hitSlop={8}
          onPress={confirmarExclusao}
        >
          <Text style={styles.excluir}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: 12,
  },
  dados: { flex: 1 },
  descricao: { fontSize: 16, fontWeight: '600', color: cores.texto },
  detalhe: { fontSize: 13, color: cores.suave, marginTop: 2 },
  direita: { alignItems: 'flex-end', gap: 4 },
  valor: { fontSize: 16, fontWeight: '700' },
  excluir: { fontSize: 13, color: cores.suave, textDecorationLine: 'underline' },
});
