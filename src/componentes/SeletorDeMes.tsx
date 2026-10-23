import { Pressable, StyleSheet, Text, View } from 'react-native';

import { deslocarMes, formatarMes, mesAtual } from '../dominio/datas';
import { cores } from '../tema';

interface Props {
  mes: string;
  onMudar: (mes: string) => void;
}

export function SeletorDeMes({ mes, onMudar }: Props) {
  // Não deixa avançar além do mês atual: ainda não há lançamentos no futuro.
  const noMesAtual = mes >= mesAtual();

  return (
    <View style={styles.linha}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        onPress={() => onMudar(deslocarMes(mes, -1))}
        style={styles.seta}
      >
        <Text style={styles.textoSeta}>‹</Text>
      </Pressable>

      <Text style={styles.mes} accessibilityRole="header">
        {formatarMes(mes)}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        accessibilityState={{ disabled: noMesAtual }}
        disabled={noMesAtual}
        onPress={() => onMudar(deslocarMes(mes, 1))}
        style={[styles.seta, noMesAtual && styles.desativada]}
      >
        <Text style={styles.textoSeta}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seta: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  desativada: { opacity: 0.25 },
  textoSeta: { fontSize: 30, color: cores.primaria },
  mes: { fontSize: 18, fontWeight: '600', color: cores.texto },
});
