import { StyleSheet, Text, View } from 'react-native';

import { formatarMoeda } from '../dominio/dinheiro';
import type { GastoPorCategoria } from '../dominio/relatorios';
import { cores } from '../tema';

export function GastosPorCategoria({ gastos }: { gastos: GastoPorCategoria[] }) {
  if (gastos.length === 0) return null;

  return (
    <View style={styles.cartao}>
      <Text style={styles.titulo}>Despesas por categoria</Text>
      {gastos.map((g) => (
        <View key={g.categoria} style={styles.item} accessible accessibilityLabel={`${g.categoria}: ${formatarMoeda(g.total)}, ${g.percentual}%`}>
          <View style={styles.cabecalho}>
            <Text style={styles.nome}>{g.categoria}</Text>
            <Text style={styles.valor}>
              {formatarMoeda(g.total)} · {g.percentual.toFixed(1).replace('.', ',')}%
            </Text>
          </View>
          <View style={styles.trilho}>
            <View style={[styles.barra, { width: `${Math.max(g.percentual, 2)}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: cores.borda },
  titulo: { fontSize: 16, fontWeight: '600', color: cores.texto, marginBottom: 8 },
  item: { marginTop: 8 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nome: { color: cores.texto, fontSize: 14 },
  valor: { color: cores.suave, fontSize: 13 },
  trilho: { height: 8, borderRadius: 4, backgroundColor: cores.fundo, overflow: 'hidden' },
  barra: { height: 8, borderRadius: 4, backgroundColor: cores.primaria },
});
