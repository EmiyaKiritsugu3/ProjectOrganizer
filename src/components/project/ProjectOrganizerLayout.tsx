
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
    // Initialize with initialFolders, will be overridden by localStorage if available client-side
    return initialFolders;
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load folders from localStorage on initial client-side mount
  useEffect(() => {
    if (isClient) {
      try {
        const storedFolderDataString = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedFolderDataString) {
          const storedFolderData: Array<{ id: string; gitRepoUrl: string }> = JSON.parse(storedFolderDataString);
          const urlMap = new Map(storedFolderData.map(item => [item.id, item.gitRepoUrl]));

          setFolders(prevInitialFolders => {
            const updatedFolders = initialFolders.map(folder => ({
              ...folder,
              gitRepoUrl: urlMap.get(folder.id) !== undefined ? urlMap.get(folder.id)! : folder.gitRepoUrl,
            }));
             // Ensure a folder is selected if one was previously or if it's the first load
            if (updatedFolders.length > 0) {
              if (!selectedFolderId || !updatedFolders.find(f => f.id === selectedFolderId)) {
                setSelectedFolderId(updatedFolders[0].id);
              }
            }
            return updatedFolders;
          });
        } else {
          // No stored data, use initialFolders and select the first one
          setFolders(initialFolders);
          if (initialFolders.length > 0 && !selectedFolderId) {
            setSelectedFolderId(initialFolders[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load folder data from localStorage:", error);
        // Fallback to initialFolders if localStorage parsing fails
        setFolders(initialFolders);
        if (initialFolders.length > 0 && !selectedFolderId) {
            setSelectedFolderId(initialFolders[0].id);
        }
      }
    }
  }, [isClient]); // Removed selectedFolderId from dependencies as it's handled inside

  // Save folders to localStorage whenever they change
  useEffect(() => {
    if (isClient && folders.length > 0) { // Only save if folders are initialized
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
    // Ensure folders array is not empty before trying to find
    if (folders.length === 0 && initialFolders.length > 0 && isClient) {
      // This case might happen if localStorage is empty and folders haven't been set yet
      // but it should be covered by the loading useEffect.
      // However, as a fallback, ensure we return a folder from initialFolders if 'folders' is empty.
       const foundInInitial = initialFolders.find(f => f.id === selectedFolderId);
       if (foundInInitial) return foundInInitial;
       if (selectedFolderId === null && initialFolders.length > 0) return initialFolders[0];
       return null;
    }
    return folders.find(f => f.id === selectedFolderId) || (folders.length > 0 ? folders[0] : null) ;
  }, [folders, selectedFolderId, isClient]);

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
              {(folders.length > 0 ? folders : initialFolders).map(folder => (
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
              <p>Select an app from the sidebar to view its details or wait for folders to load.</p>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
