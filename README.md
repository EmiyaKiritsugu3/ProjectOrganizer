
# Project Organizer para Avaliação de Receitas de POO com Dart

Este é um aplicativo Next.js desenvolvido para **Monitores** da disciplina de Programação Orientada a Objetos (POO) com Dart. Ele permite que os monitores insiram o nome de usuário GitHub de um aluno e visualizem os Gists correspondentes a cada "receita" (mini-tutorial) da disciplina. Os Gists podem ser abertos diretamente no DartPad a partir da interface.

## Para Alunos

1.  **Crie seus Gists**: Para cada receita da disciplina, crie um Gist no GitHub contendo o código `main.dart`.
2.  **Nomeie seus Gists Corretamente**: Na **descrição** do seu Gist, utilize uma nomenclatura clara para que o Project Organizer possa encontrá-lo. Exemplos:
    *   Para receitas numeradas (ex: 01, 02, 08a, 10b): "POO Receita 01", "Receita 08a", "POO_Receita_10b".
    *   Para o Mini-Projeto: "Mini-Projeto POO" ou "POO Mini Projeto".
3.  **Forneça seu Nome de Usuário GitHub**: Informe seu nome de usuário GitHub aos monitores. Eles usarão o Project Organizer para acessar seus Gists.

## Para Monitores: Como Usar o Project Organizer

A maneira mais fácil de usar o Project Organizer é acessando a versão hospedada online (o link será fornecido pelo responsável pela disciplina ou pelo desenvolvedor da ferramenta).

Se você precisar executar o projeto localmente:

### Pré-requisitos

*   **Node.js**: Certifique-se de ter o Node.js instalado. Recomenda-se a versão 18.x ou superior. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
*   **npm** (geralmente vem com o Node.js) ou **yarn** (opcional).

### Passos para Execução Local

1.  **Clone ou Baixe o Projeto**:
    ```bash
    git clone <URL_DO_REPOSITORIO_DO_PROJECT_ORGANIZER>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```

2.  **Instale as Dependências**:
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Execute o Servidor de Desenvolvimento**:
    ```bash
    npm run dev
    ```

4.  **Acesse no Navegador**:
    Abra seu navegador e acesse: [http://localhost:9002](http://localhost:9002)

### Utilizando a Ferramenta

1.  **Insira o Nome de Usuário do Aluno**: No campo "Nome de Usuário GitHub do Aluno", digite o nome de usuário do aluno que você deseja avaliar.
2.  **Busque os Gists**: Clique no botão "Buscar Gists". O sistema tentará encontrar os Gists públicos do aluno que correspondam às receitas da disciplina com base na nomenclatura das descrições dos Gists.
3.  **Visualize e Abra os Gists**:
    *   As URLs dos Gists encontrados serão preenchidas nos campos correspondentes.
    *   Você pode editar manualmente qualquer URL, se necessário. Essas edições são salvas no `localStorage` do seu navegador para sua conveniência, caso precise reabrir para o mesmo aluno.
    *   Clique no botão "Abrir" ao lado de uma URL para visualizar o Gist no DartPad em uma nova aba.
4.  **Salvar Configuração (Opcional)**: O botão "Salvar Gists do Aluno em JSON" permite baixar um arquivo JSON com as URLs dos Gists atualmente exibidas para o aluno.

## Para Desenvolvedores/Responsáveis pela Disciplina: Hospedagem Online

A maneira mais fácil para os monitores acessarem o Project Organizer é hospedando-o online. Plataformas como **Vercel** ou **Netlify** oferecem integração direta com o GitHub e planos gratuitos ideais para este tipo de projeto.

**Como funciona:**

1.  **Mantenha o Projeto no GitHub:**
    *   Certifique-se de que todo o código do Project Organizer esteja em um repositório no GitHub. O arquivo `src/data/folders.ts` define a estrutura das receitas (nomes, descrições), e as URLs dos Gists devem estar vazias nele, pois serão preenchidas dinamicamente pela busca.

2.  **Escolha uma Plataforma de Hospedagem:**
    *   **Vercel ([vercel.com](https://vercel.com))**: Criadores do Next.js, integração perfeita.
    *   **Netlify ([netlify.com](https://netlify.com))**: Ótimo suporte para Next.js.

3.  **Crie uma Conta e Conecte seu Repositório GitHub.**
4.  **Primeiro Deploy e URL Pública**: A plataforma fará o build e deploy. Você receberá uma URL pública para compartilhar com os monitores.
5.  **Atualizações na Ferramenta**: Se você fizer melhorias no Project Organizer (o código da ferramenta em si), basta fazer o `git push` para o GitHub. A plataforma de hospedagem detectará automaticamente, fará um novo build e publicará na mesma URL.

### Como as URLs dos Gists são Carregadas (Importante para os Monitores)

*   **Estrutura das Receitas (`src/data/folders.ts`)**: Este arquivo define os nomes e descrições de cada receita. As `gitRepoUrl` neste arquivo devem estar vazias.
*   **Busca Dinâmica**: Ao inserir o nome de usuário GitHub de um aluno e clicar em "Buscar Gists", o aplicativo busca os Gists desse aluno e preenche as URLs na interface.
*   **Conveniência do `localStorage` (Navegador do Monitor)**:
    *   As URLs dos Gists do aluno buscado (ou qualquer URL que o monitor digite manualmente) são salvas no `localStorage` do navegador do monitor. Isso é para conveniência, para que, se o monitor fechar e reabrir o navegador para continuar avaliando o *mesmo aluno*, as URLs sejam lembradas.
    *   Ao buscar Gists de um *novo aluno*, as URLs desse novo aluno substituirão as anteriores na tela e no `localStorage`.
*   **Botão "Salvar Gists do Aluno em JSON"**: Este botão permite que o monitor baixe um arquivo JSON com o estado *atual* das URLs visíveis na interface (para o aluno que está sendo avaliado). Este é um backup local para o monitor e não afeta o código-fonte do Project Organizer.
```