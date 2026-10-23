import { StyleSheet, Text, View } from 'react-native';

import { formatarMoeda } from '../dominio/dinheiro';
import type { ProgressoLimite } from '../dominio/relatorios';
import { cores } from '../tema';

export function LimiteMensal({ progresso }: { progresso: ProgressoLimite | null }) {
  if (!progresso) return null;

  const cor = progresso.estourou ? cores.despesa : progresso.percentual >= 80 ? cores.alerta : cores.receita;
  const mensagem = progresso.estourou
    ? `Limite estourado em ${formatarMoeda(-progresso.restante)}`
    : `Restam ${formatarMoeda(progresso.restante)}`;

  return (
    <View style={styles.cartao}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Limite de gastos</Text>
        <Text style={[styles.percentual, { color: cor }]}>{progresso.percentual}%</Text>
      </View>
      <View style={styles.trilho}>
        <View style={[styles.barra, { width: `${Math.min(progresso.percentual, 100)}%`, backgroundColor: cor }]} />
      </View>
      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: cores.cartao, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: cores.borda },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  titulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  percentual: { fontSize: 16, fontWeight: '700' },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cores.fundo, overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5 },
  mensagem: { marginTop: 8, color: cores.suave, fontSize: 13 },
});
