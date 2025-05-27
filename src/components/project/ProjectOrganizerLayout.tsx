
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
    // Initialize with initialFolders, will be overridden by localStorage logic client-side
    return initialFolders.map(f => ({ ...f })); // Return a copy
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load folders from localStorage on initial client-side mount,
  // merging with initialFolders from code.
  useEffect(() => {
    if (isClient) {
      let processedFolders: AppFolder[];
      try {
        const storedFolderDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        // Start with a fresh copy of initialFolders from the code
        const codeFolders = initialFolders.map(f => ({ ...f }));

        if (storedFolderDataString) {
          const storedFolderData: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const storedUrlsMap = new Map(storedFolderData.map(item => [item.id, item.gitRepoUrl]));

          processedFolders = codeFolders.map(codeFolder => {
            const urlFromStorage = storedUrlsMap.get(codeFolder.id);
            let finalUrl = codeFolder.gitRepoUrl; // Default to URL from code

            // If the URL in the code is empty, AND localStorage has a URL for this folder,
            // then use the URL from localStorage.
            // Otherwise, the URL from the code (even if empty or different) takes precedence.
            if (!codeFolder.gitRepoUrl && urlFromStorage !== undefined) {
              finalUrl = urlFromStorage;
            }

            return {
              ...codeFolder,
              gitRepoUrl: finalUrl,
            };
          });
        } else {
          // No stored data, use folders from code directly
          processedFolders = codeFolders;
        }

        setFolders(processedFolders);

        // Save the merged/processed folders back to localStorage.
        // This ensures localStorage is consistent with the applied logic.
        const dataToStore = processedFolders.map(folder => ({
          id: folder.id,
          gitRepoUrl: folder.gitRepoUrl,
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));

        // Ensure a folder is selected
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
        if (fallbackFolders.length > 0 && !selectedFolderId) {
            setSelectedFolderId(fallbackFolders[0].id);
        } else if (fallbackFolders.length === 0) {
            setSelectedFolderId(null);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Only run on client mount; selectedFolderId is handled inside.

  // Save current folders state to localStorage whenever it changes by user interaction
  useEffect(() => {
    if (isClient && folders.length > 0) { // Only save if folders have been initialized and processed
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
              {folders.map(folder => ( // Use 'folders' state which is now correctly initialized
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
            <FolderView folder={selectedFolder} onUpdateFolder={handleUpdateFolder} />
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

    