# Finanças (React Native)

App de finanças pessoais para celular, feito com React Native e Expo. Registra receitas e despesas, mostra o saldo de cada mês, os gastos por categoria e o quanto do limite mensal já foi usado. Os dados ficam salvos no aparelho, sem internet nem conta.

É a versão mobile de [financas-pessoais-js](https://github.com/vitorbg7/financas-pessoais-js): as regras de negócio vieram de lá, agora em TypeScript.

| Resumo do mês | Novo lançamento |
| --- | --- |
| ![Tela principal](docs/tela-principal.png) | ![Novo lançamento](docs/novo-lancamento.png) |

## Funcionalidades

- Cadastro de receitas e despesas, com categoria, data e valor
- Navegação por mês, com saldo, receitas e despesas
- Despesas por categoria, com valor e percentual
- Limite mensal de gastos com barra de progresso (muda de cor perto de estourar)
- Filtro por tipo e busca por descrição, sem diferenciar acentos nem maiúsculas
- Exclusão com confirmação
- Exportação do mês em CSV (compartilhado como texto)
- Dados de exemplo para testar rápido

## Tecnologias

React Native 0.88 · Expo SDK 58 · TypeScript · AsyncStorage · Jest e Testing Library

## Estrutura

```
App.tsx                 Tela principal: junta os componentes e calcula o que mostrar
src/
  dominio/              Regras de negócio em funções puras, sem React
    dinheiro.ts           Conversão de texto para centavos e formatação em reais
    datas.ts              Datas e meses
    transacoes.ts         Criação, validação, filtros e ordenação
    relatorios.ts         Resumo, gastos por categoria, limite e CSV
    exemplo.ts            Dados de exemplo
  armazenamento.ts      Leitura e escrita no AsyncStorage, com validação
  useFinancas.ts        Hook com o estado do app e as ações (adicionar, remover, limite)
  componentes/          Telas e peças de interface
  __tests__/            Testes da lógica e das telas
```

As telas não conhecem o armazenamento e a pasta `dominio` não conhece o React. Por isso a lógica é testada sem precisar renderizar nada.

## Decisões

- **Dinheiro em centavos inteiros.** Evita erros de ponto flutuante como `0.1 + 0.2`. O texto digitado passa por um validador que aceita `1.234,56`, `12,5` ou `R$ 10` e recusa `1,005` (meio centavo).
- **Datas como texto `AAAA-MM-DD`.** Sem objeto `Date` nem fuso horário, então o dia 23 nunca vira 22. O formulário usa `DD/MM/AAAA` e converte.
- **Nada derivado é salvo.** Saldo, totais por categoria e progresso do limite são calculados a partir da lista de lançamentos, então nunca ficam diferentes dos dados.
- **Dados guardados são validados na leitura.** Se algum item estiver corrompido, só ele é descartado e o app abre normalmente.
- **Formatação feita à mão** (`formatarMoeda`, nomes dos meses) em vez de `Intl`, para o resultado não depender do suporte de cada aparelho.
- **Sem biblioteca de navegação.** O app tem uma tela principal e dois modais, então estado simples resolve.

## Como rodar

Precisa de [Node.js](https://nodejs.org) (versão LTS) e do app **Expo Go** no celular.

```
npm install
npx expo start
```

Escaneie o QR code que aparece no terminal com o Expo Go (Android) ou com a câmera (iPhone). O celular e o computador precisam estar na mesma rede Wi-Fi.

## Testes

```
npm test
npm run typecheck
```

Os testes cobrem as regras de negócio (conversão de valores, datas, validação, filtros, relatórios, CSV) e o fluxo das telas: adicionar, validar o formulário, filtrar, excluir e recarregar os dados salvos.
