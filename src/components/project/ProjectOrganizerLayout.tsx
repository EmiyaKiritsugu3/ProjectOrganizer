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
import { Folder, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button'; // For potential header trigger

export default function ProjectOrganizerLayout() {
  const [folders, setFolders] = useState<AppFolder[]>(initialFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Select the first folder by default if not already selected
    if (initialFolders.length > 0 && !selectedFolderId) {
      setSelectedFolderId(initialFolders[0].id);
    }
  }, [selectedFolderId]);


  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleUpdateFolder = (updatedFolder: AppFolder) => {
    setFolders(prevFolders =>
      prevFolders.map(f => (f.id === updatedFolder.id ? updatedFolder : f))
    );
  };

  const selectedFolder = useMemo(() => {
    return folders.find(f => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  if (!isClient) {
    // Render a loading state or null during SSR/ första client render to avoid hydration mismatch related to sidebar
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
           {/* Optional: Header for the main content area with a toggle button */}
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
              <p>Select an app from the sidebar to view its details.</p>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
