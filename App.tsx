import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Ajustes } from './src/componentes/Ajustes';
import { Botao } from './src/componentes/Botao';
import { FiltroDaLista } from './src/componentes/FiltroDaLista';
import { FormularioTransacao } from './src/componentes/FormularioTransacao';
import { GastosPorCategoria } from './src/componentes/GastosPorCategoria';
import { ItemTransacao } from './src/componentes/ItemTransacao';
import { LimiteMensal } from './src/componentes/LimiteMensal';
import { ResumoDoMes } from './src/componentes/ResumoDoMes';
import { SeletorDeMes } from './src/componentes/SeletorDeMes';
import { mesAtual } from './src/dominio/datas';
import { gastosPorCategoria, paraCSV, progressoLimite, resumo } from './src/dominio/relatorios';
import { filtrar, filtrarPorMes, ordenar, type Filtros } from './src/dominio/transacoes';
import { cores } from './src/tema';
import { useFinancas } from './src/useFinancas';

export default function App() {
  return (
    <SafeAreaProvider>
      <Principal />
    </SafeAreaProvider>
  );
}

function Principal() {
  const { transacoes, limite, carregado, falhouAoSalvar, adicionar, remover, definirLimite, carregarExemplo, apagarTudo } =
    useFinancas();

  const [mes, setMes] = useState(() => mesAtual());
  const [filtros, setFiltros] = useState<Filtros>({ tipo: 'todos', busca: '' });
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [ajustesAbertos, setAjustesAbertos] = useState(false);

  // Tudo abaixo é calculado a partir da lista; nada disso é guardado.
  const doMes = useMemo(() => filtrarPorMes(transacoes, mes), [transacoes, mes]);
  const totais = useMemo(() => resumo(doMes), [doMes]);
  const gastos = useMemo(() => gastosPorCategoria(doMes), [doMes]);
  const progresso = useMemo(() => progressoLimite(totais.despesas, limite), [totais.despesas, limite]);
  const lista = useMemo(() => ordenar(filtrar(doMes, filtros)), [doMes, filtros]);

  const exportar = () => {
    Share.share({ title: `Lançamentos ${mes}`, message: paraCSV(doMes) }).catch(() => {});
  };

  if (!carregado) {
    return (
      <SafeAreaView style={[styles.tela, styles.centro]}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </SafeAreaView>
    );
  }

  const cabecalho = (
    <View style={styles.cabecalho}>
      <View style={styles.topo}>
        <Text style={styles.titulo} accessibilityRole="header">
          Finanças
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir ajustes" onPress={() => setAjustesAbertos(true)} hitSlop={8}>
          <Text style={styles.ajustes}>Ajustes</Text>
        </Pressable>
      </View>

      {falhouAoSalvar && (
        <Text accessibilityRole="alert" style={styles.aviso}>
          Não foi possível salvar no aparelho. As alterações podem ser perdidas ao fechar o app.
        </Text>
      )}

      <SeletorDeMes mes={mes} onMudar={setMes} />
      <ResumoDoMes resumo={totais} />
      <LimiteMensal progresso={progresso} />
      <GastosPorCategoria gastos={gastos} />

      <Text style={styles.secao} accessibilityRole="header">
        Lançamentos
      </Text>
      <FiltroDaLista filtros={filtros} onMudar={setFiltros} />
    </View>
  );

  const vazio = (
    <View style={styles.vazio}>
      <Text style={styles.textoVazio}>
        {doMes.length === 0 ? 'Nenhum lançamento neste mês.' : 'Nenhum lançamento com esse filtro.'}
      </Text>
      {transacoes.length === 0 && <Botao titulo="Carregar dados de exemplo" variante="secundario" onPress={carregarExemplo} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.tela}>
      <StatusBar style="dark" />
      <FlatList
        data={lista}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => <ItemTransacao transacao={item} onExcluir={remover} />}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={vazio}
        ItemSeparatorComponent={Espaco}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Novo lançamento"
        onPress={() => setFormularioAberto(true)}
        style={({ pressed }) => [styles.botaoNovo, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.maisNovo}>+</Text>
      </Pressable>

      <FormularioTransacao visivel={formularioAberto} onFechar={() => setFormularioAberto(false)} onSalvar={adicionar} />
      <Ajustes
        visivel={ajustesAbertos}
        onFechar={() => setAjustesAbertos(false)}
        limite={limite}
        temLancamentos={transacoes.length > 0}
        onSalvarLimite={definirLimite}
        onExportar={exportar}
        onCarregarExemplo={carregarExemplo}
        onApagarTudo={apagarTudo}
      />
    </SafeAreaView>
  );
}

const Espaco = () => <View style={{ height: 8 }} />;

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { alignItems: 'center', justifyContent: 'center' },
  lista: { padding: 16, paddingBottom: 110 },
  cabecalho: { gap: 12, marginBottom: 12 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { fontSize: 26, fontWeight: '700', color: cores.texto },
  ajustes: { fontSize: 16, color: cores.primaria, fontWeight: '600' },
  secao: { fontSize: 18, fontWeight: '600', color: cores.texto, marginTop: 4 },
  aviso: { color: cores.alerta, fontSize: 13 },
  vazio: { alignItems: 'stretch', gap: 12, paddingVertical: 16 },
  textoVazio: { color: cores.suave, fontSize: 15, textAlign: 'center' },
  botaoNovo: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  maisNovo: { color: cores.branco, fontSize: 32, lineHeight: 36 },
});
