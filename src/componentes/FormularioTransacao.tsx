import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { dataBrParaISO, dataISOHoje, isoParaDataBr } from '../dominio/datas';
import { CATEGORIAS, type DadosTransacao, type Tipo } from '../dominio/transacoes';
import { cores } from '../tema';
import { Botao } from './Botao';

interface Props {
  visivel: boolean;
  onFechar: () => void;
  /** Deve lançar Error com mensagem amigável se os dados forem inválidos. */
  onSalvar: (dados: DadosTransacao) => void;
}

export function FormularioTransacao({ visivel, onFechar, onSalvar }: Props) {
  const [tipo, setTipo] = useState<Tipo>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS.despesa[0]);
  const [data, setData] = useState(() => isoParaDataBr(dataISOHoje()));
  const [erro, setErro] = useState('');

  // Cada vez que o formulário abre, volta ao estado inicial.
  useEffect(() => {
    if (!visivel) return;
    setTipo('despesa');
    setDescricao('');
    setValor('');
    setCategoria(CATEGORIAS.despesa[0]);
    setData(isoParaDataBr(dataISOHoje()));
    setErro('');
  }, [visivel]);

  const escolherTipo = (novo: Tipo) => {
    setTipo(novo);
    setCategoria(CATEGORIAS[novo][0]); // as categorias mudam conforme o tipo
  };

  const salvar = () => {
    try {
      onSalvar({ descricao, valor, tipo, categoria, data: dataBrParaISO(data) });
      onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar.');
    }
  };

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <SafeAreaView style={styles.tela}>
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo} accessibilityRole="header">
              Novo lançamento
            </Text>

            <View style={styles.linha}>
              {(['despesa', 'receita'] as const).map((t) => (
                <Pressable
                  key={t}
                  accessibilityRole="button"
                  accessibilityState={{ selected: tipo === t }}
                  onPress={() => escolherTipo(t)}
                  style={[styles.tipo, tipo === t && styles.tipoAtivo]}
                >
                  <Text style={[styles.textoTipo, tipo === t && styles.textoTipoAtivo]}>
                    {t === 'despesa' ? 'Despesa' : 'Receita'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.rotulo}>Descrição</Text>
            <TextInput
              accessibilityLabel="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              maxLength={60}
              placeholder="Ex.: Mercado"
              placeholderTextColor={cores.suave}
              style={styles.campo}
            />

            <Text style={styles.rotulo}>Valor (R$)</Text>
            <TextInput
              accessibilityLabel="Valor"
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={cores.suave}
              style={styles.campo}
            />

            <Text style={styles.rotulo}>Categoria</Text>
            <View style={styles.categorias}>
              {CATEGORIAS[tipo].map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityState={{ selected: categoria === c }}
                  onPress={() => setCategoria(c)}
                  style={[styles.categoria, categoria === c && styles.categoriaAtiva]}
                >
                  <Text style={[styles.textoCategoria, categoria === c && styles.textoCategoriaAtiva]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.rotulo}>Data</Text>
            <TextInput
              accessibilityLabel="Data"
              value={data}
              onChangeText={setData}
              keyboardType="numbers-and-punctuation"
              placeholder="DD/MM/AAAA"
              placeholderTextColor={cores.suave}
              style={styles.campo}
            />

            {erro !== '' && (
              <Text accessibilityRole="alert" style={styles.erro}>
                {erro}
              </Text>
            )}

            <View style={styles.botoes}>
              <Botao titulo="Salvar" onPress={salvar} />
              <Botao titulo="Cancelar" variante="secundario" onPress={onFechar} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 8 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: 8 },
  linha: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tipo: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tipoAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoTipo: { color: cores.texto, fontSize: 16 },
  textoTipoAtivo: { color: cores.branco, fontWeight: '600' },
  rotulo: { color: cores.suave, fontSize: 14, marginTop: 8 },
  campo: {
    minHeight: 48,
    backgroundColor: cores.cartao,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 12,
    fontSize: 16,
    color: cores.texto,
  },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoria: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  categoriaAtiva: { backgroundColor: cores.primariaClara, borderColor: cores.primaria },
  textoCategoria: { color: cores.texto, fontSize: 14 },
  textoCategoriaAtiva: { color: cores.primaria, fontWeight: '600' },
  erro: { color: cores.despesa, fontSize: 14, marginTop: 8 },
  botoes: { gap: 10, marginTop: 20 },
});
