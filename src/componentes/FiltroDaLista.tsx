import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Filtros } from '../dominio/transacoes';
import { cores } from '../tema';

const OPCOES: { valor: Filtros['tipo']; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'receita', rotulo: 'Receitas' },
  { valor: 'despesa', rotulo: 'Despesas' },
];

interface Props {
  filtros: Filtros;
  onMudar: (filtros: Filtros) => void;
}

export function FiltroDaLista({ filtros, onMudar }: Props) {
  return (
    <View style={styles.caixa}>
      <View style={styles.opcoes}>
        {OPCOES.map((o) => {
          const ativo = filtros.tipo === o.valor;
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              onPress={() => onMudar({ ...filtros, tipo: o.valor })}
              style={[styles.opcao, ativo && styles.opcaoAtiva]}
            >
              <Text style={[styles.textoOpcao, ativo && styles.textoOpcaoAtiva]}>{o.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        accessibilityLabel="Buscar lançamento"
        placeholder="Buscar por descrição"
        placeholderTextColor={cores.suave}
        value={filtros.busca}
        onChangeText={(busca) => onMudar({ ...filtros, busca })}
        autoCorrect={false}
        style={styles.busca}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { gap: 10 },
  opcoes: { flexDirection: 'row', gap: 8 },
  opcao: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  opcaoAtiva: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoOpcao: { color: cores.texto, fontSize: 14 },
  textoOpcaoAtiva: { color: cores.branco, fontWeight: '600' },
  busca: {
    minHeight: 46,
    backgroundColor: cores.cartao,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 12,
    fontSize: 16,
    color: cores.texto,
  },
});
