
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { AppFolder } from '@/types';
import { initialFolders } from '@/data/folders';
import FolderView from './FolderView';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Folder, FolderOpen, Rocket, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'projectOrganizerFolderData';

export default function ProjectOrganizerLayout() {
  const { toast } = useToast();
  const [folders, setFolders] = useState<AppFolder[]>(() => {
    return initialFolders.map(f => ({ ...f })); 
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
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
              // If URL is defined in code, use it (precedence)
              return { ...codeFolder };
            }
            // If URL is not in code (empty string), try to load from localStorage
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder,
              gitRepoUrl: urlFromStorage !== undefined ? urlFromStorage : codeFolder.gitRepoUrl, 
            };
          });
        } else {
          // No localStorage data, use codeFolders as is
          processedFolders = codeFolders;
        }

        setFolders(processedFolders);

        // Update localStorage with the merged/processed data to ensure consistency
        const dataToStoreForLocalStorage = processedFolders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStoreForLocalStorage));
        
        if (processedFolders.length > 0) {
          if (!selectedFolderId || !processedFolders.find(f => f.id === selectedFolderId)) {
            setSelectedFolderId(processedFolders[0].id);
          }
        } else {
          setSelectedFolderId(null);
        }

      } catch (error) {
        console.error("Failed to load or merge folder data:", error);
        // Fallback to initialFolders from code if any error occurs
        const fallbackFolders = initialFolders.map(f => ({ ...f }));
        setFolders(fallbackFolders);
        if (fallbackFolders.length > 0 && (!selectedFolderId || !fallbackFolders.find(f => f.id === selectedFolderId))) {
            setSelectedFolderId(fallbackFolders[0].id);
        } else if (fallbackFolders.length === 0) {
            setSelectedFolderId(null);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // initialFolders intentionally removed, see PRD

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


  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleUpdateFolder = (updatedFolderData: Pick<AppFolder, 'id' | 'gitRepoUrl'>) => {
    setFolders(prevFolders =>
      prevFolders.map(f => (f.id === updatedFolderData.id ? { ...f, gitRepoUrl: updatedFolderData.gitRepoUrl } : f))
    );
  };
  
  const selectedFolder = useMemo(() => {
    return folders.find(f => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

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
      <div className="flex items-center justify-center h-screen">
        <Rocket className="h-12 w-12 animate-pulse text-primary" />
        <p className="ml-4 text-xl font-semibold text-primary">Loading Project Organizer...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen bg-background">
        <Sidebar collapsible="icon" side="left" variant="sidebar" className="shadow-lg">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Rocket className="h-7 w-7 text-sidebar-primary" />
              <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Project Organizer
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="p-2 group-data-[collapsible=icon]:hidden">
              <h3 className="mb-3 text-sm font-semibold text-sidebar-foreground/90 text-center">
                Ferramentas de Gist
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="githubUserSidebar" className="text-xs font-medium text-sidebar-foreground/80">
                    Usuário GitHub
                  </Label>
                  <div className="mt-1 flex items-stretch gap-1">
                    <Input 
                      id="githubUserSidebar" 
                      value={githubUsername} 
                      onChange={(e) => setGithubUsername(e.target.value)} 
                      placeholder="Seu usuário GitHub"
                      className="h-8 text-xs bg-sidebar-background border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground placeholder:opacity-60 focus:ring-sidebar-ring" 
                    />
                    <Button 
                      onClick={handleAutoFillGists} 
                      size="sm" 
                      className="whitespace-nowrap text-xs px-2 py-1 h-8 border border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground focus:ring-sidebar-ring"
                    >
                      <Search className="mr-1 h-3 w-3" />
                      Buscar
                    </Button>
                  </div>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">
                    Preenche URLs dos Gists automaticamente.
                  </p>
                </div>
                <Button 
                  onClick={handleSaveAllFoldersToJson} 
                  size="sm" 
                  className="w-full text-xs px-2 py-1 h-8 border border-sidebar-primary text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground focus:ring-sidebar-ring"
                >
                  <Download className="mr-1 h-3 w-3" />
                  Salvar Config. em JSON
                </Button>
              </div>
            </div>
            <SidebarSeparator className="my-3 bg-sidebar-border" />
            <SidebarMenu>
              {folders.map(folder => ( 
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    onClick={() => handleSelectFolder(folder.id)}
                    isActive={selectedFolderId === folder.id}
                    tooltip={{content: folder.name, side: 'right', align: 'center' }}
                    className="justify-start"
                  >
                    <Folder size={18} className="text-sidebar-accent-foreground/80" />
                    <span className="group-data-[collapsible=icon]:hidden truncate">{folder.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1 overflow-y-auto">
           <header className="sticky top-0 z-10 flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur-sm md:hidden">
             <SidebarTrigger className="mr-2" />
             <h2 className="text-lg font-semibold">
               {selectedFolder ? selectedFolder.name : "App Details"}
             </h2>
           </header>

          {selectedFolder ? (
            <FolderView 
              folder={selectedFolder} 
              onUpdateFolder={handleUpdateFolder}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
              <FolderOpen size={48} className="mb-4" />
              <p className="text-lg">Welcome to Project Organizer!</p>
              <p>{folders.length > 0 ? "Select an app from the sidebar to view its details." : "Loading app folders..."}</p>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
    
