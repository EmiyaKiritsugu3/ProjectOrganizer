
import type { AppFolder } from '@/types';

// Este arquivo serve como template inicial para as receitas.
// Para que cada aluno comece com os campos de URL em branco e possa
// preenchê-los com seus próprios Gists (manualmente ou usando a busca automática),
// todas as gitRepoUrl abaixo devem ser strings vazias ('').
// As URLs inseridas ou buscadas por cada aluno serão salvas no localStorage do seu navegador.

export const initialFolders: AppFolder[] = [
  {
    id: '01',
    name: 'Receita 01: Construindo Interfaces',
    description: 'Interfaces com o usuário em Flutter.',
    longDescription: 'Detalhes sobre a Receita 01: Como construir interfaces de usuário básicas e interativas com Flutter, explorando widgets e layouts.',
    gitRepoUrl: '',
  },
  {
    id: '02',
    name: 'Receita 02: Classes e Herança',
    description: 'Aplicando POO em interfaces gráficas.',
    longDescription: 'Detalhes sobre a Receita 02: Uso de classes e herança no contexto de interfaces gráficas, componentização e reutilização de código.',
    gitRepoUrl: '',
  },
  {
    id: '03',
    name: 'Receita 03: Funções de Alta Ordem',
    description: 'Herança moderna e flexibilidade com funções.',
    longDescription: 'Detalhes sobre a Receita 03: Explorando funções de alta ordem como uma alternativa moderna à herança tradicional para criar código flexível.',
    gitRepoUrl: '',
  },
  {
    id: '04',
    name: 'Receita 04: Objetos JSON',
    description: 'Manipulação de dados no formato JSON.',
    longDescription: 'Detalhes sobre a Receita 04: Como trabalhar com objetos JSON em Dart, incluindo parsing, serialização e sua utilização em aplicativos.',
    gitRepoUrl: '',
  },
  {
    id: '05',
    name: 'Receita 05: Gerência de Estados #1',
    description: 'O básico da gerência de estados em Flutter.',
    longDescription: 'Detalhes sobre a Receita 05: Introdução aos conceitos fundamentais de gerência de estados em Flutter, como StatefulWidget e setState.',
    gitRepoUrl: '',
  },
  {
    id: '06',
    name: 'Receita 06: Gerência de Estados #2',
    description: 'Avançando na gerência de estados.',
    longDescription: 'Detalhes sobre a Receita 06: Explorando técnicas um pouco mais avançadas ou alternativas para gerência de estados em aplicativos Flutter.',
    gitRepoUrl: '',
  },
  {
    id: '07',
    name: 'Receita 07: Programação Assíncrona #1',
    description: 'O básico de programação assíncrona com Dart.',
    longDescription: 'Detalhes sobre a Receita 07: Conceitos de programação assíncrona em Dart, incluindo Futures, async e await.',
    gitRepoUrl: '',
  },
  {
    id: '08',
    name: 'Receita 08: Programação Assíncrona #2',
    description: 'Outra abordagem para programação assíncrona.',
    longDescription: 'Detalhes sobre a Receita 08: Aprofundando em programação assíncrona, possivelmente explorando Streams ou cenários mais complexos.',
    gitRepoUrl: '',
  },
  {
    id: '08a',
    name: 'Receita 08a: Programação Assíncrona #3',
    description: 'Infinite Scrolling como exemplo de assincronismo.',
    longDescription: 'Detalhes sobre a Receita 08a: Implementação de "infinite scrolling" ou paginação como um exemplo prático de programação assíncrona.',
    gitRepoUrl: '',
  },
  {
    id: 'mini-projeto',
    name: 'Mini-Projeto: Consumo de API',
    description: 'Montagem de novo app usando uma API diferente.',
    longDescription: 'Detalhes sobre o Mini-Projeto: Desenvolvimento de um pequeno aplicativo que consome e exibe dados de uma API externa.',
    gitRepoUrl: '',
  },
  {
    id: '09',
    name: 'Receita 09: Dart Intermediário',
    description: 'Bibliotecas, visibilidade, getters/setters, const.',
    longDescription: 'Detalhes sobre a Receita 09: Tópicos intermediários de Dart como organização de código em bibliotecas, controle de visibilidade, getters e setters, e constantes.',
    gitRepoUrl: '',
  },
  {
    id: '10',
    name: 'Receita 10: Polimorfismo #1',
    description: 'Motivação para polimorfismo.',
    longDescription: 'Detalhes sobre a Receita 10: Introdução ao conceito de polimorfismo, suas vantagens e como ele pode ser aplicado em Dart.',
    gitRepoUrl: '',
  },
  {
    id: '10b',
    name: 'Receita 10b: Polimorfismo #2',
    description: 'Polimorfismo em ação, com alguma burocracia.',
    longDescription: 'Detalhes sobre a Receita 10b: Exemplos práticos de polimorfismo, mesmo que com alguma configuração inicial ou código boilerplate.',
    gitRepoUrl: '',
  },
  {
    id: '10c',
    name: 'Receita 10c: Polimorfismo #3',
    description: 'Polimorfismo e contratos (interfaces).',
    longDescription: 'Detalhes sobre a Receita 10c: O papel de interfaces (classes abstratas em Dart) na definição de contratos para comportamento polimórfico.',
    gitRepoUrl: '',
  },
  {
    id: '10d',
    name: 'Receita 10d: Polimorfismo #4',
    description: 'Data objects e polimorfismo.',
    longDescription: 'Detalhes sobre a Receita 10d: Como o polimorfismo se aplica a objetos de dados e diferentes representações de informação.',
    gitRepoUrl: '',
  },
];
