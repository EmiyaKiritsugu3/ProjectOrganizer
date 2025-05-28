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
      let processedFolders: AppFolder[];
      try {
        const storedFolderDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
        const codeFolders = initialFolders.map(f => ({ ...f })); // initialFolders has empty gitRepoUrl

        if (storedFolderDataString) {
          const storedFolderUrls: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const storedUrlsMap = new Map(storedFolderUrls.map(item => [item.id, item.gitRepoUrl]));

          processedFolders = codeFolders.map(codeFolder => {
            // Since codeFolder.gitRepoUrl is always empty from initialFolders for a fresh load by a monitor,
            // this will prioritize localStorage if it exists (e.g., monitor was looking at a student's gists before).
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder,
              gitRepoUrl: urlFromStorage !== undefined ? urlFromStorage : codeFolder.gitRepoUrl,
            };
          });
        } else {
          // Nothing in storage, so use initialFolders (all empty URLs)
          processedFolders = codeFolders;
        }
        setFolders(processedFolders);
        
        // Save the possibly merged state back to localStorage.
        // This means if localStorage was populated, it remains, otherwise, empty URLs are saved.
        const dataToStoreForLocalStorage = processedFolders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStoreForLocalStorage));
        
      } catch (error) {
        console.error("Failed to load or merge folder data:", error);
        const fallbackFolders = initialFolders.map(f => ({ ...f }));
        setFolders(fallbackFolders);
      }
    }
  }, [isClient]);

  useEffect(() => {
    // This effect ensures that any update to the 'folders' state (e.g., after fetching Gists)
    // is persisted to localStorage.
    if (isClient && folders.length > 0) {
      try {
        const dataToStore = folders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Failed to save folder data to localStorage:", error);
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
    a.download = `gists_${githubUsername || 'config'}.json`;
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
    toast({ title: "Buscando Gists...", description: `Procurando Gists para o aluno ${githubUsername}.` });
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/gists`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Aluno do GitHub "${githubUsername}" não encontrado.`);
        }
        throw new Error(`Erro ao buscar Gists: ${response.status} ${response.statusText}`);
      }
      const userGists = await response.json();

      if (!Array.isArray(userGists)) {
        throw new Error("A resposta da API do GitHub não foi uma lista de Gists como esperado.");
      }

      let gistsFoundCount = 0;
      const updatedFolders = initialFolders.map(folder => { // Start from a clean slate of recipes
        let foundGist = null;
        const originalFolderData = initialFolders.find(f => f.id === folder.id) || folder;


        if (folder.id === 'mini-projeto') {
          const miniProjectSearchTerms = ['Mini-Projeto', 'Mini Projeto'];
          foundGist = userGists.find(gist =>
            gist.description &&
            miniProjectSearchTerms.some(term => new RegExp(term, 'i').test(gist.description))
          );
        } else {
          const idForSearch = folder.id; 
          const searchRegexps: RegExp[] = [];
          searchRegexps.push(new RegExp(`POO[_\\s]?Receita[_\\s]?${idForSearch}(?!\\w)`, 'i'));
          searchRegexps.push(new RegExp(`Receita[_\\s]?${idForSearch}(?!\\w)`, 'i'));
          if (/^0\\d$/.test(idForSearch)) {
            const numericIdNonPadded = parseInt(idForSearch, 10).toString();
            if (numericIdNonPadded !== idForSearch) {
              searchRegexps.push(new RegExp(`POO[_\\s]?Receita[_\\s]?${numericIdNonPadded}(?!\\w)`, 'i'));
              searchRegexps.push(new RegExp(`Receita[_\\s]?${numericIdNonPadded}(?!\\w)`, 'i'));
            }
          }
          
          foundGist = userGists.find(gist =>
            gist.description &&
            searchRegexps.some(pattern => pattern.test(gist.description))
          );
        }

        if (foundGist && foundGist.html_url) {
          gistsFoundCount++;
          return { ...originalFolderData, gitRepoUrl: foundGist.html_url };
        }
        // If no gist found for this recipe, return the original recipe structure with an empty URL
        return { ...originalFolderData, gitRepoUrl: '' };
      });

      setFolders(updatedFolders); // This will trigger the useEffect to save to localStorage
      toast({
        title: "Busca de Gists Concluída",
        description: `${gistsFoundCount} Gist(s) encontrados para ${githubUsername} e URLs preenchidas. As alterações foram salvas localmente no navegador.`,
      });

    } catch (error) {
      console.error("Erro ao buscar Gists:", error);
      let errorMessage = "Ocorreu um erro ao buscar os Gists.";
      if (error instanceof Error) {
        errorMessage = error.message;
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
    <div className="min-h-screen bg-background flex flex-col items-center p-6">
      <header className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-4">
            <Rocket className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-primary">Project Organizer - Receitas POO</h1>
                <p className="text-md text-muted-foreground">
                Ferramenta para Monitores: Visualize Gists de receitas de POO dos alunos.
                </p>
            </div>
        </div>
      </header>

      <Card className="w-full max-w-4xl mb-6 p-6 shadow-md bg-card">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-xl text-primary-foreground flex items-center gap-2">
            <Github className="h-6 w-6" />
            Buscar Gists do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div>
            <Label htmlFor="githubUser" className="block text-sm font-medium text-primary-foreground mb-1">
              Nome de Usuário GitHub do Aluno
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id="githubUser"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Digite o nome de usuário GitHub do aluno"
                className="flex-grow bg-background text-foreground border-border placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleAutoFillGists}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="mr-2 h-4 w-4" />
                Buscar Gists
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              O aluno deve nomear seus Gists seguindo o padrão: "POO Receita 01", "Receita 08a", "Mini-Projeto", etc.
            </p>
          </div>
          <Button
            onClick={handleSaveAllFoldersToJson}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={!folders.some(f => f.gitRepoUrl.trim() !== "")}
          >
            <Download className="mr-2 h-4 w-4" />
            Salvar Gists do Aluno em JSON
          </Button>
        </CardContent>
      </Card>

      <main className="w-full max-w-4xl">
        {folders.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-32rem)] pr-4"> {/* Adjusted height slightly */}
            <div className="space-y-4">
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
          <Card className="flex flex-col items-center justify-center text-muted-foreground p-10 shadow-lg bg-card">
            <ListX size={64} className="mb-4" />
            <p className="text-xl font-medium">Nenhuma receita para exibir.</p>
            <p className="text-sm">Insira o nome de usuário GitHub do aluno e clique em "Buscar Gists".</p>
          </Card>
        )}
      </main>
      <Toaster />
    </div>
  );
}