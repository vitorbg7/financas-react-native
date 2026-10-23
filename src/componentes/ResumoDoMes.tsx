import { StyleSheet, Text, View } from 'react-native';

import { formatarMoeda } from '../dominio/dinheiro';
import type { Resumo } from '../dominio/relatorios';
import { cores } from '../tema';

export function ResumoDoMes({ resumo }: { resumo: Resumo }) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.rotulo}>Saldo do mês</Text>
      <Text
        testID="saldo"
        style={[styles.saldo, { color: resumo.saldo < 0 ? cores.despesa : cores.texto }]}
        accessibilityLabel={`Saldo do mês: ${formatarMoeda(resumo.saldo)}`}
      >
        {formatarMoeda(resumo.saldo)}
      </Text>

      <View style={styles.linha}>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>Receitas</Text>
          <Text testID="receitas" style={[styles.valor, { color: cores.receita }]}>
            {formatarMoeda(resumo.receitas)}
          </Text>
        </View>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>Despesas</Text>
          <Text testID="despesas" style={[styles.valor, { color: cores.despesa }]}>
            {formatarMoeda(resumo.despesas)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: cores.borda },
  rotulo: { color: cores.suave, fontSize: 13 },
  saldo: { fontSize: 32, fontWeight: '700', marginTop: 2, marginBottom: 12 },
  linha: { flexDirection: 'row', gap: 16 },
  coluna: { flex: 1 },
  valor: { fontSize: 18, fontWeight: '600', marginTop: 2 },
});
