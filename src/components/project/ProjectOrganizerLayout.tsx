
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
} from '@/components/ui/sidebar';
import { Folder, FolderOpen, Rocket } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'projectOrganizerFolderData';

export default function ProjectOrganizerLayout() {
  const [folders, setFolders] = useState<AppFolder[]>(() => {
    return initialFolders.map(f => ({ ...f })); 
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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
            // Se a URL no código (initialFolders.ts) NÃO estiver vazia, ela tem precedência.
            if (codeFolder.gitRepoUrl && codeFolder.gitRepoUrl.trim() !== "") {
              return { ...codeFolder };
            }
            // Se a URL no código ESTIVER vazia, usar a do localStorage, se existir.
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            return {
              ...codeFolder,
              gitRepoUrl: urlFromStorage !== undefined ? urlFromStorage : codeFolder.gitRepoUrl, // Mantém a do código (vazia) se não houver no storage
            };
          });
        } else {
          processedFolders = codeFolders;
        }

        setFolders(processedFolders);

        // Salva o estado processado de volta no localStorage
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
    a.download = 'gist_recipes_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              onSaveAllFoldersToJson={handleSaveAllFoldersToJson} 
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
