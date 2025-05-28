
"use client";

import { useState, useEffect } from 'react';
import type { AppFolder } from '@/types';
import { initialFolders } from '@/data/folders';
import GitIntegrationCard from '@/components/project/GitIntegrationCard';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Search, Rocket, ListX, Github } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'projectOrganizerFolderData_v2';

async function fetchAllUserGists(username: string): Promise<any[]> {
  let allGists: any[] = [];
  let nextPageUrl: string | null = `https://api.github.com/users/${username}/gists?per_page=100`;

  while (nextPageUrl) {
    const response = await fetch(nextPageUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Usuário do GitHub "${username}" não encontrado.`);
      }
      throw new Error(`Erro ao buscar Gists da API do GitHub: ${response.status} ${response.statusText}`);
    }
    
    const gistsOnPage = await response.json();
    if (!Array.isArray(gistsOnPage)) {
         throw new Error("A resposta da API do GitHub não retornou uma lista de Gists como esperado. Verifique o console do navegador para mais detalhes.");
    }
    allGists = allGists.concat(gistsOnPage);

    const linkHeader = response.headers.get('Link');
    nextPageUrl = null; // Reset for next iteration
    if (linkHeader) {
        const links = linkHeader.split(',');
        const nextLinkObj = links.find(link => link.includes('rel="next"'));
        if (nextLinkObj) {
            const match = nextLinkObj.match(/<([^>]+)>/);
            if (match) {
                nextPageUrl = match[1];
            }
        }
    }
  }
  return allGists;
}


export default function Home() {
  const { toast } = useToast();
  const [folders, setFolders] = useState<AppFolder[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Começa com as URLs de `initialFolders` (que devem estar vazias para novos usuários)
      let processedFolders: AppFolder[] = initialFolders.map(f => ({ ...f, gitRepoUrl: '' })); 

      try {
        const storedFolderDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedFolderDataString) {
          const storedFolderUrls: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const storedUrlsMap = new Map(storedFolderUrls.map(item => [item.id, item.gitRepoUrl]));

          // Mescla com `initialFolders`, dando prioridade às URLs de `initialFolders` se elas não estiverem vazias.
          // Se a URL em `initialFolders` estiver vazia, usa a do localStorage (se existir).
          processedFolders = initialFolders.map(codeFolder => {
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder, // Mantém nome, descrição, etc. de initialFolders
              gitRepoUrl: codeFolder.gitRepoUrl || urlFromStorage || '', // Prioriza initialFolders, depois localStorage
            };
          });
        } else {
          // Se não houver nada no localStorage, usa initialFolders como está (com URLs vazias)
          processedFolders = initialFolders.map(f => ({ ...f, gitRepoUrl: f.gitRepoUrl || '' }));
        }
        setFolders(processedFolders);
        
        // Salva o estado inicial (possivelmente mesclado) de volta no localStorage
        // Isso garante que, mesmo que o localStorage estivesse vazio, ele será populado
        // com as URLs base (vazias ou preenchidas de initialFolders).
        const dataToStoreForLocalStorage = processedFolders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStoreForLocalStorage));
        
      } catch (error) {
        console.error("Falha ao carregar ou mesclar dados das pastas:", error);
        // Em caso de erro, usa initialFolders diretamente, garantindo que as URLs base sejam usadas
        const fallbackFolders = initialFolders.map(f => ({ ...f, gitRepoUrl: f.gitRepoUrl || '' }));
        setFolders(fallbackFolders);
      }
    }
  }, [isClient]); 

  useEffect(() => {
    // Salva as alterações no localStorage sempre que `folders` mudar
    if (isClient && folders.length > 0) {
      try {
        const dataToStore = folders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Falha ao salvar dados das pastas no localStorage:", error);
      }
    }
  }, [folders, isClient]);


  const handleUpdateFolder = (updatedFolderData: Pick<AppFolder, 'id' | 'gitRepoUrl'>) => {
    setFolders(prevFolders =>
      prevFolders.map(f => (f.id === updatedFolderData.id ? { ...f, gitRepoUrl: updatedFolderData.gitRepoUrl } : f))
    );
  };

  const handleSaveAllFoldersToJson = () => {
    if (!isClient) return;

    const dataToSave = folders.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      longDescription: f.longDescription,
      gitRepoUrl: f.gitRepoUrl
    }));
    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gists_${githubUsername || 'aluno_desconhecido'}.json`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Configuração Salva",
      description: `Os dados das receitas do aluno ${githubUsername || 'atual'} foram salvos em ${a.download}.`,
    });
  };

  const handleAutoFillGists = async () => {
    if (!githubUsername.trim()) {
      toast({ title: "Nome de Usuário Necessário", description: "Por favor, insira o nome de usuário GitHub do aluno.", variant: "destructive" });
      return;
    }
    toast({ title: "Buscando Gists...", description: `Procurando Gists para o aluno ${githubUsername}. Pode levar alguns segundos se o aluno tiver muitos Gists.` });
    
    try {
      const userGists = await fetchAllUserGists(githubUsername); 
      let gistsFoundCount = 0;

      const updatedFolders = initialFolders.map(recipeFolder => { 
        let foundGist = null;
        let gistUrlForRecipe = ''; 
        let searchRegexps: RegExp[] = [];
        
        const recipeId = recipeFolder.id; // e.g., "01", "02", "08a", "mini-projeto"
        // Escapa o ID da receita para uso seguro em regex
        const escapedRecipeId = recipeId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        if (recipeId === 'mini-projeto') {
          const miniProjectSearchTerms = ['Mini-Projeto', 'Mini Projeto', 'Mini_Projeto', 'POO Mini-Projeto', 'POO Mini Projeto'];
          foundGist = userGists.find(gist =>
            gist.description &&
            miniProjectSearchTerms.some(term => new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(gist.description))
          );
        } else {
          // Padrão 1: Usando o ID exato da receita (e.g., "POO_Receita_02", "POO_Receita_08a")
          searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${escapedRecipeId}(?!\\w)`, 'i'));
          searchRegexps.push(new RegExp(`Receita[\\s_]?${escapedRecipeId}(?!\\w)`, 'i'));
          
          // Lógica específica para IDs numéricos que podem ter diferentes formatações de padding
          // Se o ID da receita é "0X" (e.g., recipeId === "02")
          if (/^0[1-9]$/.test(recipeId)) { 
              const num = parseInt(recipeId, 10); // Converte "02" para 2
              const singleDigitId = num.toString(); // "2"
              const doubleZeroPaddedId = `00${num}`; // "002"

              // Adicionar busca por formato de dígito único (e.g., "POO Receita 2")
              searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${singleDigitId}(?!\\w)`, 'i'));
              searchRegexps.push(new RegExp(`Receita[\\s_]?${singleDigitId}(?!\\w)`, 'i'));

              // Adicionar busca por formato com dois zeros (e.g., "POO Receita 002")
              searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${doubleZeroPaddedId}(?!\\w)`, 'i'));
              searchRegexps.push(new RegExp(`Receita[\\s_]?${doubleZeroPaddedId}(?!\\w)`, 'i'));
          }
          // Adicionar aqui mais `else if` para outros casos se necessário 
          // (e.g. ids que são apenas "1" mas podem ser "01" ou "001" na descrição do Gist)

          foundGist = userGists.find(gist =>
            gist.description &&
            searchRegexps.some(pattern => pattern.test(gist.description))
          );
        }

        if (foundGist && foundGist.html_url) {
          gistsFoundCount++;
          gistUrlForRecipe = foundGist.html_url;
        }
        
        // Mantém os dados de `initialFolders` e apenas atualiza `gitRepoUrl`
        return { 
            ...recipeFolder, // Usa nome, descrição, etc. de initialFolders
            gitRepoUrl: gistUrlForRecipe || recipeFolder.gitRepoUrl || '' // Preenche se encontrado, senão mantém o que estava em initialFolders (que deve ser vazio para novos usuários)
        };
      });

      setFolders(updatedFolders); 
      toast({
        title: "Busca de Gists Concluída",
        description: `${gistsFoundCount} Gist(s) encontrados para ${githubUsername} e URLs preenchidas. As alterações foram salvas localmente no navegador.`,
      });

    } catch (error: any) {
      console.error("Erro ao buscar Gists:", error);
      let errorMessage = "Ocorreu um erro desconhecido ao buscar os Gists.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: "Erro na Busca de Gists",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-primary">
        <Rocket className="h-16 w-16 animate-pulse mb-4" />
        <p className="text-2xl font-semibold">Carregando Project Organizer...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 sm:p-6">
      <header className="w-full max-w-4xl mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
            <Rocket className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">Project Organizer - Receitas POO</h1>
                <p className="text-sm sm:text-md text-muted-foreground">
                Ferramenta para Monitores: Visualize Gists de receitas de POO dos alunos.
                </p>
            </div>
        </div>
      </header>

      <Card className="w-full max-w-4xl mb-6 p-4 sm:p-6 shadow-lg border-border bg-card">
        <CardHeader className="p-0 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl text-card-foreground flex items-center gap-2">
            <Github className="h-5 w-5 sm:h-6 sm:w-6" />
            Buscar Gists do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="githubUser" className="block text-xs sm:text-sm font-medium text-card-foreground mb-1">
              Nome de Usuário GitHub do Aluno
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id="githubUser"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Digite o nome de usuário GitHub do aluno"
                className="flex-grow bg-background text-foreground border-border placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
              <Button
                onClick={handleAutoFillGists}
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 px-3 sm:px-4"
                size="default"
              >
                <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Buscar Gists</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              O aluno deve nomear seus Gists seguindo o padrão: "POO Receita 01", "POO_Receita_004", "Receita 08a", "Mini-Projeto", etc.
            </p>
          </div>
          <Button
            onClick={handleSaveAllFoldersToJson}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-9 sm:h-10"
            size="default"
            disabled={!folders.some(f => f.gitRepoUrl.trim() !== "")}
          >
            <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Salvar Gists do Aluno em JSON</span>
          </Button>
        </CardContent>
      </Card>

      <main className="w-full max-w-4xl">
        {folders.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-26rem)] sm:h-[calc(100vh-28rem)] pr-2 sm:pr-4">
            <div className="space-y-3 sm:space-y-4">
              {folders.map(folder => (
                <GitIntegrationCard
                  key={folder.id}
                  folder={folder}
                  onUpdateFolder={handleUpdateFolder}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center text-muted-foreground p-6 sm:p-10 shadow-lg bg-card">
            <ListX className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4" />
            <p className="text-lg sm:text-xl font-medium">Nenhuma receita para exibir.</p>
            <p className="text-xs sm:text-sm">Insira o nome de usuário GitHub do aluno e clique em "Buscar Gists".</p>
          </Card>
        )}
      </main>
      <Toaster />
    </div>
  );
}

    