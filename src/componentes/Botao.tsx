import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../tema';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo';
}

export function Botao({ titulo, onPress, variante = 'primario' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variante], pressed && styles.pressionado]}
    >
      <Text style={[styles.texto, variante === 'secundario' && styles.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primario: { backgroundColor: cores.primaria },
  perigo: { backgroundColor: cores.despesa },
  secundario: { backgroundColor: cores.primariaClara },
  pressionado: { opacity: 0.8 },
  texto: { color: cores.branco, fontSize: 16, fontWeight: '600' },
  textoSecundario: { color: cores.primaria },
});
