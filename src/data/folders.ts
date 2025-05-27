
import type { AppFolder } from '@/types';

// Para que seu professor e monitores vejam os Gists pré-carregados
// ao abrir o projeto, você PRECISA preencher o campo gitRepoUrl
// para cada AppFolder abaixo com a URL do Gist correspondente.
// O localStorage salvará as alterações para o seu próprio uso,
// mas esta lista inicial é o que será carregado por padrão para novos usuários.

export const initialFolders: AppFolder[] = [
  {
    id: '01',
    name: 'Receita 1',
    description: 'Construindo Interfaces com o Usuário',
    longDescription: 'Detalhes sobre a Receita 1: Construindo Interfaces com o Usuário.',
    gitRepoUrl: '',
  },
  {
    id: '02',
    name: 'Receita 2',
    description: 'Classes e herança no contexto de interfaces gráficas',
    longDescription: 'Detalhes sobre a Receita 2: Classes e herança no contexto de interfaces gráficas.',
    gitRepoUrl: '',
  },
  {
    id: '03',
    name: 'Receita 3',
    description: 'Herança à moda moderna: funções de alta ordem',
    longDescription: 'Detalhes sobre a Receita 3: Herança à moda moderna: funções de alta ordem.',
    gitRepoUrl: '',
  },
  {
    id: '04',
    name: 'Receita 4',
    description: 'Objetos JSON',
    longDescription: 'Detalhes sobre a Receita 4: Objetos JSON.',
    gitRepoUrl: '',
  },
  {
    id: '05',
    name: 'Receita 5',
    description: 'Gerência de estados #1 - o básico do básico',
    longDescription: 'Detalhes sobre a Receita 5: Gerência de estados #1 - o básico do básico.',
    gitRepoUrl: '',
  },
  {
    id: '06',
    name: 'Receita 6',
    description: 'Gerência de estados #2 - 1 real e 99 a mais do básico',
    longDescription: 'Detalhes sobre a Receita 6: Gerência de estados #2 - 1 real e 99 a mais do básico.',
    gitRepoUrl: '',
  },
  {
    id: '07',
    name: 'Receita 7',
    description: 'Programação Assíncrona, o básico',
    longDescription: 'Detalhes sobre a Receita 7: Programação Assíncrona, o básico.',
    gitRepoUrl: '',
  },
  {
    id: '08',
    name: 'Receita 8',
    description: 'Programação Assíncrona, uma outra abordagem',
    longDescription: 'Detalhes sobre a Receita 8: Programação Assíncrona, uma outra abordagem.',
    gitRepoUrl: '',
  },
  {
    id: '08a',
    name: 'Receita 8a',
    description: 'Infinite Scrolling',
    longDescription: 'Detalhes sobre a Receita 8a: Infinite Scrolling.',
    gitRepoUrl: '',
  },
  {
    id: 'mini-projeto',
    name: 'Mini-Projeto',
    description: 'Montagem de novo app usando uma API diferente',
    longDescription: 'Detalhes sobre o Mini-Projeto: Montagem de novo app usando uma API diferente.',
    gitRepoUrl: '',
  },
  {
    id: '09',
    name: 'Receita 9',
    description: 'Bibliotecas, visibilidade de atributos, métodos get/set, constantes...',
    longDescription: 'Detalhes sobre a Receita 9: Bibliotecas, visibilidade de atributos, métodos get/set, constantes...',
    gitRepoUrl: '',
  },
  {
    id: '10',
    name: 'Receita 10',
    description: 'Polimorfismo (motivação, sem uso explícito)',
    longDescription: 'Detalhes sobre a Receita 10: Polimorfismo (motivação, sem uso explícito).',
    gitRepoUrl: '',
  },
  {
    id: '10b',
    name: 'Receita 10b',
    description: 'Polimorfismo - a coisa acontecendo, mas ainda com alguma burocracia',
    longDescription: 'Detalhes sobre a Receita 10b: Polimorfismo - a coisa acontecendo, mas ainda com alguma burocracia.',
    gitRepoUrl: '',
  },
  {
    id: '10c',
    name: 'Receita 10c',
    description: 'Polimorfismo e os contratos de trabalho',
    longDescription: 'Detalhes sobre a Receita 10c: Polimorfismo e os contratos de trabalho.',
    gitRepoUrl: '',
  },
  {
    id: '10d',
    name: 'Receita 10d',
    description: 'Data objects e polimorfismo',
    longDescription: 'Detalhes sobre a Receita 10d: Data objects e polimorfismo.',
    gitRepoUrl: '',
  },
  // Você pode adicionar mais entradas genéricas aqui se precisar de mais de 15,
  // ou remover esta seção se as 15 acima forem suficientes.
  // Exemplo de receita adicional genérica:
  // {
  //   id: '11', // Continue a numeração ou use um esquema de ID que faça sentido
  //   name: 'App 11 (Ainda não especificado)',
  //   description: 'Aguardando definição da receita.',
  //   longDescription: 'Detalhes sobre esta receita serão adicionados posteriormente.',
  //   gitRepoUrl: '',
  // },
];
