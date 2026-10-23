import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import App from '../../App';
import { estadoVazio } from '../armazenamento';
import { dataISOHoje } from '../dominio/datas';
import { criarTransacao } from '../dominio/transacoes';

async function abrirApp() {
  await render(<App />);
  // Espera a leitura inicial do armazenamento terminar.
  await screen.findByText('Finanças');
}

async function adicionar(descricao: string, valor: string, tipo: 'Despesa' | 'Receita' = 'Despesa') {
  await fireEvent.press(screen.getByLabelText('Novo lançamento'));
  await fireEvent.press(await screen.findByText(tipo));
  await fireEvent.changeText(screen.getByLabelText('Descrição'), descricao);
  await fireEvent.changeText(screen.getByLabelText('Valor'), valor);
  await fireEvent.press(screen.getByText('Salvar'));
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe('App', () => {
  it('abre vazio e mostra o saldo zerado', async () => {
    await abrirApp();

    expect(screen.getByText('Nenhum lançamento neste mês.')).toBeTruthy();
    expect(screen.getByTestId('saldo').props.children).toBe('R$ 0,00');
  });

  it('adiciona uma despesa e atualiza o resumo e as categorias', async () => {
    await abrirApp();
    await adicionar('Mercado', '1.234,56');

    expect(await screen.findByText('Mercado')).toBeTruthy();
    expect(screen.getByTestId('despesas').props.children).toBe('R$ 1.234,56');
    expect(screen.getByTestId('saldo').props.children).toBe('-R$ 1.234,56');
    expect(screen.getByText('Despesas por categoria')).toBeTruthy();
  });

  it('mostra o erro do formulário e não fecha enquanto estiver inválido', async () => {
    await abrirApp();
    await fireEvent.press(screen.getByLabelText('Novo lançamento'));
    await fireEvent.press(await screen.findByText('Salvar'));

    expect(await screen.findByText('Informe uma descrição.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Descrição'), 'Café');
    await fireEvent.changeText(screen.getByLabelText('Valor'), 'abc');
    await fireEvent.press(screen.getByText('Salvar'));
    expect(await screen.findByText('Valor inválido. Use o formato 1234,56.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Data'), '31/02/2026');
    await fireEvent.changeText(screen.getByLabelText('Valor'), '5');
    await fireEvent.press(screen.getByText('Salvar'));
    expect(await screen.findByText('Informe uma data válida no formato DD/MM/AAAA.')).toBeTruthy();
  });

  it('guarda os dados no aparelho e recarrega ao abrir de novo', async () => {
    const primeira = await render(<App />);
    await screen.findByText('Finanças');
    await adicionar('Salário do mês', '3000', 'Receita');
    await screen.findByText('Salário do mês');
    await primeira.unmount();

    await abrirApp();
    expect(await screen.findByText('Salário do mês')).toBeTruthy();
    expect(screen.getByTestId('receitas').props.children).toBe('R$ 3.000,00');
  });

  it('filtra por receitas e despesas e pela busca', async () => {
    await abrirApp();
    await adicionar('Aluguel', '1000');
    await adicionar('Freela', '500', 'Receita');
    await screen.findByText('Freela');

    await fireEvent.press(screen.getByRole('button', { name: 'Receitas' }));
    expect(screen.queryByText('Aluguel')).toBeNull();
    expect(screen.getByText('Freela')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Todos' }));
    await fireEvent.changeText(screen.getByLabelText('Buscar lançamento'), 'ALUG');
    expect(screen.queryByText('Freela')).toBeNull();
    expect(screen.getByText('Aluguel')).toBeTruthy();
  });

  it('exclui um lançamento depois de confirmar', async () => {
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await abrirApp();
    await adicionar('Cinema', '40');
    await screen.findByText('Cinema');

    await fireEvent.press(screen.getByLabelText('Excluir Cinema'));
    const botoes = alerta.mock.calls[0][2]!;
    await act(async () => {
      botoes.find((b) => b.text === 'Excluir')!.onPress!();
    });

    expect(await screen.findByText('Nenhum lançamento neste mês.')).toBeTruthy();
  });

  it('abre normalmente quando o que está guardado não é um JSON válido', async () => {
    await AsyncStorage.setItem('financas-mobile:v1', '{ isto não é json');
    await abrirApp();
    expect(screen.getByText('Nenhum lançamento neste mês.')).toBeTruthy();
  });

  it('descarta só os itens corrompidos e mantém os válidos', async () => {
    const valido = criarTransacao({
      descricao: 'Item bom',
      valor: '10',
      tipo: 'despesa',
      categoria: 'Outros',
      data: dataISOHoje(),
    });
    await AsyncStorage.setItem(
      'financas-mobile:v1',
      JSON.stringify({ ...estadoVazio(), transacoes: [{ id: 1 }, null, 'x', valido], limite: -5 }),
    );

    await abrirApp();
    expect(await screen.findByText('Item bom')).toBeTruthy();
    expect(screen.queryByText('Limite de gastos')).toBeNull();
  });
});
