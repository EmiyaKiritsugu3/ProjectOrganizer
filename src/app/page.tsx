
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
import { Download, Search, Rocket, ListX } from 'lucide-react';
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
        const codeFolders = initialFolders.map(f => ({ ...f }));

        if (storedFolderDataString) {
          const storedFolderUrls: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const storedUrlsMap = new Map(storedFolderUrls.map(item => [item.id, item.gitRepoUrl]));

          processedFolders = codeFolders.map(codeFolder => {
            if (codeFolder.gitRepoUrl && codeFolder.gitRepoUrl.trim() !== "") {
              return { ...codeFolder };
            }
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder,
              gitRepoUrl: urlFromStorage !== undefined ? urlFromStorage : codeFolder.gitRepoUrl,
            };
          });
        } else {
          processedFolders = codeFolders;
        }
        setFolders(processedFolders);

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
    a.download = 'project_organizer_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Configuração Salva",
      description: "Os dados de todas as receitas foram salvos em project_organizer_config.json.",
    });
  };

  const handleAutoFillGists = async () => {
    if (!githubUsername.trim()) {
      toast({ title: "Nome de Usuário Necessário", description: "Por favor, insira seu nome de usuário do GitHub.", variant: "destructive" });
      return;
    }
    toast({ title: "Buscando Gists...", description: `Procurando Gists para o usuário ${githubUsername}.` });
    try {
      const response = await fetch(`https://api.github.com/users/${githubUsername}/gists`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Usuário do GitHub "${githubUsername}" não encontrado.`);
        }
        throw new Error(`Erro ao buscar Gists: ${response.status} ${response.statusText}`);
      }
      const userGists = await response.json();

      if (!Array.isArray(userGists)) {
        throw new Error("A resposta da API do GitHub não foi uma lista de Gists como esperado.");
      }

      let gistsFoundCount = 0;
      const updatedFolders = folders.map(folder => {
        const recipeNumber = parseInt(folder.id, 10);
        if (isNaN(recipeNumber)) return folder;

        const searchPattern1 = new RegExp(`POO_Receita_0*${recipeNumber}`, 'i');
        const searchPattern2 = new RegExp(`POO Receita 0*${recipeNumber}`, 'i');
        const searchPattern3 = new RegExp(`Receita_0*${recipeNumber}`, 'i');
        const searchPattern4 = new RegExp(`Receita 0*${recipeNumber}`, 'i');

        const foundGist = userGists.find(gist =>
          gist.description &&
          (searchPattern1.test(gist.description) ||
           searchPattern2.test(gist.description) ||
           searchPattern3.test(gist.description) ||
           searchPattern4.test(gist.description))
        );

        if (foundGist && foundGist.html_url) {
          gistsFoundCount++;
          return { ...folder, gitRepoUrl: foundGist.html_url };
        }
        return folder;
      });

      setFolders(updatedFolders);
      toast({
        title: "Busca de Gists Concluída",
        description: `${gistsFoundCount} Gist(s) encontrados e URLs correspondentes foram preenchidas. As alterações foram salvas localmente.`,
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
                Gerencie e acesse seus Gists de receitas de Programação Orientada a Objetos com Dart.
                </p>
            </div>
        </div>
      </header>

      <section className="w-full max-w-4xl mb-6 p-6 bg-card rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-primary">Ferramentas de Gist</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="githubUser" className="block text-sm font-medium text-foreground mb-1">
              Preencher Gists a partir do GitHub
            </Label>
            <div className="flex items-stretch gap-2">
              <Input
                id="githubUser"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="Seu nome de usuário do GitHub"
                className="flex-grow"
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
              Seus Gists devem ter descrições como "POO_Receita_01", "POO Receita 1", etc.
            </p>
          </div>
          <Button
            onClick={handleSaveAllFoldersToJson}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Salvar Configuração Atual em JSON
          </Button>
        </div>
      </section>

      <main className="w-full max-w-4xl">
        {folders.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-28rem)] pr-4"> {/* Adjust height as needed */}
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
          <div className="flex flex-col items-center justify-center text-muted-foreground p-10 rounded-lg bg-card shadow-lg">
            <ListX size={64} className="mb-4" />
            <p className="text-xl font-medium">Nenhuma receita para exibir.</p>
            <p className="text-sm">Verifique os dados iniciais ou tente buscar Gists do GitHub.</p>
          </div>
        )}
      </main>
      <Toaster />
    </div>
  );
}
