
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
    git clone <URL_DO_REPOSITORIO_DO_SEU_PROJETO_NO_GITHUB>
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

## Como Disponibilizar Online para o Professor (Recomendado)

A maneira mais fácil para seu professor e monitores acessarem seu projeto é hospedando-o online. Plataformas como **Vercel** ou **Netlify** oferecem integração direta com o GitHub e planos gratuitos ideais para este tipo de projeto.

**Como funciona:**

1.  **Mantenha seu Projeto no GitHub:**
    *   Certifique-se de que todo o código do seu Project Organizer, incluindo o arquivo `src/data/folders.ts` com as URLs dos seus Gists preenchidas, esteja em um repositório no GitHub.

2.  **Escolha uma Plataforma de Hospedagem:**
    *   **Vercel ([vercel.com](https://vercel.com))**: Criadores do Next.js, integração perfeita.
    *   **Netlify ([netlify.com](https://netlify.com))**: Ótimo suporte para Next.js.

3.  **Crie uma Conta e Conecte seu Repositório:**
    *   Cadastre-se na plataforma escolhida (geralmente, você pode usar sua conta do GitHub para isso).
    *   Siga as instruções da plataforma para importar ou conectar seu repositório GitHub onde está o código do Project Organizer.
    *   A plataforma geralmente detectará que é um projeto Next.js e configurará o processo de build e deploy automaticamente.

4.  **Primeiro Deploy e URL Pública:**
    *   Após a configuração, a plataforma fará o primeiro build e deploy do seu aplicativo.
    *   Você receberá uma URL pública (ex: `seunome-projeto.vercel.app` ou `seu-projeto.netlify.app`). Compartilhe esta URL com seu professor.

5.  **Atualizando com Novos Gists:**
    *   Quando você adicionar novas receitas (novos Gists):
        1.  Edite o arquivo `src/data/folders.ts` no seu computador, adicionando as novas URLs dos Gists.
        2.  Faça o commit dessas alterações e envie-as para o seu repositório GitHub com `git push`.
    *   A plataforma de hospedagem (Vercel/Netlify) detectará automaticamente o `push`, fará um novo build do seu aplicativo com os dados atualizados e o publicará na mesma URL. Assim, seu professor sempre terá acesso à versão mais recente com todos os seus Gists.

### Informações Adicionais

*   **URLs dos Gists**: As URLs dos Gists para cada receita estão pré-definidas no arquivo `src/data/folders.ts`. Se você (aluno) modificou este arquivo com suas próprias URLs de Gist e fez o `push` para o GitHub, essas serão as que o professor verá ao acessar a URL hospedada ou ao executar o projeto localmente a partir do seu código atualizado.
*   **Persistência de Dados (LocalStorage)**: As URLs dos Gists inseridas na interface são salvas no `localStorage` do navegador do usuário. Isso é útil para o desenvolvimento local, mas não afeta o que o professor vê (ele verá o que está em `src/data/folders.ts` da versão que ele está executando ou acessando online).
*   **DartPad Embutido**: A funcionalidade de visualização embutida do DartPad pode se comportar de maneira ligeiramente diferente em ambientes de preview (como o do Firebase Studio) em comparação com navegadores padrão ou a versão hospedada. Recomenda-se testar na versão hospedada ou em um navegador como Chrome ou Edge para a experiência completa.

Seguindo a opção de hospedagem, seu professor terá acesso facilitado e sempre atualizado ao seu trabalho!
