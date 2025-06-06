
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppFolder } from '@/types';
import { initialFolders } from '@/data/folders';
import GitIntegrationCard from '@/components/project/GitIntegrationCard';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Search, Rocket, ListX, Github } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'projectOrganizerFolderData_v2_EmiyaKiritsugu3'; // Make key specific if app defaults to one user
const DEFAULT_GITHUB_USER = "EmiyaKiritsugu3";

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
    nextPageUrl = null; 
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
  const [folders, setFolders] = useState<AppFolder[]>(initialFolders.map(f => ({ ...f, gitRepoUrl: '' })));
  const [isClient, setIsClient] = useState(false);
  const [githubUsername, setGithubUsername] = useState(DEFAULT_GITHUB_USER);
  const [isLoadingGists, setIsLoadingGists] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAutoFillGists = useCallback(async (usernameToFetch: string) => {
    if (!usernameToFetch.trim()) {
      toast({ title: "Nome de Usuário Necessário", description: "Por favor, insira o nome de usuário GitHub do aluno.", variant: "destructive" });
      return;
    }
    setIsLoadingGists(true);
    toast({ title: "Buscando Gists...", description: `Procurando Gists para o aluno ${usernameToFetch}. Pode levar alguns segundos.` });
    
    try {
      const userGists = await fetchAllUserGists(usernameToFetch); 
      let gistsFoundCount = 0;

      const updatedFolders = initialFolders.map(recipeFolder => {
        let foundGist: any = null;
        let gistUrlForRecipe = '';
        const searchRegexps: RegExp[] = [];
        
        const recipeId = recipeFolder.id;
        const escapedRecipeId = recipeId.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        if (recipeId === 'mini-projeto') {
          const miniProjectSearchTerms = ['Mini-Projeto', 'Mini Projeto', 'Mini_Projeto', 'POO Mini-Projeto', 'POO Mini Projeto'];
          foundGist = userGists.find(gist =>
            gist.description &&
            miniProjectSearchTerms.some(term => new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i').test(gist.description))
          );
        } else {
          searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${escapedRecipeId}(?!\\w)`, 'i'));
          searchRegexps.push(new RegExp(`Receita[\\s_]?${escapedRecipeId}(?!\\w)`, 'i'));
          
          if (/^0[1-9]$/.test(recipeId)) {
            const num = parseInt(recipeId, 10);
            const singleDigitId = num.toString();
            const doubleZeroPaddedId = `00${num}`;

            searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${singleDigitId}(?!\\w)`, 'i'));
            searchRegexps.push(new RegExp(`Receita[\\s_]?${singleDigitId}(?!\\w)`, 'i'));
            searchRegexps.push(new RegExp(`POO[\\s_]?Receita[\\s_]?${doubleZeroPaddedId}(?!\\w)`, 'i'));
            searchRegexps.push(new RegExp(`Receita[\\s_]?${doubleZeroPaddedId}(?!\\w)`, 'i'));
          }
        }

        if (!foundGist && recipeId !== 'mini-projeto') {
            foundGist = userGists.find(gist =>
                gist.description &&
                searchRegexps.some(pattern => pattern.test(gist.description))
            );
        }
        
        if (foundGist && foundGist.html_url) {
          gistsFoundCount++;
          gistUrlForRecipe = foundGist.html_url;
        }
        
        const currentFolderData = folders.find(f => f.id === recipeFolder.id);
        return { 
            ...recipeFolder, 
            gitRepoUrl: gistUrlForRecipe || (currentFolderData?.gitRepoUrl || '')
        };
      });

      setFolders(updatedFolders); 
      toast({
        title: "Busca de Gists Concluída",
        description: `${gistsFoundCount} Gist(s) encontrados para ${usernameToFetch} e URLs preenchidas. As alterações foram salvas localmente no navegador.`,
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
    } finally {
      setIsLoadingGists(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]); // folders removed from deps to avoid re-fetch on folder update

  useEffect(() => {
    if (isClient) {
      let processedFolders: AppFolder[];
      try {
        const storedFolderDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedFolderDataString) {
          const storedFolderUrls: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const storedUrlsMap = new Map(storedFolderUrls.map(item => [item.id, item.gitRepoUrl]));

          processedFolders = initialFolders.map(codeFolder => {
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder, 
              gitRepoUrl: codeFolder.gitRepoUrl || urlFromStorage || '', 
            };
          });
        } else {
          // If no localStorage, start with initialFolders (which have empty URLs by default)
          processedFolders = initialFolders.map(f => ({ ...f, gitRepoUrl: f.gitRepoUrl || '' }));
        }
        setFolders(processedFolders);
        
        // Auto-fetch gists for the default user if no specific data was in local storage
        // or if the data in local storage wasn't for the default user (more complex check needed for that).
        // For simplicity, if username is DEFAULT_GITHUB_USER, trigger fetch.
        // The fetch itself will then update localStorage.
        if (githubUsername === DEFAULT_GITHUB_USER) {
          // Check if localStorage was empty or didn't meaningfully populate folders
          const isLocalStorageEmptyOrIrrelevant = !storedFolderDataString || processedFolders.every(f => !f.gitRepoUrl);
          if (isLocalStorageEmptyOrIrrelevant) {
             handleAutoFillGists(DEFAULT_GITHUB_USER);
          }
        }
        
      } catch (error) {
        console.error("Falha ao carregar ou mesclar dados das pastas:", error);
        setFolders(initialFolders.map(f => ({ ...f, gitRepoUrl: f.gitRepoUrl || '' })));
        if (githubUsername === DEFAULT_GITHUB_USER) {
          handleAutoFillGists(DEFAULT_GITHUB_USER);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Removed handleAutoFillGists, githubUsername to control initial fetch carefully

  useEffect(() => {
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
  
  const triggerAutoFill = () => {
    handleAutoFillGists(githubUsername);
  };
  
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerAutoFill();
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
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="githubUser" className="block text-xs sm:text-sm font-medium text-card-foreground mb-1">
                  Nome de Usuário GitHub do Aluno
                </Label>
                <div className="flex items-stretch gap-2">
                  <Input
                    id="githubUser"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="Nome de usuário GitHub do Aluno"
                    className="flex-grow bg-background text-foreground border-border placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 px-3 sm:px-4"
                    size="default"
                    disabled={isLoadingGists}
                  >
                    <Search className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{isLoadingGists ? "Buscando..." : "Buscar Gists"}</span>
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
                disabled={!folders.some(f => f.gitRepoUrl.trim() !== "") || isLoadingGists}
              >
                <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Salvar Gists do Aluno em JSON</span>
              </Button>
            </div>
          </form>
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
                  isLoading={isLoadingGists}
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
