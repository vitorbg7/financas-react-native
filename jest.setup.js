// Troca o AsyncStorage real por uma versão em memória nos testes.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// O SafeAreaProvider real só desenha os filhos depois de medir a tela; nos testes usamos o mock oficial.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
