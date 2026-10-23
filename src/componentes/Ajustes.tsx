import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { centavosParaTexto } from '../dominio/dinheiro';
import { cores } from '../tema';
import { Botao } from './Botao';

interface Props {
  visivel: boolean;
  onFechar: () => void;
  limite: number;
  temLancamentos: boolean;
  /** Deve lançar Error com mensagem amigável se o valor for inválido. */
  onSalvarLimite: (texto: string) => void;
  onExportar: () => void;
  onCarregarExemplo: () => void;
  onApagarTudo: () => void;
}

export function Ajustes({
  visivel,
  onFechar,
  limite,
  temLancamentos,
  onSalvarLimite,
  onExportar,
  onCarregarExemplo,
  onApagarTudo,
}: Props) {
  const [textoLimite, setTextoLimite] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!visivel) return;
    setTextoLimite(limite > 0 ? centavosParaTexto(limite) : '');
    setErro('');
  }, [visivel, limite]);

  const salvarLimite = () => {
    try {
      onSalvarLimite(textoLimite);
      onFechar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o limite.');
    }
  };

  const confirmar = (titulo: string, mensagem: string, textoBotao: string, acao: () => void) =>
    Alert.alert(titulo, mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: textoBotao,
        style: 'destructive',
        onPress: () => {
          acao();
          onFechar();
        },
      },
    ]);

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <SafeAreaView style={styles.tela}>
        <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo} accessibilityRole="header">
              Ajustes
            </Text>

            <Text style={styles.rotulo}>Limite mensal de gastos (R$)</Text>
            <TextInput
              accessibilityLabel="Limite mensal"
              value={textoLimite}
              onChangeText={setTextoLimite}
              keyboardType="decimal-pad"
              placeholder="Sem limite"
              placeholderTextColor={cores.suave}
              style={styles.campo}
            />
            <Text style={styles.ajuda}>Deixe vazio para não usar limite.</Text>
            {erro !== '' && (
              <Text accessibilityRole="alert" style={styles.erro}>
                {erro}
              </Text>
            )}
            <Botao titulo="Salvar limite" onPress={salvarLimite} />

            <Text style={[styles.rotulo, styles.secao]}>Dados</Text>
            <Botao titulo="Exportar mês em CSV" variante="secundario" onPress={onExportar} />
            <Botao
              titulo="Carregar dados de exemplo"
              variante="secundario"
              onPress={() =>
                temLancamentos
                  ? confirmar('Carregar exemplo', 'Isso substitui os lançamentos atuais.', 'Substituir', onCarregarExemplo)
                  : (onCarregarExemplo(), onFechar())
              }
            />
            <Botao
              titulo="Apagar todos os lançamentos"
              variante="perigo"
              onPress={() => confirmar('Apagar tudo', 'Todos os lançamentos serão apagados.', 'Apagar', onApagarTudo)}
            />

            <Botao titulo="Fechar" variante="secundario" onPress={onFechar} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 10 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: 8 },
  rotulo: { color: cores.suave, fontSize: 14 },
  secao: { marginTop: 16 },
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
  ajuda: { color: cores.suave, fontSize: 13 },
  erro: { color: cores.despesa, fontSize: 14 },
});
