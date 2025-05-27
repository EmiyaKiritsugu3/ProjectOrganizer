
# Project Organizer para Receitas de POO com Dart

Este é um aplicativo Next.js desenvolvido para ajudar a organizar e visualizar Gists de "receitas" (mini-tutoriais) da disciplina de Programação Orientada a Objetos (POO) com Dart. Ele permite vincular cada receita a um Gist do GitHub e visualizá-lo diretamente no DartPad, seja em uma nova aba ou embutido na página.

## Como Executar o Projeto Localmente

Siga os passos abaixo para executar este projeto na sua máquina.

### Pré-requisitos

*   **Node.js**: Certifique-se de ter o Node.js instalado. Recomenda-se a versão 18.x ou superior. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
*   **npm** (geralmente vem com o Node.js) ou **yarn** (opcional, [instruções de instalação](https://classic.yarnpkg.com/en/docs/install)).

### Passos para Execução

1.  **Clone ou Baixe o Projeto**:
    Se estiver usando Git, clone o repositório:
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```
    Caso contrário, baixe o arquivo ZIP do código-fonte e extraia-o.

2.  **Instale as Dependências**:
    Abra um terminal na pasta raiz do projeto (onde você vê o arquivo `package.json`) e execute um dos seguintes comandos, dependendo do seu gerenciador de pacotes:
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```
    Este comando baixará e instalará todas as bibliotecas necessárias para o projeto.

3.  **Execute o Servidor de Desenvolvimento**:
    Após a instalação das dependências, execute o seguinte comando no terminal:
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```
    Este comando iniciará o servidor de desenvolvimento do Next.js (com Turbopack para maior velocidade).

4.  **Acesse no Navegador**:
    Abra seu navegador da web (como Chrome, Firefox, Edge) e acesse o seguinte endereço:
    [http://localhost:9002](http://localhost:9002)

    Você deverá ver a interface do Project Organizer. As URLs dos Gists para cada "App" (receita) devem estar pré-carregadas conforme definido em `src/data/folders.ts`.

### Informações Adicionais

*   **URLs dos Gists**: As URLs dos Gists para cada receita estão pré-definidas no arquivo `src/data/folders.ts`. Se você (aluno) modificou este arquivo com suas próprias URLs de Gist, essas serão as que o professor verá ao executar o projeto.
*   **Persistência de Dados**: As URLs dos Gists inseridas na interface são salvas no `localStorage` do navegador. Isso significa que as alterações feitas por um usuário em um navegador não afetarão outros usuários ou outros navegadores. O professor verá os Gists definidos em `src/data/folders.ts` na primeira vez que abrir.
*   **DartPad Embutido**: A funcionalidade de visualização embutida do DartPad pode se comportar de maneira ligeiramente diferente em ambientes de preview (como o do Firebase Studio) em comparação com navegadores padrão. Recomenda-se testar em um navegador como Chrome ou Edge para a experiência completa.

Seu professor agora deve ter as instruções necessárias para executar o projeto facilmente!
